"""
API routes for image generation.
"""
from fastapi import APIRouter, HTTPException
from backend.models.schemas import (
    ImageGenerationRequest,
    TaskResponse
)
from backend.services.task_manager import get_task_manager

router = APIRouter()


@router.post("/generate", response_model=dict)
async def create_generation_task(request: ImageGenerationRequest):
    """
    Create a new image generation task.

    Args:
        request: Image generation parameters

    Returns:
        dict: Task ID for tracking
    """
    try:
        task_manager = get_task_manager()
        task_id = await task_manager.create_task(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            height=request.height,
            width=request.width,
            num_inference_steps=request.num_inference_steps,
            use_gpu=request.use_gpu,
            seed=request.seed,
            batch_size=request.batch_size,
            gpu_id=request.gpu_id,
            guidance_scale=request.guidance_scale,
            max_concurrent_tasks=request.max_concurrent_tasks
        )
        return {"task_id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")


@router.get("/generate/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """
    Get the status of a generation task.

    Args:
        task_id: Task ID

    Returns:
        TaskResponse: Task status and progress
    """
    task_manager = get_task_manager()
    task = await task_manager.get_task(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task