"""Factory, configurations and Protocol to create worker services"""

import logging
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, ClassVar, Dict, Optional, Protocol

from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class WorkerServiceConfig:
    """Declare Worker Service common configurations"""

    output_folder: str
    server_configurations: Dict[str, Any]
    verify_ssl: Optional[bool]
    bucket_args: Optional[dict]

    @classmethod
    @lru_cache
    def from_settings(cls) -> "WorkerServiceConfig":
        """Load configuration from Django settings with caching for efficiency."""

        logger.debug("Loading WorkerServiceConfig from settings.")
        return cls(
            output_folder=settings.RECORDING_OUTPUT_FOLDER,
            server_configurations=settings.LIVEKIT_CONFIGURATION,
            verify_ssl=settings.RECORDING_VERIFY_SSL,
            bucket_args={
                "endpoint": settings.AWS_S3_ENDPOINT_URL,
                "access_key": settings.AWS_S3_ACCESS_KEY_ID,
                "secret": settings.AWS_S3_SECRET_ACCESS_KEY,
                "region": settings.AWS_S3_REGION_NAME,
                "bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "force_path_style": True,
            },
        )


class WorkerService(Protocol):
    """Define the interface for interacting with a worker service."""

    hrid: ClassVar[str]

    def __init__(self, config: WorkerServiceConfig):
        """Initialize the service with the given configuration."""

    def start(self, room_id: str, recording_id: str) -> str:
        """Start a recording for a specified room."""

    def stop(self, worker_id: str) -> str:
        """Stop recording for a specified worker."""


class WorkerServiceFactory:
    """Factory to instantiate worker services based on a specified mode

    This factory currently uses a common configuration (`_default_config`) to initialize all
    workers. In the future, if workers require different configurations, consider refactoring
    to a builder pattern. With a builder pattern, specific builders could be registered per
    WorkerService type, allowing each builder to handle instantiation of the worker with its
    unique configuration requirements.
    """

    def __init__(self):
        """Initialize the WorkerServiceFactory with a default configuration and worker registry."""

        self._worker_service_registry = {}
        self._default_config = WorkerServiceConfig.from_settings()

    def register(self, mode, worker_service: WorkerService):
        """Register a worker service for a specific mode."""

        if mode in self._worker_service_registry:
            raise KeyError(f"Worker service for mode '{mode}' is already registered.")

        self._worker_service_registry[mode] = worker_service

    def create(self, mode: str) -> WorkerService:
        """Instantiate a worker service for the specified mode."""

        worker_service_cls = self._worker_service_registry.get(mode)

        if not worker_service_cls:
            raise ValueError(f"Unknown worker service for mode: {mode}.")

        return worker_service_cls(config=self._default_config)
