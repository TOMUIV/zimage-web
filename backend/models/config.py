"""
Configuration module for the Z-Image backend application.
"""
import os
from pathlib import Path


class Config:
    """Application configuration."""

    # Base paths
    BASE_DIR = Path(__file__).parent.parent.parent.absolute()
    DATA_DIR = BASE_DIR / "data"
    IMAGES_DIR = DATA_DIR / "images"
    HISTORY_FILE = DATA_DIR / "history.json"
    LOGS_DIR = BASE_DIR / "backend" / "logs"

    # Model settings
    MODEL_NAME = "Tongyi-MAI/Z-Image-Turbo"
    DEFAULT_HEIGHT = 1024
    DEFAULT_WIDTH = 1024
    DEFAULT_NUM_INFERENCE_STEPS = 9
    DEFAULT_GUIDANCE_SCALE = 0.0
    DEFAULT_SEED = 42

    # API settings
    API_PREFIX = "/api"
    CORS_ORIGINS = ["http://localhost:15001", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:15001", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]

    # Task settings
    TASK_TIMEOUT = 600  # 10 minutes

    # History cleanup settings
    MAX_HISTORY_IMAGES = 500  # Maximum number of images to keep in history
    MAX_HISTORY_DAYS = 30  # Maximum number of days to keep history

    # Ensure directories exist
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist."""
        cls.DATA_DIR.mkdir(parents=True, exist_ok=True)
        cls.IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        cls.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        if not cls.HISTORY_FILE.exists():
            cls.HISTORY_FILE.write_text('{"images": []}', encoding='utf-8')


# Initialize directories on import
Config.ensure_directories()