"""
Smart TCO Calculator - FastAPI Backend
Main application entry point with CORS, routing, and health checks.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
import asyncio
import logging
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from backend/.env
backend_dir = Path(__file__).parent
load_dotenv(dotenv_path=backend_dir / ".env")

from backend.routers import tco, materials, regions, scenarios, admin, ml_visualization, rag_visualization
from backend.utils.logger import setup_logger
from backend.data_knowledge_layer.loader import DataLoader
from backend.data_knowledge_layer.rag_engine import RAGEngine

# Setup logging
logger = setup_logger(__name__)

# Global instances
data_loader: DataLoader = None
rag_engine: RAGEngine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events.

    The RAG initialization can be slow (loading PDFs, embeddings, external APIs).
    Start it in a background task so the FastAPI server becomes available immediately
    and doesn't block on startup. App state will be updated once initialization
    finishes; existing routes should handle the fallback when RAG is not ready.
    """
    global data_loader, rag_engine

    logger.info("\ud83d\ude80 Starting Smart TCO Calculator Backend...")

    # Mark the RAG as initializing and provide placeholders in app.state
    app.state.rag_engine = None
    app.state.data_loader = None
    app.state.rag_initializing = True

    async def _init_rag_background():
        nonlocal app
        global data_loader, rag_engine
        try:
            logger.info("\ud83d\udcda Loading RAG engine (may take 20-30 seconds)...")

            data_loader = DataLoader()
            await data_loader.load_all_datasets()
            logger.info(f"\u2705 Loaded {len(data_loader.documents)} documents")

            rag_engine = RAGEngine(data_loader)
            await rag_engine.initialize()
            logger.info("\u2705 RAG engine initialized successfully")

            # Store in app state so routes can access it
            app.state.rag_engine = rag_engine
            app.state.data_loader = data_loader
        except Exception as e:
            logger.error(f"\u26a0\ufe0f RAG initialization failed (continuing with fallback): {e}")
            import traceback
            traceback.print_exc()
            app.state.rag_engine = None
            app.state.data_loader = None
            logger.info("\u2705 Backend ready (RAG disabled, using fallback explanations)")
        finally:
            app.state.rag_initializing = False

    # Schedule background initialization and don't await it
    asyncio.create_task(_init_rag_background())

    yield

    # Cleanup on shutdown
    logger.info("\ud83d\udc4b Shutting down Smart TCO Calculator Backend...")


# Create FastAPI app
app = FastAPI(
    title="Smart TCO Calculator API",
    description="Backend for semiconductor TCO analysis with AI explanations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - allow frontend on localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    logger.info(f"📥 {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"📤 {request.method} {request.url.path} → {response.status_code}")
    return response


# Include routers
app.include_router(materials.router, prefix="/api", tags=["Materials"])
app.include_router(regions.router, prefix="/api", tags=["Regions"])
app.include_router(tco.router, prefix="/api", tags=["TCO Prediction"])
app.include_router(scenarios.router, prefix="/api", tags=["Scenarios"])
app.include_router(admin.router, tags=["Admin"])
app.include_router(ml_visualization.router, tags=["ML Visualization"])
app.include_router(rag_visualization.router, tags=["RAG Visualization"])


# Health check endpoints
@app.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "smart-tco-calculator",
        "version": "1.0.0"
    }


@app.get("/health/ready")
async def readiness_check():
    """Detailed readiness check"""
    global data_loader, rag_engine
    
    checks = {
        "data_loader": data_loader is not None,
        "rag_engine": rag_engine is not None,
    }
    
    all_ready = all(checks.values())
    
    return JSONResponse(
        status_code=200 if all_ready else 503,
        content={
            "status": "ready" if all_ready else "not_ready",
            "checks": checks,
            "timestamp": "2025-10-09T00:00:00Z"
        }
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Smart TCO Calculator API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"❌ Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "path": request.url.path
        }
    )


def get_data_loader() -> DataLoader:
    """Dependency injection for DataLoader"""
    global data_loader
    return data_loader


def get_rag_engine() -> RAGEngine:
    """Dependency injection for RAGEngine"""
    global rag_engine
    return rag_engine


if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
