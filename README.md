# 🐞 QA Bug Reporter

> An AI-powered Chrome extension that automatically generates structured bug reports from plain text descriptions, learns from human corrections, and syncs closed bugs to Trello.

---

## 📸 Screenshots

> **How to add your screenshots:**
> 1. Take screenshots of your extension running
> 2. Create a folder called `assets` at the root of your project
> 3. Drop your images there and replace the filenames below

| Main Form | Bug List | Bug Detail |
|-----------|----------|------------|
| ![Main Form](assets/form.png) | ![Bug List](assets/buglist.png) | ![Bug Detail](assets/bugdetail.png) |

---

## 🎬 Demo

> **How to add your video:**
> 1. Record a 2-3 min Loom or screen recording of the extension working
> 2. Upload it to YouTube or Loom
> 3. Replace the link below

[![Watch the demo](assets/form.png)](https://your-video-link-here)

---

## 💡 What It Does

Most QA tools are either too heavy (Jira, full test management platforms) or too manual (writing reports from scratch). **QA Bug Reporter** lives in your browser, generates a full structured report from a single sentence, and gets smarter every time a human engineer corrects it.

- **Describe the bug in plain English** → AI generates a full structured report instantly
- **The AI learns** from every human correction you make (severity, priority, bug type)
- **Closed bugs** are automatically pushed to a Trello card with all details + screenshots
- **Screenshots** are uploaded to Cloudinary and attached directly to the Trello card
- **Fallback model logic** — if Gemini 2.5 Flash is overloaded, it automatically retries then switches to a backup model with a live status popup

---

## 🧠 How the AI Learning Works

Every time a QA engineer manually edits a severity or priority, the correction is stored in MongoDB with a `human_edited` flag. The next time a bug is generated, the last 5 human corrections are injected into the prompt as examples — so the AI gradually calibrates to the team's judgment patterns.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Chrome Extension | React + Vite (built and loaded as unpacked extension) |
| Backend | FastAPI (Python) |
| AI | Google Gemini 2.5 Flash (with 2.0 Flash + 2.5 Flash Lite fallback) |
| Database | MongoDB Atlas + Motor (async) |
| File Storage | Cloudinary |
| Project Sync | Trello API |
| Packaging | `manifest.json` + Vite build |

---

## 📁 Project Structure

```
qa-bug-reporter/
│
├── QaAssistant/          # Frontend — React Chrome Extension
│   ├── src/
│   │   ├── components/
│   │   │   ├── BugForm.jsx       # Main form + AI generation + popup
│   │   │   ├── BugTable.jsx      # Bug list with inline editing
│   │   │   ├── BugDetail.jsx     # Full bug view
│   │   │   └── BugEdit.jsx       # Edit form + screenshot upload
│   │   └── App.jsx
│   ├── public/
│   │   └── manifest.json         # Chrome extension config
│   └── vite.config.js
│
└── Aiagent/              # Backend — FastAPI
    ├── main.py               # AI logic + Gemini calls + fallback
    ├── backend.py            # API routes + MongoDB + Trello + Cloudinary
    └── .env                  # API keys (not committed)
```

---

## ⚙️ How to Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/your-username/qa-bug-reporter.git
cd qa-bug-reporter
```

### 2. Backend setup

```bash
cd Aiagent
pip install -r requirements.txt
```

Create a `.env` file:

```env
GOOGLE_API_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_atlas_uri
TRELLO_KEY=your_trello_key
TRELLO_TOKEN=your_trello_token
TRELLO_DONE_LIST_ID=your_trello_list_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Start the server:

```bash
uvicorn backend:app --reload
```

### 3. Frontend setup

```bash
cd QaAssistant
npm install
npm run build
```

### 4. Load the extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `QaAssistant/dist` folder

---

## ✨ Key Features

- 🤖 **AI report generation** from a single plain-text description
- 🧠 **Self-improving** — learns from human QA corrections
- 🔄 **Smart fallback** — retries across Gemini models automatically with live status popup
- 📋 **Trello sync** — closed bugs become Trello cards instantly
- 📸 **Screenshot upload** — via Cloudinary, attached to Trello cards
- 🌙 **Dark mode UI** — terminal aesthetic built for dev/QA workflows
- 🔍 **Filter by severity and bug type**
- ✏️ **Inline editing** of severity, priority, and status

---

## 👩‍💻 Author

Built by **Meriam** — Biology engineer turned MERN developer, QA engineer, and now AI tooling builder.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)]([https://linkedin.com/in/your-profile](https://www.linkedin.com/in/meriam-ben-salah-a921a7119/))
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/Myriambs)

---

## 📄 License

MIT — feel free to use, fork, and build on this.
