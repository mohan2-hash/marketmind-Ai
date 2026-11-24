from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.market_service import MarketService
from app.services.assistant_service import AssistantService
from app.schemas.news_assistant import AssistantChatRequest, AssistantChatResponse

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
def chat_with_assistant(
    req: AssistantChatRequest,
    db: Session = Depends(get_db)
):
    market_service = MarketService(db)
    assistant = AssistantService(market_service)
    
    history_dicts = [m.model_dump() for m in req.conversation_history] if req.conversation_history else None
    
    return assistant.answer_query(
        message=req.message,
        symbol=req.symbol,
        conversation_history=history_dicts
    )
