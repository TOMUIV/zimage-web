"""
Task manager for handling async image generation tasks.
"""
import asyncio
from typing import Dict, Optional
from datetime import datetime
import json
import uuid

from backend.models.config import Config
from backend.models.schemas import TaskStatus, TaskResponse, ImageInfo
from backend.services.generator import get_generator


class TaskManager:
    """Manager for tracking and executing image generation tasks."""

    def __init__(self):
        """Initialize task manager."""
        self.tasks: Dict[str, TaskResponse] = {}
        self.lock = asyncio.Lock()

    async def create_task(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        height: int = 1024,
        width: int = 1024,
        num_inference_steps: int = 9,
        use_gpu: bool = True,
        seed: Optional[int] = None,
        batch_size: int = 1,
        gpu_id: int = 0,
        guidance_scale: float = 0.0,
        max_concurrent_tasks: int = 1
    ) -> str:
        """
        Create a new image generation task.

        Args:
            prompt: Text prompt for image generation
            negative_prompt: Negative prompt for image generation
            height: Image height in pixels
            width: Image width in pixels
            num_inference_steps: Number of inference steps
            use_gpu: Whether to use GPU
            seed: Random seed for reproducibility
            batch_size: Number of images to generate
            gpu_id: GPU device ID
            guidance_scale: Guidance scale for CFG

        Returns:
            str: Task ID
        """
        task_id = str(uuid.uuid4())

        # Create task response
        task = TaskResponse(
            task_id=task_id,
            status=TaskStatus.PENDING,
            message="Task created, waiting to start...",
            total_steps=num_inference_steps,
            current_step=0
        )

        async with self.lock:
            self.tasks[task_id] = task

        # Start task in background
        # Use ensure_future to properly schedule the coroutine
        task_coro = self._execute_task(
            task_id, prompt, negative_prompt, height, width, num_inference_steps, use_gpu, seed, batch_size, gpu_id, guidance_scale, max_concurrent_tasks
        )
        # Store reference to prevent garbage collection
        self._background_task = asyncio.ensure_future(task_coro)

        return task_id

    async def _execute_task(
        self,
        task_id: str,
        prompt: str,
        height: int,
        width: int,
        num_inference_steps: int,
        use_gpu: bool,
        batch_size: int,
        gpu_id: int,
        guidance_scale: float,
        max_concurrent_tasks: int,
        negative_prompt: Optional[str] = None,
        seed: Optional[int] = None
    ):
        """Execute the image generation task in background."""
        try:
            # Update status to processing
            await self._update_task(task_id, status=TaskStatus.PROCESSING, message="Initializing...")

            # Get the current event loop
            loop = asyncio.get_running_loop()

            # Create a queue for thread-safe progress updates
            progress_queue = asyncio.Queue()

            def progress_callback(message: str, progress: int):
                """Callback for progress updates - thread safe."""
                try:
                    # Map 0-100 progress to step-based progress
                    current_step = int(progress * num_inference_steps / 100) if progress > 0 else 0
                    # Put update in queue using call_soon_threadsafe
                    loop.call_soon_threadsafe(
                        progress_queue.put_nowait,
                        {
                            'message': message,
                            'progress': progress,
                            'current_step': current_step
                        }
                    )
                except Exception as e:
                    print(f"Error in progress callback: {e}")

            # Start the generation task in executor
            future = loop.run_in_executor(
                None,
                lambda: get_generator().generate(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    height=height,
                    width=width,
                    num_inference_steps=num_inference_steps,
                    use_gpu=use_gpu,
                    seed=seed,
                    batch_size=batch_size,
                    gpu_id=gpu_id,
                    guidance_scale=guidance_scale,
                    progress_callback=progress_callback
                )
            )

            # Process progress updates while waiting for generation to complete
            image_info = None
            while image_info is None:
                try:
                    # Wait for progress update with timeout
                    update = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                    await self._update_task(task_id, **update)
                except asyncio.TimeoutError:
                    # No update available, check if future is done
                    if future.done():
                        try:
                            image_info = await future
                        except Exception as e:
                            raise e

            # Process any remaining updates in queue
            while not progress_queue.empty():
                try:
                    update = progress_queue.get_nowait()
                    await self._update_task(task_id, **update)
                except asyncio.QueueEmpty:
                    break

            # Save to history
            await self._save_to_history(image_info)

            # Update task as completed
            await self._update_task(
                task_id,
                status=TaskStatus.COMPLETED,
                message="Image generation completed",
                progress=100,
                current_step=num_inference_steps,
                result=image_info
            )

        except Exception as e:
            # Update task as failed
            await self._update_task(
                task_id,
                status=TaskStatus.FAILED,
                message=f"Error: {str(e)}",
                error=str(e)
            )

    async def _update_task(
        self,
        task_id: str,
        status: Optional[TaskStatus] = None,
        message: Optional[str] = None,
        progress: Optional[int] = None,
        current_step: Optional[int] = None,
        result: Optional[ImageInfo] = None,
        error: Optional[str] = None
    ):
        """Update task status."""
        async with self.lock:
            if task_id in self.tasks:
                task = self.tasks[task_id]
                if status is not None:
                    task.status = status
                if message is not None:
                    task.message = message
                if progress is not None:
                    task.progress = progress
                if current_step is not None:
                    task.current_step = current_step
                if result is not None:
                    task.result = result
                if error is not None:
                    task.error = error

    async def get_task(self, task_id: str) -> Optional[TaskResponse]:
        """Get task status by ID."""
        async with self.lock:
            return self.tasks.get(task_id)

    async def _save_to_history(self, image_info: ImageInfo):
        """Save image info to history file."""
        try:
            # Read existing history
            with open(Config.HISTORY_FILE, 'r', encoding='utf-8') as f:
                history = json.load(f)

            # Add new image
            history['images'].append(image_info.model_dump())

            # Cleanup old history
            await self._cleanup_old_history(history)

            # Write back
            with open(Config.HISTORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(history, f, indent=2, ensure_ascii=False, default=str)

        except Exception as e:
            print(f"Error saving to history: {e}")

    async def _cleanup_old_history(self, history: dict):
        """Clean up old history records and their image files."""
        try:
            import os
            from datetime import timedelta

            images = history['images']

            # Sort by created_at (oldest first)
            images.sort(key=lambda x: x['created_at'])

            # Calculate cutoff date
            cutoff_date = datetime.now() - timedelta(days=Config.MAX_HISTORY_DAYS)

            # Keep only recent images within limits
            kept_images = []
            deleted_images = []

            for img in images:
                img_date = datetime.fromisoformat(img['created_at'])
                should_keep = (
                    img_date >= cutoff_date and
                    len(kept_images) < Config.MAX_HISTORY_IMAGES
                )

                if should_keep:
                    kept_images.append(img)
                else:
                    deleted_images.append(img)
                    # Delete corresponding image file
                    try:
                        image_path = Config.IMAGES_DIR / img['filename']
                        if image_path.exists():
                            os.remove(image_path)
                            print(f"Deleted old image file: {img['filename']}")
                    except Exception as e:
                        print(f"Error deleting image file {img['filename']}: {e}")

            # Update history with kept images
            history['images'] = kept_images

            if deleted_images:
                print(f"Cleaned up {len(deleted_images)} old history records")

        except Exception as e:
            print(f"Error cleaning up history: {e}")


# Global singleton instance
_task_manager = TaskManager()


def get_task_manager() -> TaskManager:
    """Get the global task manager instance."""
    return _task_manager