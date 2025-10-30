# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend_openai import get_openai_response

app = FastAPI()

# Allow frontend access (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify your frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "LOGEAUM Backend Running Successfully 🚀"}

@app.post("/chat")
async def chat(request: dict):
    """Handle chat messages from frontend"""
    message = request.get("message", "")
    if not message:
        return {"reply": "Please enter a message."}
    reply = get_openai_response(message)
    return {"reply": reply}
