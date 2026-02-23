"""
Image generation service for Z-Image.
Wraps the Z-Image Pipeline for async task execution.
"""
import torch
from diffusers import ZImagePipeline
from pathlib import Path
import time
from typing import Optional, Callable
from datetime import datetime
import uuid
import json

from backend.models.config import Config
from backend.models.schemas import ImageInfo


class ImageGenerator:
    """Singleton class for Z-Image model loading and inference."""

    _instance = None
    _model_loaded = False
    _pipeline: Optional[ZImagePipeline] = None
    _device: str = "cpu"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize the generator (singleton pattern)."""
        if not self._model_loaded:
            pass  # Lazy loading

    def _load_model(self, use_gpu: bool = True, progress_callback: Optional[Callable[[str, int], None]] = None):
        """Load the Z-Image model if not already loaded."""
        if self._model_loaded and self._pipeline is not None:
            # Check if we need to switch device
            target_device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"
            if self._device != target_device:
                progress_callback(f"Switching to {target_device}...", 5) if progress_callback else None
                target_dtype = torch.bfloat16 if target_device == "cuda" else torch.float32
                self._pipeline.to(target_device, dtype=target_dtype)
                self._device = target_device
            return

        if progress_callback:
            progress_callback("Loading Z-Image model...", 0)

        # Determine device
        use_cuda = use_gpu and torch.cuda.is_available()
        self._device = "cuda" if use_cuda else "cpu"
        dtype = torch.bfloat16 if use_cuda else torch.float32

        # Load pipeline
        try:
            self._pipeline = ZImagePipeline.from_pretrained(
                Config.MODEL_NAME,
                torch_dtype=dtype,
                low_cpu_mem_usage=False,
                local_files_only=True,  # 使用本地已下载的模型，避免网络检查
            )

            if progress_callback:
                progress_callback(f"Model loaded on {self._device}", 10)

            # Move to device with correct dtype
            self._pipeline.to(self._device, dtype=dtype)

            # 启用性能优化
            if use_cuda:
                # 尝试使用 Flash Attention，如果不可用则使用 native 后端
                try:
                    self._pipeline.transformer.set_attention_backend("flash")
                    if progress_callback:
                        progress_callback("Flash Attention enabled", 15)
                except Exception as e:
                    # Flash Attention 不可用，使用 native 后端（PyTorch 原生优化）
                    try:
                        self._pipeline.transformer.set_attention_backend("native")
                        if progress_callback:
                            progress_callback("Native attention enabled", 15)
                    except Exception as e2:
                        if progress_callback:
                            progress_callback(f"Attention backend not available: {str(e2)}", 15)

                # 启用内存优化
                self._pipeline.enable_attention_slicing()
                if progress_callback:
                    progress_callback("Attention slicing enabled", 18)

            self._model_loaded = True
            if progress_callback:
                progress_callback("Model ready", 20)

        except Exception as e:
            if progress_callback:
                progress_callback(f"Model loading failed: {str(e)}", 0)
            raise RuntimeError(f"Failed to load model: {str(e)}")

    def generate(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        height: int = 1024,
        width: int = 1024,
        num_inference_steps: int = 9,
        use_gpu: bool = True,
        seed: Optional[int] = None,
        progress_callback: Optional[Callable[[str, int], None]] = None
    ) -> ImageInfo:
        """
        Generate an image from the given prompt.

        Args:
            prompt: Text prompt for image generation
            negative_prompt: Negative prompt for image generation
            height: Image height in pixels
            width: Image width in pixels
            num_inference_steps: Number of inference steps
            use_gpu: Whether to use GPU
            seed: Random seed for reproducibility
            progress_callback: Callback function for progress updates (message, progress_percent)

        Returns:
            ImageInfo: Information about the generated image
        """
        # Load model if not loaded
        self._load_model(use_gpu, progress_callback)

        if progress_callback:
            progress_callback("Starting image generation...", 30)

        # Generate seed if not provided
        if seed is None:
            seed = torch.randint(0, 2**32, (1,), device=self._device).item()

        # Adjust height/width for CPU mode to speed up
        if self._device == "cpu":
            height = min(height, 512)
            width = min(width, 512)
            if progress_callback:
                progress_callback(f"Adjusted resolution for CPU: {width}x{height}", 35)

        # Create generator
        generator = torch.Generator(self._device).manual_seed(seed)

        # Start timing
        start_time = time.time()

        # Generate image
        try:
            image = self._pipeline(
                prompt=prompt,
                height=height,
                width=width,
                num_inference_steps=num_inference_steps,
                guidance_scale=Config.DEFAULT_GUIDANCE_SCALE,
                generator=generator,
            ).images[0]

            # Calculate generation time
            generation_time = (time.time() - start_time) * 1000  # Convert to ms

            if progress_callback:
                progress_callback("Image generated successfully", 90)

        except Exception as e:
            if progress_callback:
                progress_callback(f"Generation failed: {str(e)}", 0)
            raise RuntimeError(f"Failed to generate image: {str(e)}")

        # Save image
        image_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{image_id}.png"
        image_path = Config.IMAGES_DIR / filename

        if progress_callback:
            progress_callback("Saving image...", 95)

        image.save(image_path)

        # Get file size
        size_bytes = image_path.stat().st_size

        if progress_callback:
            progress_callback("Complete", 100)

        # Create image info
        image_info = ImageInfo(
            id=image_id,
            filename=filename,
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_inference_steps=num_inference_steps,
            use_gpu=use_gpu,
            seed=seed,
            size_bytes=size_bytes,
            created_at=datetime.now(),
            generation_time_ms=generation_time
        )

        return image_info


# Global singleton instance
_generator = ImageGenerator()


def get_generator() -> ImageGenerator:
    """Get the global generator instance."""
    return _generator