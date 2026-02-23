"""
API routes for system monitoring.
"""
from fastapi import APIRouter
from datetime import datetime

from backend.models.schemas import SystemStatusResponse
from backend.services.monitor import get_monitor

router = APIRouter()


@router.get("/system/status", response_model=SystemStatusResponse)
async def get_system_status():
    """
    Get current system status.

    Returns:
        SystemStatusResponse: System resource information
    """
    monitor = get_monitor()

    return SystemStatusResponse(
        cpu=monitor.get_cpu_info(),
        memory=monitor.get_memory_info(),
        gpu=monitor.get_gpu_info(),
        disk=monitor.get_disk_info(),
        timestamp=datetime.now()
    )