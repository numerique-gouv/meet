"""Meet worker services classes and exceptions."""

from .exceptions import *
from .factories import WorkerServiceFactory
from .mediator import WorkerServiceMediator
from .services import AudioCompositeEgressService, VideoCompositeEgressService

# Expose the worker service factory instance at the module level.
# This provides a centralized access point and abstracts away the service creation
# details from the code using the services.
worker_service_provider = WorkerServiceFactory()
worker_service_provider.register("transcript", AudioCompositeEgressService)
worker_service_provider.register("screen_recording", VideoCompositeEgressService)
