"""
Pydantic schemas for API request/response models.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class TaskStatus(str, Enum):
    """Task status enumeration."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ImageGenerationRequest(BaseModel):
    """Request model for image generation."""
    prompt: str = Field(..., description="Text prompt for image generation", min_length=1)
    negative_prompt: Optional[str] = Field(None, description="Negative prompt for image generation")
    height: int = Field(1024, description="Image height in pixels", ge=256, le=2048)
    width: int = Field(1024, description="Image width in pixels", ge=256, le=2048)
    num_inference_steps: int = Field(9, description="Number of inference steps", ge=1, le=50)
    use_gpu: bool = Field(True, description="Whether to use GPU for generation")
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    batch_size: int = Field(1, description="Number of images to generate", ge=1, le=8)
    gpu_id: int = Field(0, description="GPU device ID", ge=0, le=7)
    guidance_scale: float = Field(0.0, description="Guidance scale for CFG", ge=0.0, le=20.0)
    max_concurrent_tasks: int = Field(1, description="Maximum concurrent tasks", ge=1, le=4)


class ImageInfo(BaseModel):
    """Image information model."""
    id: str
    filename: str
    prompt: str
    negative_prompt: Optional[str] = None
    width: int
    height: int
    num_inference_steps: int
    use_gpu: bool
    seed: Optional[int] = None
    size_bytes: int
    created_at: datetime
    generation_time_ms: Optional[float] = None


class TaskResponse(BaseModel):
    """Response model for task status."""
    task_id: str
    status: TaskStatus
    progress: int = Field(0, description="Progress percentage (0-100)", ge=0, le=100)
    total_steps: int = Field(9, description="Total number of steps")
    current_step: int = Field(0, description="Current step number")
    message: str = Field("", description="Status message")
    result: Optional[ImageInfo] = None
    error: Optional[str] = None


class HistoryResponse(BaseModel):
    """Response model for image history."""
    images: List[ImageInfo]
    total: int
    page: int
    page_size: int


class CPUInfo(BaseModel):
    """CPU information."""
    usage_percent: float
    cores: int
    frequency_mhz: float


class MemoryInfo(BaseModel):
    """Memory information."""
    total_gb: float
    used_gb: float
    available_gb: float
    usage_percent: float


class GPUInfo(BaseModel):
    """GPU information."""
    available: bool
    name: Optional[str] = None
    memory_total_gb: Optional[float] = None
    memory_used_gb: Optional[float] = None
    usage_percent: Optional[float] = None
    temperature: Optional[float] = None


class DiskInfo(BaseModel):
    """Disk information."""
    path: str
    total_gb: float
    used_gb: float
    free_gb: float
    usage_percent: float


class SystemStatusResponse(BaseModel):
    """Response model for system status."""
    cpu: CPUInfo
    memory: MemoryInfo
    gpu: Optional[GPUInfo] = None
    disk: DiskInfo
    timestamp: datetime