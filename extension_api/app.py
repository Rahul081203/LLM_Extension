from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="LLM API for Chrome Extension")

# Allow local browser extension requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your extension's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatOpenAI()

# Prompt templates for different operations
PROMPTS = {
    "summarize": ChatPromptTemplate.from_template("Summarize the following text:\n\n{query}"),
    "explain": ChatPromptTemplate.from_template("Explain the following text in simple terms:\n\n{query}"),
    "translate": ChatPromptTemplate.from_template("Translate the following text to Hindi:\n\n{query}"),
    "followup": ChatPromptTemplate.from_template("{query}")
}


@app.post("/llm")
async def handle_query(request: Request):
    data = await request.json()
    query = data.get("query", "")
    mode = data.get("mode", "summarize").lower()
    conversation = data.get("conversation", [])

    if mode not in PROMPTS:
        return JSONResponse(status_code=400, content={"error": "Unsupported mode"})

    prompt = PROMPTS[mode]

    # If conversation exists, build a chat history
    if conversation:
        # You may need to adapt this for your LLM/chat API
        messages = [{"role": msg["role"], "content": msg["content"]} for msg in conversation]
        messages.append({"role": "user", "content": query})
        result = await llm.ainvoke(messages)
    else:
        chain = prompt | llm
        result = await chain.ainvoke({"query": query})

    print(result.content)
    return JSONResponse(content={"response": result.content})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5501)
