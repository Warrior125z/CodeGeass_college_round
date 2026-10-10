from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field

import jwt

from app.agent.agent import ask_nexus
from app.database import SessionLocal
from app.models import User, Workspace
from app.schemas.user import UserRegister, UserLogin
from app.schemas.workspace import WorkspaceCreate
from app.utils.security import hash_password, verify_password
from app.utils.tokens import create_access_token, SECRET_KEY, ALGORITHM


app = FastAPI(title="Nexus AI API")


# Generated websites directory
GENERATED_DIR = Path(__file__).resolve().parent.parent / "generated_sites"
GENERATED_DIR.mkdir(parents=True, exist_ok=True)


# Serve generated websites
app.mount(
    "/preview",
    StaticFiles(directory=GENERATED_DIR, html=True),
    name="website_previews",
)


# Allow the React frontend to communicate with the backend
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


# Database connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


security = HTTPBearer()


# Verify the JWT and identify the logged-in user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_id = int(payload["sub"])

    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


# Request format for the AI chat
class ChatRequest(BaseModel):
    message: str
    history: list[dict] = Field(default_factory=list)


# Home endpoint
@app.get("/")
def home():
    return {"message": "Nexus API is running"}


# AI agent chat
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


# User registration
@app.post("/register", status_code=201)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )

    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )

    db.add(new_user)

    try:
        db.flush()

        workspace = Workspace(
            name="My Workspace",
            owner_id=new_user.id,
        )
        db.add(workspace)

        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )

    return {
        "message": "Registration successful",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
        },
    }


# User login
@app.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user or not verify_password(
        user_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
        },
    }


# Logged-in user's profile
@app.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "email": current_user.email,
    }


# Get all workspaces belonging to the logged-in user
@app.get("/workspaces")
def get_my_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspaces = (
        db.query(Workspace)
        .filter(Workspace.owner_id == current_user.id)
        .all()
    )

    return {
        "workspaces": [
            {
                "id": workspace.id,
                "name": workspace.name,
                "owner_id": workspace.owner_id,
            }
            for workspace in workspaces
        ]
    }


# Get a particular workspace owned by the logged-in user
@app.get("/workspaces/{workspace_id}")
def get_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = (
        db.query(Workspace)
        .filter(
            Workspace.id == workspace_id,
            Workspace.owner_id == current_user.id,
        )
        .first()
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    return {
        "id": workspace.id,
        "name": workspace.name,
        "owner_id": workspace.owner_id,
    }


# Create a new workspace
@app.post("/workspaces", status_code=201)
def create_workspace(
    workspace_data: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_workspace = Workspace(
        name=workspace_data.name,
        owner_id=current_user.id,
    )

    db.add(new_workspace)
    db.commit()
    db.refresh(new_workspace)

    return {
        "id": new_workspace.id,
        "name": new_workspace.name,
        "owner_id": new_workspace.owner_id,
    }