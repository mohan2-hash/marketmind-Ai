from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.connection import init_db
from app.api import markets, stocks, analytics, predictions, portfolio, assistant, learning

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MarketMind AI — Full-Stack Intelligent Stock Analysis & Machine Learning Forecasting Engine",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(markets.router, prefix=settings.API_PREFIX)
app.include_router(stocks.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(predictions.router, prefix=settings.API_PREFIX)
app.include_router(portfolio.router, prefix=settings.API_PREFIX)
app.include_router(assistant.router, prefix=settings.API_PREFIX)
app.include_router(learning.router, prefix=settings.API_PREFIX)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "MarketMind AI API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "sqlite_connected" if "sqlite" in settings.DATABASE_URL else "postgres_connected",
        "default_provider": settings.DEFAULT_PROVIDER,
        "features": {
            "demo_mode": True,
            "real_providers_configured": bool(settings.TWELVE_DATA_API_KEY or settings.ALPHA_VANTAGE_API_KEY or settings.FINNHUB_API_KEY),
            "ai_assistant_llm": bool(settings.GEMINI_API_KEY)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
