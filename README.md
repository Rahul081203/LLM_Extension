# Chrome LLM Assistant (Copilot-style UI)

A lightweight Chrome Extension that lets you **summarize, explain, and translate selected text** on any webpage using an LLM — displayed in a **Copilot-style floating card** with **follow-up chat**.

This project uses:
- **Chrome Extension** (context menu + content script UI)
- **FastAPI** backend running locally
- **LangChain + ChatOpenAI** for LLM inference

> ⚠️ Notes on privacy & safety: This extension sends the selected text to a **local backend** (`http://localhost:5501`) which then calls the LLM provider API. Do not use on sensitive/private content unless you understand the data flow.

---

## ✨ Features

- ✅ Right-click selected text → choose:
  - **Summarize**
  - **Explain**
  - **Translate to Hindi**
- ✅ **Copilot-style floating card UI** (non-blocking)
- ✅ **Follow-up questions** (maintains conversation context)
- ✅ Copy-to-clipboard + Close controls
- ✅ Simple architecture you can extend (more modes, models, UI variants)

---

## 🧱 Architecture

**Browser (Chrome Extension)**
- `background.js`
  - Creates context menu actions
  - Sends selected text to backend `/llm`
  - Injects `injectCopilotStyleCard.js` and sends the response to the page
  - Handles follow-ups via `chrome.runtime.onMessage`

- `injectCopilotStyleCard.js`
  - Renders the floating Copilot-style card
  - Displays response + input box for follow-up
  - Stores `conversation[]` in the page context and sends it back for follow-ups

**Backend (FastAPI)**
- `app.py`
  - Exposes POST `/llm`
  - Routes requests by `mode` (summarize/explain/translate/followup)
  - Uses LangChain `ChatOpenAI` to generate responses

---

## 🚀 Quickstart

### 1) Backend setup (FastAPI)

#### Install dependencies
```bash
pip install fastapi uvicorn python-dotenv langchain openai
```

#### Add your API key

Create a `.env` file in the backend folder:
```
OPENAI_API_KEY=your_key_here
```

#### Run the server

```bash
python app.py
```

Server runs at: `http://localhost:5501`  
Endpoint: `POST http://localhost:5501/llm`

### 2) Load the Chrome Extension

1. Open Chrome → go to: `chrome://extensions`
2. Enable **Developer mode**
3. Select **Load unpacked**
4. Choose the extension folder (where `manifest.json` lives)
5. Select text on any webpage → Right click → choose an LLM option

---

## 🔌 API Contract (Backend)

**Endpoint**
```
POST /llm
```

**Payload**
```json
{
  "query": "selected text or follow-up question",
  "mode": "summarize | explain | translate | followup",
  "conversation": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response**
```json
{
  "response": "LLM output text"
}
```

---

## 🧠 Modes Implemented

- **summarize** → Summarize selected text
- **explain** → Explain in simple terms
- **translate** → Translate into Hindi
- **followup** → Free-form follow-up using the conversation history

You can add more modes easily by extending the `PROMPTS` dictionary in `app.py`.

---

## 🔐 Security & Improvements (Recommended)

This repo is intentionally minimal. If you're polishing it for production/demo:

### Backend

- Restrict CORS to your extension ID instead of "*"
- Add basic input limits (avoid huge payloads)
- Add request timeout + retries
- Add temperature, model, and max_tokens controls
- Switch to environment-based model selection

### Extension

- Show a loading state ("Thinking…")
- Add a "Regenerate" button
- Add a "Clear chat" button
- Support translation to more languages (dropdown)
- Add keyboard shortcuts

---

## 📝 License

MIT (or your choice)