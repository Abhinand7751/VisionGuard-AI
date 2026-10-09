from fastapi.testclient import TestClient

from app.database.session import get_db
from app.main import create_app


def test_health_check_returns_ok() -> None:
    """Health endpoint returns a successful service status."""
    app = create_app()

    class FakeDatabaseSession:
        def execute(self, query: object) -> None:
            return None

    def override_get_db() -> FakeDatabaseSession:
        return FakeDatabaseSession()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ready"
    assert response.json()["database"] == "connected"
