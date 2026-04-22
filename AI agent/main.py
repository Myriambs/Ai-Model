from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os, json, re

load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client.qa_dashboard
bugs_collection = db.bugs

class BugReport(BaseModel):
    title: str
    actual_result: str
    expected_result: str
    severity: str
    bugType: str
    component: str
    priority: str
    reproducibility: str
    labels: list[str]
def clean_json(text: str) -> str:
    match = re.search(r"```json\s*(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1)
    match = re.search(r"```\s*(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1)
    return text.strip()

async def fetch_human_corrections(limit=5):
    cursor = bugs_collection.find(
        {"human_edited": True}
    ).sort("updated_at", -1).limit(limit)

    examples = []
    async for bug in cursor:
        examples.append(
            f"""
Bug description:
"{bug.get('description')}"

AI severity: {bug.get('ai_severity')}
Human severity: {bug.get('severity')}
Human priority: {bug.get('priority')}
"""
        )
    return "\n".join(examples)

async def generate_bug_report(description: str) -> BugReport:
    examples = await fetch_human_corrections()

    prompt = f"""
You are a senior QA assistant.

Below are examples where human QA engineers corrected AI outputs.
Follow the same judgment patterns.

{examples}

Now generate a bug report in VALID JSON ONLY with:
- title
- actual_result
- expected_result
- severity (Critical, High, Medium, Low)
- bugType
- component
- priority (P1, P2, P3)
- reproducibility
- labels
Bug description:
\"\"\"{description}\"\"\"
"""

    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )

    cleaned = clean_json(response.text)
    data = json.loads(cleaned)
    return BugReport(**data)
