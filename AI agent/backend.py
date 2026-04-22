# backend.py
import os
from fastapi import FastAPI, Query, Body
from pydantic import BaseModel
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from main import generate_bug_report   # ⚠️ async now
from fastapi import HTTPException
import requests
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client.qa_dashboard
bugs_collection = db.bugs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load from .env
TRELLO_KEY = os.getenv("TRELLO_KEY")
TRELLO_TOKEN = os.getenv("TRELLO_TOKEN")
DONE_LIST_ID = os.getenv("TRELLO_DONE_LIST_ID")  # your Trello Done list ID

class BugRequest(BaseModel):
    description: str

@app.post("/generate-bug")
async def generate_bug(bug: BugRequest):
    report = await generate_bug_report(bug.description)

    bug_doc = report.model_dump()
    bug_doc["description"] = bug.description
    bug_doc["created_at"] = datetime.utcnow()
    bug_doc["status"] = "Open"

    # store AI originals
    bug_doc["ai_severity"] = bug_doc["severity"]
    bug_doc["ai_priority"] = bug_doc["priority"]
    bug_doc["human_edited"] = False

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

from datetime import datetime
from bson import ObjectId

@app.patch("/bugs/{bug_id}")
async def update_bug(bug_id: str, updates: dict = Body(...)):
    bug = await bugs_collection.find_one({"_id": ObjectId(bug_id)})

    if not bug:
        return {"success": False, "error": "Bug not found"}

    # 👉 Closing
    if updates.get("status") == "Closed" and bug.get("status") != "Closed":
        updates["closed_at"] = datetime.utcnow()

        # 🔹 Trello card creation
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
        print("Trello response:", response.text)

        if response.status_code == 200:
            trello_card = response.json()
            # Optional: save Trello card ID / URL back to bug
            updates["trello_card_id"] = trello_card.get("id")
            updates["trello_card_url"] = trello_card.get("shortUrl")
        else:
            print("Error creating Trello card:", response.text)

    # 👉 Reopening
    if bug.get("status") == "Closed" and updates.get("status") != "Closed":
        updates["reopened_at"] = datetime.utcnow()

    updates["human_edited"] = True
    updates["updated_at"] = datetime.utcnow()

    await bugs_collection.update_one(
        {"_id": ObjectId(bug_id)},
        {"$set": updates}
    )

    return {"success": True, "trello": updates.get("trello_card_url")}

@app.get("/bugs/{bug_id}")
async def get_bug(bug_id: str):
    bug = await bugs_collection.find_one({"_id": ObjectId(bug_id)})
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    bug["_id"] = str(bug["_id"])  # convert ObjectId to string
    return bug