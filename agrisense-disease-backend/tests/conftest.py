import io
import pytest
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import Base, get_db
from app.services.model_service import model_service

# Use in-memory SQLite with StaticPool for test isolation
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_model():
    """Ensure AI model is loaded once for test session."""
    model_service.load_model()
    yield


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh isolated database schema for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """TestClient with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_leaf_image_bytes():
    """Generate a realistic test image resembling a green plant leaf."""
    img = Image.new("RGB", (256, 256), color=(34, 139, 34))  # Forest green
    draw = ImageDraw.Draw(img)
    # Draw leaf-like shape and vein lines
    draw.polygon([(128, 20), (220, 128), (128, 236), (36, 128)], fill=(46, 170, 46))
    draw.line([(128, 20), (128, 236)], fill=(20, 100, 20), width=3)
    draw.line([(128, 80), (180, 120)], fill=(20, 100, 20), width=2)
    draw.line([(128, 140), (80, 180)], fill=(20, 100, 20), width=2)
    # Add a yellowish spot simulating a lesion
    draw.ellipse([(140, 90), (160, 110)], fill=(200, 180, 50))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


@pytest.fixture
def sample_png_image_bytes():
    """Generate a test PNG image."""
    img = Image.new("RGB", (200, 200), color=(50, 205, 50))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def empty_file_bytes():
    """Zero byte payload."""
    return b""


@pytest.fixture
def corrupted_file_bytes():
    """Random non-image binary payload."""
    return b"\x00\x01\x02\x03FAKEIMAGEHEADERNOTVALID\xff\xfe\xfd"


@pytest.fixture
def oversized_file_bytes():
    """Generate payload exceeding 10 MB limit."""
    # 11 MB of dummy bytes
    return b"0" * (11 * 1024 * 1024)
