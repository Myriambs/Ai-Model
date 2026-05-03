# backend.py
import os
from fastapi import FastAPI, Query, Body
from pydantic import BaseModel
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from main import generate_bug_report
from fastapi import HTTPException, UploadFile, File
import requests
import cloudinary
import cloudinary.uploader

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client.qa_dashboard
bugs_collection = db.bugs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRELLO_KEY = os.getenv("TRELLO_KEY")
TRELLO_TOKEN = os.getenv("TRELLO_TOKEN")
DONE_LIST_ID = os.getenv("TRELLO_DONE_LIST_ID")

class BugRequest(BaseModel):
    description: str

@app.post("/generate-bug")
async def generate_bug(bug: BugRequest):
    report = await generate_bug_report(bug.description)
    bug_doc = report.model_dump()
    bug_doc["description"] = bug.description
    bug_doc["created_at"] = datetime.utcnow()
    bug_doc["status"] = "Open"
    bug_doc["ai_severity"] = bug_doc["severity"]
    bug_doc["ai_priority"] = bug_doc["priority"]
    bug_doc["human_edited"] = False
    bug_doc["screenshots"] = []
    result = await bugs_collection.insert_one(bug_doc)
    bug_doc["_id"] = str(result.inserted_id)
    return bug_doc

@app.get("/bugs")
async def list_bugs(
    severity: str = Query(None),
    bugType: str = Query(None)
):
    query = {}
    if severity:
        query["severity"] = severity
    if bugType:
        query["bugType"] = bugType

    cursor = bugs_collection.find(query).sort("created_at", -1)
    bugs = []
    async for bug in cursor:
        bug["_id"] = str(bug["_id"])
        bugs.append(bug)
    return bugs

@app.get("/bugs/{bug_id}")
async def get_bug(bug_id: str):
    bug = await bugs_collection.find_one({"_id": ObjectId(bug_id)})
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    bug["_id"] = str(bug["_id"])
    return bug

@app.patch("/bugs/{bug_id}")
async def update_bug(bug_id: str, updates: dict = Body(...)):
    bug = await bugs_collection.find_one({"_id": ObjectId(bug_id)})

    if not bug:
        return {"success": False, "error": "Bug not found"}

    # Closing
    if updates.get("status") == "Closed" and bug.get("status") != "Closed":
        updates["closed_at"] = datetime.utcnow()

        trello_payload = {
            "key": TRELLO_KEY,
            "token": TRELLO_TOKEN,
            "idList": DONE_LIST_ID,
            "name": bug.get("title", "Untitled Bug"),
            "desc": f"""
Bug ID: {bug_id}
Title: {bug.get('title', '')}
Description: {bug.get('description', '')}
Expected Result: {bug.get('expected_result', '')}
Actual Result: {bug.get('actual_result', '')}
Steps to Reproduce: {bug.get('steps', '')}
Priority: {bug.get('priority', '')}
Severity: {bug.get('severity', '')}
"""
        }

        response = requests.post("https://api.trello.com/1/cards", params=trello_payload)
        print("Trello status:", response.status_code)

        if response.status_code == 200:
            trello_card = response.json()
            updates["trello_card_id"] = trello_card.get("id")
            updates["trello_card_url"] = trello_card.get("shortUrl")

            # attach screenshots to Trello card
            # grab latest screenshots: from updates if user just added some, else from existing bug
            screenshots = updates.get("screenshots") or bug.get("screenshots", [])
            for screenshot_url in screenshots:
                requests.post(
                    f"https://api.trello.com/1/cards/{trello_card.get('id')}/attachments",
                    params={
                        "key": TRELLO_KEY,
                        "token": TRELLO_TOKEN,
                        "url": screenshot_url,
                        "name": "Screenshot"
                    }
                )
        else:
            print("Error creating Trello card:", response.text)

    # Reopening
    if bug.get("status") == "Closed" and updates.get("status") != "Closed":
        updates["reopened_at"] = datetime.utcnow()

    updates["human_edited"] = True
    updates["updated_at"] = datetime.utcnow()

    await bugs_collection.update_one(
        {"_id": ObjectId(bug_id)},
        {"$set": updates}
    )

    return {"success": True, "trello": updates.get("trello_card_url")}

@app.post("/upload-screenshot")
async def upload_screenshot(file: UploadFile = File(...)):
    contents = await file.read()
    result = cloudinary.uploader.upload(
        contents,
        folder="bug-reports",
        resource_type="image"
    )
    return {"url": result["secure_url"]}