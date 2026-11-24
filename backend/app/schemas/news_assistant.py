from pydantic import BaseModel
from typing import List, Optional

class NewsArticleItem(BaseModel):
    id: str
    symbol: Optional[str] = None
    title: str
    source: str
    url: str
    published_at: str
    summary: str
    sentiment: str # "POSITIVE", "NEGATIVE", "NEUTRAL"
    sentiment_score: float # -1.0 to 1.0
    category: str

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class AssistantChatRequest(BaseModel):
    message: str
    symbol: Optional[str] = None
    conversation_history: Optional[List[ChatMessage]] = None

class AssistantChatResponse(BaseModel):
    reply: str
    symbol: Optional[str] = None
    data_timestamp: str
    sources_cited: List[str]
    disclaimer: str

class LearningModuleItem(BaseModel):
    id: str
    title: str
    category: str
    level: str # "Beginner", "Intermediate", "Advanced"
    duration: str
    description: str
    completed: bool = False
    quiz_score: Optional[float] = None
