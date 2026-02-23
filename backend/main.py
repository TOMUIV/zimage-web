"""
FastAPI application entry point for Z-Image backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from backend.models.config import Config


# Configure logging to reduce redundant INFO logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            'backend/logs/app.log',
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
    ]
)

# Create a custom filter to suppress repetitive INFO logs
class RepetitiveLogFilter(logging.Filter):
    """Filter to suppress repetitive INFO logs from system monitoring."""

    def __init__(self):
        super().__init__()
        self._last_message = None
        self._same_message_count = 0

    def filter(self, record):
        # Only filter INFO level logs
        if record.levelno != logging.INFO:
            return True

        message = record.getMessage()

        # Check if this is a system monitoring related log
        if any(keyword in message for keyword in ['cpu', 'memory', 'gpu', 'system status']):
            # Allow only the first occurrence of the same message
            if message == self._last_message:
                self._same_message_count += 1
                return False  # Suppress this log
            else:
                self._last_message = message
                self._same_message_count = 0
                return True  # Log this first occurrence

        return True


# Apply the filter to the root logger
root_logger = logging.getLogger()
root_logger.addFilter(RepetitiveLogFilter())

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logging.info("Starting Z-Image backend...")
    print("Starting Z-Image backend...")
    yield
    # Shutdown
    logging.info("Shutting down Z-Image backend...")
    print("Shutting down Z-Image backend...")


# Create FastAPI application
app = FastAPI(
    title="Z-Image API",
    description="REST API for Z-Image image generation",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for images
app.mount("/static/images", StaticFiles(directory=str(Config.IMAGES_DIR)), name="images")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Z-Image API"}


# Include API routes
from backend.api import generate, history, system

app.include_router(generate.router, prefix=Config.API_PREFIX, tags=["Generation"])
app.include_router(history.router, prefix=Config.API_PREFIX, tags=["History"])
app.include_router(system.router, prefix=Config.API_PREFIX, tags=["System"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Z-Image API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )