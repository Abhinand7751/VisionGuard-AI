# VisionGuard AI

An Intelligent Real-Time CCTV Surveillance and Threat Detection System.

VisionGuard AI is a production-oriented starter architecture for a scalable CCTV surveillance platform. Phase 1 focuses on clean project structure, configuration, logging, Docker support, a FastAPI health API, a webcam streaming placeholder, and a React dashboard shell. The first confirmed module adds database-backed camera and event foundations. AI detection is intentionally not implemented yet.

## Tech Stack

- Backend: Python 3.12, FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pydantic, Loguru, OpenCV
- Frontend: React, TypeScript, Vite, TailwindCSS, Axios, React Router
- Deployment: Docker and Docker Compose

## Project Structure

```text
VisionGuard-AI/
  backend/
  frontend/
  docs/
  docker/
  datasets/
  ai_models/
  tests/
```

## Quick Start With Docker

1. Copy the environment file.

```bash
cp .env.example .env
```

2. Start the platform.

```bash
docker compose up --build
```

3. Open the services.

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health

## Local Backend Development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Local Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Phase 1 Scope

Included:

- Enterprise-style monorepo layout
- FastAPI application factory
- Settings management through environment variables
- Loguru logging configuration
- PostgreSQL database session wiring
- Alembic starter configuration
- Health check endpoint
- Webcam streaming placeholder endpoint
- Camera registry API
- Surveillance event API
- Initial Alembic migration for cameras and events
- React dark UI shell with Dashboard, Cameras, Live Camera, Events, and Settings pages
- Camera management UI for creating, editing, and deleting camera sources
- Event filtering UI by camera and severity
- Manual event recording UI for pre-AI workflow testing
- Camera source validation for RTSP, RTMP, HTTP, HTTPS, file, and numeric device sources
- Database-aware health response
- OpenCV MJPEG streaming endpoint for registered cameras
- Live Camera UI with camera selection and stream controls
- Stream health diagnostics endpoint
- Snapshot capture endpoint that records a surveillance event
- Manual YOLO detection endpoint for one captured camera frame
- Annotated detection snapshot storage
- JWT authentication with protected backend APIs
- React login page and protected dashboard routes
- Initial development admin user creation
- Dockerfiles and Docker Compose

Not included yet:

- YOLO object detection
- ByteTrack tracking
- Face recognition
- Real alerting pipelines
- Authentication and authorization

## Next Phase Candidate

The next module can harden public deployment with HTTPS, production secrets, and role-based access controls, or evolve YOLO from manual frame detection into a real-time detection loop.

## API Endpoints

- `GET /api/v1/health`: service and database health check.
- `GET /api/v1/stream/webcam`: webcam stream placeholder.
- `GET /api/v1/stream/cameras/{camera_id}/mjpeg`: MJPEG stream for an active registered camera.
- `GET /api/v1/stream/cameras/{camera_id}/health`: check whether a camera source can return frames.
- `POST /api/v1/stream/cameras/{camera_id}/snapshot`: capture a snapshot and create a surveillance event.
- `POST /api/v1/detection/cameras/{camera_id}/yolo`: capture one frame and run YOLO detection.
- `POST /api/v1/auth/login`: authenticate and return a JWT token.
- `GET /api/v1/auth/me`: return the authenticated user.
- `GET /api/v1/cameras`: list registered cameras.
- `POST /api/v1/cameras`: create a camera.
- `GET /api/v1/cameras/{camera_id}`: fetch a camera.
- `PATCH /api/v1/cameras/{camera_id}`: update a camera.
- `DELETE /api/v1/cameras/{camera_id}`: delete a camera and its events.
- `GET /api/v1/events`: list surveillance events.
- `POST /api/v1/events`: create a surveillance event for an existing camera.
- `GET /api/v1/events/{event_id}`: fetch a surveillance event.

## Database Migrations

Run migrations from the backend directory after PostgreSQL is available.

```bash
cd backend
alembic upgrade head
```

After the authentication migration is applied for the first time, restart the backend once so the development admin user is created:

```bash
docker compose restart backend
```

Default development credentials:

```text
Email: admin@visionguard.local
Password: ChangeMe123!
```

Change these values in `.env` before exposing the app outside your machine.

## Camera Streaming Notes

RTSP, RTMP, HTTP, HTTPS, and file-based camera sources can be opened by the backend container when the source is reachable from Docker. Numeric webcam sources such as `0` may not work from Docker Desktop on Windows because the Linux container usually cannot see the host laptop webcam directly. If that happens, run the backend locally on Windows for webcam development or use an IP/RTSP camera source.

Snapshots are stored under `backend/storage/snapshots` and served from `/storage/snapshots/...`. Local snapshot files are ignored by Git.

## YOLO Detection Notes

The first YOLO module runs detection on one captured frame from a selected camera. Annotated results are stored under `backend/storage/detections` and served from `/storage/detections/...`. If detections are found, the backend records a `yolo_detection` surveillance event.

The default Docker model path is `/ai_models/yolov8n.pt`, mounted from the root `ai_models/` folder. On first use, Ultralytics may download the model if it is not already available. Continuous real-time detection and tracking are intentionally left for a later module.
