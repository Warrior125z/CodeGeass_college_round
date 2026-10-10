from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.agent.agent import ask_nexus

app = FastAPI(title="Nexus AI API")

# Folder where generated websites are saved
GENERATED_DIR = Path(__file__).resolve().parent.parent / "generated_sites"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

# Serve generated websites in the browser
app.mount(
    "/preview",
    StaticFiles(directory=GENERATED_DIR, html=True),
    name="website_previews",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@app.get("/")
def home():
    return {"message": "Nexus AI API is running"}


@app.post("/chat")
def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    try:
        answer = ask_nexus(request.message, request.history)
        return {"reply": answer}
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Nexus could not process the request. "
                "Check the backend terminal."
            ),
        )