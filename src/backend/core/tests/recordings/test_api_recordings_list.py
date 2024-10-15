"""
Test recordings API endpoints in the Meet core app: list.
"""

from unittest import mock

import pytest
from rest_framework.pagination import PageNumberPagination
from rest_framework.test import APIClient

from core import factories

pytestmark = pytest.mark.django_db


def test_api_recordings_list_anonymous():
    """Anonymous users should not be able to list recordings."""
    factories.RecordingFactory(room__is_public=False)
    factories.RecordingFactory(room__is_public=True)

    response = APIClient().get("/api/v1.0/recordings/")

    assert response.status_code == 200
    assert response.json() == {
        "count": 0,
        "next": None,
        "previous": None,
        "results": [],
    }


def test_api_recordings_list_authenticated():
    """
    Authenticated users listing recordings, should only see the recordings
    to which they are related.
    """
    user = factories.UserFactory()
    client = APIClient()
    client.force_login(user)

    other_user = factories.UserFactory()

    factories.RecordingFactory(room__is_public=False)
    factories.RecordingFactory(room__is_public=True)
    factories.RecordingFactory(room__is_public=False, room__users=[other_user])

    recording = factories.RecordingFactory(room__is_public=False, room__users=[user])
    room = recording.room

    response = client.get(
        "/api/v1.0/recordings/",
    )

    assert response.status_code == 200
    results = response.json()["results"]
    assert len(results) == 1
    expected_ids = {
        str(recording.id),
    }
    result_ids = {result["id"] for result in results}
    assert expected_ids == result_ids
    assert results[0] == {
        "id": str(recording.id),
        "created_at": recording.created_at.isoformat().replace("+00:00", "Z"),
        "stopped_at": None,
        "room": {
            "id": str(room.id),
            "is_public": room.is_public,
            "name": room.name,
            "slug": room.slug,
        },
        "status": "recording",
        "updated_at": recording.updated_at.isoformat().replace("+00:00", "Z"),
    }


@mock.patch.object(PageNumberPagination, "get_page_size", return_value=2)
def test_api_recordings_list_pagination(_mock_page_size):
    """Pagination should work as expected."""
    user = factories.UserFactory()
    client = APIClient()
    client.force_login(user)

    recordings = factories.RecordingFactory.create_batch(3, room__users=[user])
    recording_ids = [str(r.id) for r in recordings]

    response = client.get("/api/v1.0/recordings/")

    assert response.status_code == 200
    content = response.json()
    assert content["count"] == 3
    assert content["next"] == "http://testserver/api/v1.0/recordings/?page=2"
    assert content["previous"] is None

    assert len(content["results"]) == 2
    for item in content["results"]:
        recording_ids.remove(item["id"])

    # Get page 2
    response = client.get(
        "/api/v1.0/recordings/?page=2",
    )

    assert response.status_code == 200
    content = response.json()

    assert content["count"] == 3
    assert content["next"] is None
    assert content["previous"], "http://testserver/api/v1.0/recordings/"

    assert len(content["results"]) == 1
    recording_ids.remove(content["results"][0]["id"])
    assert recording_ids == []


def test_api_recordings_list_authenticated_distinct():
    """A recording for a public room with several related users should only be listed once."""
    user = factories.UserFactory()
    other_user = factories.UserFactory()
    client = APIClient()
    client.force_login(user)

    recording = factories.RecordingFactory(
        room__is_public=True, room__users=[user, other_user]
    )

    response = client.get("/api/v1.0/recordings/")

    assert response.status_code == 200
    content = response.json()
    assert len(content["results"]) == 1
    assert content["results"][0]["id"] == str(recording.id)
