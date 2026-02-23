"""
API routes for image history and download.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Optional
import json
from pathlib import Path

from backend.models.config import Config
from backend.models.schemas import HistoryResponse, ImageInfo

router = APIRouter()


@router.get("/history", response_model=HistoryResponse)
async def get_history(page: int = 1, page_size: int = 20):
    """
    Get image generation history.

    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page

    Returns:
        HistoryResponse: Paginated list of images
    """
    try:
        # Read history file
        with open(Config.HISTORY_FILE, 'r', encoding='utf-8') as f:
            history = json.load(f)

        images = history.get('images', [])

        # Sort by created_at (newest first)
        images.sort(key=lambda x: x['created_at'], reverse=True)

        # Pagination
        total = len(images)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_images = images[start_idx:end_idx]

        # Convert to ImageInfo objects
        image_infos = [ImageInfo(**img) for img in paginated_images]

        return HistoryResponse(
            images=image_infos,
            total=total,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read history: {str(e)}")


@router.get("/download/{image_id}")
async def download_image(image_id: str):
    """
    Download an image by ID.

    Args:
        image_id: Image ID

    Returns:
        FileResponse: Image file
    """
    try:
        # Find image in history
        with open(Config.HISTORY_FILE, 'r', encoding='utf-8') as f:
            history = json.load(f)

        images = history.get('images', [])
        image = next((img for img in images if img['id'] == image_id), None)

        if image is None:
            raise HTTPException(status_code=404, detail="Image not found")

        # Get file path
        filename = image['filename']
        image_path = Config.IMAGES_DIR / filename

        if not image_path.exists():
            raise HTTPException(status_code=404, detail="Image file not found")

        # Return file
        return FileResponse(
            path=str(image_path),
            media_type="image/png",
            filename=filename
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download image: {str(e)}")


@router.delete("/images/{image_id}")
async def delete_image(image_id: str):
    """
    Delete an image by ID.

    Args:
        image_id: Image ID

    Returns:
        dict: Deletion result
    """
    try:
        import os

        # Read history file
        with open(Config.HISTORY_FILE, 'r', encoding='utf-8') as f:
            history = json.load(f)

        images = history.get('images', [])
        image = next((img for img in images if img['id'] == image_id), None)

        if image is None:
            raise HTTPException(status_code=404, detail="Image not found")

        # Delete image file
        filename = image['filename']
        image_path = Config.IMAGES_DIR / filename

        if image_path.exists():
            os.remove(image_path)

        # Remove from history
        history['images'] = [img for img in images if img['id'] != image_id]

        # Write back
        with open(Config.HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2, ensure_ascii=False, default=str)

        return {"message": "Image deleted successfully", "image_id": image_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")


@router.get("/images/latest")
async def get_latest_image():
    """
    Get the latest generated image.

    Returns:
        dict: Latest image info
    """
    try:
        # Read history file
        with open(Config.HISTORY_FILE, 'r', encoding='utf-8') as f:
            history = json.load(f)

        images = history.get('images', [])

        if not images:
            raise HTTPException(status_code=404, detail="No images found")

        # Sort by created_at (newest first)
        images.sort(key=lambda x: x['created_at'], reverse=True)
        latest_image = images[0]

        # Add download URL
        latest_image['download_url'] = f"/api/download/{latest_image['id']}"

        return latest_image
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get latest image: {str(e)}")


@router.post("/history/cleanup")
async def cleanup_history():
    """
    Manually trigger cleanup of old history records and image files.

    Returns:
        dict: Cleanup result with deleted count
    """
    try:
        import os
        from datetime import timedelta

        # Read history file
        with open(Config.HISTORY_FILE, 'r', encoding='utf-8') as f:
            history = json.load(f)

        images = history.get('images', [])

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
                except Exception as e:
                    print(f"Error deleting image file {img['filename']}: {e}")

        # Update history
        history['images'] = kept_images

        # Write back
        with open(Config.HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2, ensure_ascii=False, default=str)

        return {
            "message": "Cleanup completed",
            "deleted_count": len(deleted_images),
            "remaining_count": len(kept_images)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup history: {str(e)}")