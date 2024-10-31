"""
Test worker service factories.
"""

# pylint: disable=W0212,W0621,W0613

from dataclasses import FrozenInstanceError

from django.test import override_settings

import pytest

from core.recording.worker.factories import WorkerServiceConfig, WorkerServiceFactory


@pytest.fixture(autouse=True)
def clear_lru_cache():
    """Clear the lru_cache before and after each test"""
    WorkerServiceConfig.from_settings.cache_clear()
    yield
    WorkerServiceConfig.from_settings.cache_clear()


@pytest.fixture
def test_settings():
    """Fixture to provide test Django settings"""
    mocked_settings = {
        "RECORDING_OUTPUT_FOLDER": "/test/output",
        "LIVEKIT_CONFIGURATION": {"server": "test.example.com"},
        "RECORDING_VERIFY_SSL": True,
        "AWS_S3_ENDPOINT_URL": "https://s3.test.com",
        "AWS_S3_ACCESS_KEY_ID": "test_key",
        "AWS_S3_SECRET_ACCESS_KEY": "test_secret",
        "AWS_S3_REGION_NAME": "test-region",
        "AWS_STORAGE_BUCKET_NAME": "test-bucket",
    }

    # Use override_settings to properly patch Django settings
    with override_settings(**mocked_settings):
        yield test_settings


@pytest.fixture
def config(test_settings):
    """Fixture to provide a WorkerServiceConfig instance"""
    return WorkerServiceConfig.from_settings()


# Tests
def test_config_initialization(config):
    """Test that WorkerServiceConfig is properly initialized from settings"""
    assert config.output_folder == "/test/output"
    assert config.server_configurations == {"server": "test.example.com"}
    assert config.verify_ssl is True
    assert config.bucket_args == {
        "endpoint": "https://s3.test.com",
        "access_key": "test_key",
        "secret": "test_secret",
        "region": "test-region",
        "bucket": "test-bucket",
        "force_path_style": True,
    }


def test_config_immutability(config):
    """Test that config instances are immutable after creation"""
    with pytest.raises(FrozenInstanceError):
        config.output_folder = "new/path"


@override_settings(
    RECORDING_OUTPUT_FOLDER="/test/output",
    LIVEKIT_CONFIGURATION={"server": "test.example.com"},
    RECORDING_VERIFY_SSL=True,
    AWS_S3_ENDPOINT_URL="https://s3.test.com",
    AWS_S3_ACCESS_KEY_ID="test_key",
    AWS_S3_SECRET_ACCESS_KEY="test_secret",
    AWS_S3_REGION_NAME="test-region",
    AWS_STORAGE_BUCKET_NAME="test-bucket",
)
def test_config_caching():
    """Test that from_settings method caches its result"""
    # Clear cache before testing caching behavior
    WorkerServiceConfig.from_settings.cache_clear()

    config1 = WorkerServiceConfig.from_settings()
    config2 = WorkerServiceConfig.from_settings()
    assert config1 is config2


@pytest.fixture
def mock_worker_service():
    """Fixture to provide a mock WorkerService implementation"""

    class TestWorkerService:
        hrid = "test-worker"

        def __init__(self, config):
            """Mock init"""
            self.config = config

        def start(self, room_id, recording_id):
            """Mock start method"""
            return f"worker_{room_id}_{recording_id}"

        def stop(self, worker_id):
            """Mock stop method"""
            return f"stopped_{worker_id}"

    return TestWorkerService


@pytest.fixture
def factory():
    """Fixture to provide a clean WorkerServiceFactory instance"""
    return WorkerServiceFactory()


def test_factory_initialization(factory, config):
    """Test that factory is properly initialized"""
    assert factory._worker_service_registry == {}
    assert isinstance(factory._default_config, WorkerServiceConfig)
    assert factory._default_config == config


def test_register_worker_service(factory, mock_worker_service):
    """Test registering a new worker service"""
    factory.register("test", mock_worker_service)
    assert factory._worker_service_registry["test"] == mock_worker_service


def test_register_duplicate_worker_service(factory, mock_worker_service):
    """Test that registering a duplicate worker service raises an error"""
    factory.register("test", mock_worker_service)
    with pytest.raises(KeyError) as exc_info:
        factory.register("test", mock_worker_service)
    assert "already registered" in str(exc_info.value)


def test_create_worker_service(factory, mock_worker_service):
    """Test creating a worker service instance"""
    factory.register("test", mock_worker_service)
    worker = factory.create("test")
    assert isinstance(worker, mock_worker_service)
    assert worker.hrid == "test-worker"


def test_create_unknown_worker_service(factory):
    """Test that creating an unknown worker service raises an error"""
    with pytest.raises(ValueError) as exc_info:
        factory.create("unknown")
    assert "Unknown worker service" in str(exc_info.value)
