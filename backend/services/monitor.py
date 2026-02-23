"""
System monitoring service.
"""
import psutil
from datetime import datetime
from typing import Optional
import logging

from backend.models.schemas import CPUInfo, MemoryInfo, GPUInfo, DiskInfo

logger = logging.getLogger(__name__)


class SystemMonitor:
    """Service for monitoring system resources."""

    def __init__(self):
        """Initialize system monitor."""
        self._cache = {}
        self._cache_ttl = 2  # Cache for 2 seconds
        logger.info("System monitor initialized")

    def get_cpu_info(self) -> CPUInfo:
        """Get CPU information."""
        usage = psutil.cpu_percent(interval=0.1)
        # Log CPU warnings only
        if usage > 80:
            logger.warning(f"CPU usage high: {usage:.1f}%")

        return CPUInfo(
            usage_percent=usage,
            cores=psutil.cpu_count(logical=False),
            frequency_mhz=psutil.cpu_freq().current if psutil.cpu_freq() else 0.0
        )

    def get_memory_info(self) -> MemoryInfo:
        """Get memory information."""
        mem = psutil.virtual_memory()
        # Log memory warnings only
        if mem.percent > 80:
            logger.warning(f"Memory usage high: {mem.percent:.1f}%")

        return MemoryInfo(
            total_gb=mem.total / (1024**3),
            used_gb=mem.used / (1024**3),
            available_gb=mem.available / (1024**3),
            usage_percent=mem.percent
        )

    def get_gpu_info(self) -> Optional[GPUInfo]:
        """Get GPU information if available."""
        try:
            import GPUtil
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]
                # Log GPU warnings only
                if gpu.temperature > 80:
                    logger.warning(f"GPU temperature high: {gpu.temperature}°C")
                if gpu.load * 100 > 90:
                    logger.warning(f"GPU usage high: {gpu.load * 100:.1f}%")
                if gpu.memoryUsed / gpu.memoryTotal > 0.9:
                    logger.warning(f"GPU memory usage high: {gpu.memoryUsed / gpu.memoryTotal * 100:.1f}%")

                return GPUInfo(
                    available=True,
                    name=gpu.name,
                    memory_total_gb=gpu.memoryTotal / 1024,
                    memory_used_gb=gpu.memoryUsed / 1024,
                    usage_percent=gpu.load * 100,
                    temperature=gpu.temperature
                )
        except ImportError:
            logger.debug("GPUtil not installed, GPU monitoring unavailable")
        except Exception as e:
            logger.error(f"Error getting GPU info: {e}")

        return GPUInfo(available=False)

    def get_disk_info(self) -> DiskInfo:
        """Get disk information."""
        disk = psutil.disk_usage(str(psutil.disk_partitions()[0].mountpoint))
        # Log disk warnings only
        if disk.percent > 80:
            logger.warning(f"Disk usage high: {disk.percent:.1f}%")

        return DiskInfo(
            path=psutil.disk_partitions()[0].mountpoint,
            total_gb=disk.total / (1024**3),
            used_gb=disk.used / (1024**3),
            free_gb=disk.free / (1024**3),
            usage_percent=disk.percent
        )


# Global singleton instance
_monitor = SystemMonitor()


def get_monitor() -> SystemMonitor:
    """Get the global monitor instance."""
    return _monitor