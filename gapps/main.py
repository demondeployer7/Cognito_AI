from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
from ai_assistant import AIAssistant
from config import Config

# Initialize FastAPI app
app = FastAPI(
    title="Personal Assistant API",
    description="AI-powered personal assistant for Gmail and Google Calendar",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Assistant
assistant = None

class QueryRequest(BaseModel):
    query: str
    user_id: Optional[str] = None

class QueryResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the AI assistant on startup"""
    global assistant
    try:
        assistant = AIAssistant()
        print("✅ AI Assistant initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize AI Assistant: {e}")
        assistant = None

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Personal Assistant API",
        "status": "running",
        "assistant_ready": assistant is not None
    }

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process user query and return response"""
    if not assistant:
        raise HTTPException(status_code=500, detail="AI Assistant not initialized")
    
    try:
        response = assistant.process_user_query(request.query)
        return QueryResponse(
            response=response,
            success=True
        )
    except Exception as e:
        return QueryResponse(
            response="",
            success=False,
            error=str(e)
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "assistant_ready": assistant is not None
    }

@app.get("/capabilities")
async def get_capabilities():
    """Get list of assistant capabilities"""
    return {
        "capabilities": [
            "📅 Calendar Management",
            "   - View today's schedule",
            "   - View yesterday's events", 
            "   - Schedule meetings and events",
            "   - Delete calendar events",
            "📧 Email Management",
            "   - Check inbox and read emails",
            "   - Send emails",
            "   - Save emails to markdown files",
            "🤖 AI Chat",
            "   - General conversation and assistance"
        ],
        "example_queries": [
            "What's my schedule for today?",
            "Show me yesterday's calendar events",
            "Schedule a meeting with John tomorrow at 2pm",
            "Check my inbox",
            "Send an email to john@example.com about the project",
            "What's the weather like?"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=True
    ) 