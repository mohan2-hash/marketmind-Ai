from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.database.connection import Base

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String(50), nullable=False, index=True)
    lesson_id = Column(String(50), nullable=False)
    completed = Column(Boolean, default=False)
    quiz_score = Column(Float, nullable=True) # Percentage (e.g. 100.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
