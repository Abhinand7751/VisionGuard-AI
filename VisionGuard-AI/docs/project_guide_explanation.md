# VisionGuard AI - Simple Project Documentation

## 1. Project Title

**VisionGuard AI**

**Subtitle:** An Intelligent Real-Time CCTV Surveillance and Threat Detection System

VisionGuard AI is a web-based CCTV monitoring platform. It allows an operator to log in, register a camera, view the camera stream, capture snapshots, run YOLO object detection, and store detection events with images.

The main purpose of this project is to show how computer vision and web technologies can be combined to build a real-time security monitoring system.

## 2. Problem Statement

Traditional CCTV systems mostly record video, but they usually need a human to continuously watch the screen. This is difficult because one person cannot monitor many cameras all the time.

VisionGuard AI tries to solve this problem by adding AI support to CCTV monitoring. The system can capture a frame from a live camera, run object detection, save the result, and show the event inside a dashboard.

In the current version, detection is manually triggered from the user interface. This keeps the system stable for demonstration while still proving the complete AI workflow.

## 3. Main Objectives

The main objectives of VisionGuard AI are:

1. Build a secure surveillance dashboard.
2. Connect an IP camera or phone camera.
3. Stream live camera video through the backend.
4. Capture snapshots from the camera.
5. Run YOLO object detection on a captured frame.
6. Store detection events in the database.
7. Display event images and detection results in the frontend.
8. Provide dashboard metrics such as camera count, event count, and alert status.
9. Keep the architecture modular so future AI modules can be added.

## 4. Technology Stack

### Backend

- **Python 3.12:** Main backend programming language.
- **FastAPI:** Used to create REST APIs.
- **OpenCV:** Used to connect to camera streams and capture frames.
- **Ultralytics YOLO:** Used for object detection.
- **SQLAlchemy:** Used to communicate with the database.
- **Alembic:** Used for database migrations.
- **PostgreSQL:** Stores cameras, users, and surveillance events.
- **Pydantic:** Validates request and response data.
- **Loguru:** Handles logging.

### Frontend

- **React:** Builds the user interface.
- **TypeScript:** Adds type safety to frontend code.
- **Vite:** Runs and builds the frontend quickly.
- **TailwindCSS:** Handles styling and dark theme UI.
- **Axios:** Communicates with the backend APIs.
- **React Router:** Handles frontend page navigation.

### Deployment

- **Docker:** Runs backend, frontend, and database in containers.
- **Docker Compose:** Starts all services together.

## 5. Project Folder Structure

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

### Explanation

- `backend/` contains the FastAPI server, database models, services, and AI logic.
- `frontend/` contains the React dashboard.
- `docs/` contains architecture and project documentation.
- `docker/` contains Docker-related documentation.
- `datasets/` is reserved for future training or testing datasets.
- `ai_models/` stores AI model files such as YOLO weights.
- `tests/` is reserved for project-level tests.

## 6. Backend Architecture

The backend is divided into clean layers:

```text
backend/app/
  api/
  core/
  database/
  models/
  schemas/
  services/
  detection/
  tracking/
  alerts/
  utils/
  main.py
```

### Layer Explanation

- `api/`: Defines API endpoints such as login, cameras, events, stream, and detection.
- `core/`: Contains configuration, security, and logging setup.
- `database/`: Contains database connection and session handling.
- `models/`: Contains SQLAlchemy database tables.
- `schemas/`: Contains Pydantic request and response models.
- `services/`: Contains business logic such as camera management and event management.
- `detection/`: Contains YOLO detection logic.
- `tracking/`: Reserved for future ByteTrack integration.
- `alerts/`: Reserved for future alert notifications.
- `utils/`: Reserved for shared helper functions.
- `main.py`: Creates and starts the FastAPI application.

This structure follows modular architecture. Each part has a clear responsibility, so the project is easier to maintain and extend.

## 7. Frontend Architecture

The frontend is also separated by responsibility:

```text
frontend/src/
  auth/
  components/
  layouts/
  pages/
  services/
  styles/
```

### Page Explanation

- **Login Page:** Allows the operator to sign in.
- **Dashboard:** Shows system metrics, camera overview, recent events, and threat level.
- **Cameras:** Allows camera registration and management.
- **Live Camera:** Shows the live stream, snapshot option, and YOLO detection button.
- **Events:** Shows saved events with severity, description, and image preview.
- **Settings:** Shows system information and API configuration.

## 8. Database Design

The project currently uses these main database tables:

### Users Table

Stores login users.

Important fields:

- `id`
- `email`
- `hashed_password`
- `full_name`
- `is_active`
- `is_superuser`

### Cameras Table

Stores registered camera sources.

Important fields:

- `id`
- `name`
- `stream_url`
- `location`
- `is_active`
- `created_at`
- `updated_at`

### Surveillance Events Table

Stores snapshot and detection events.

Important fields:

- `id`
- `camera_id`
- `event_type`
- `severity`
- `description`
- `snapshot_url`
- `detected_at`
- `created_at`

## 9. Authentication Flow

VisionGuard AI uses JWT authentication.

Simple flow:

1. User opens the login page.
2. User enters email and password.
3. Backend checks the password.
4. Backend returns a JWT access token.
5. Frontend stores the token.
6. Frontend sends the token with protected API requests.
7. Backend allows access only if the token is valid.

Default development login:

```text
Email: admin@visionguard.local
Password: ChangeMe123!
```

These credentials are only for development and demonstration.

## 10. Camera Connection Flow

The current project uses an IP camera or phone camera.

Example phone camera URL:

```text
http://192.168.1.3:8080/video
```

Flow:

1. The phone camera app starts a local camera server.
2. The operator registers the camera URL in VisionGuard AI.
3. Backend uses OpenCV to open the camera URL.
4. Backend converts frames into an MJPEG stream.
5. Frontend displays the stream inside the Live Camera page.

This is useful because Docker on Windows may not directly access the laptop webcam. A phone IP camera is easier and more reliable for demonstration.

## 11. Snapshot Flow

The snapshot feature captures one frame from the camera.

Flow:

1. Operator clicks **Snapshot**.
2. Backend opens the camera stream.
3. Backend reads one frame using OpenCV.
4. Backend saves the image in local storage.
5. Backend creates a `snapshot_capture` event in the database.
6. Frontend displays the latest snapshot.

Snapshot files are stored in:

```text
backend/storage/snapshots/
```

## 12. YOLO Detection Flow

YOLO detection is currently manual.

Flow:

1. Operator opens the Live Camera page.
2. Operator clicks **Run YOLO Detection**.
3. Backend captures one frame from the selected camera.
4. YOLO runs object detection on that frame.
5. Backend creates an annotated image with bounding boxes.
6. Backend stores the annotated image.
7. Backend creates a `yolo_detection` event if objects are detected.
8. Frontend displays the detection result and image.

Annotated detection images are stored in:

```text
backend/storage/detections/
```

## 13. Event Severity Logic

The system assigns severity to YOLO events.

Current simple rules:

- `critical`: dangerous classes such as fire, smoke, knife, or gun.
- `high`: person or vehicle classes.
- `medium`: other detected objects.
- `low`: animal-only detections such as horse, dog, cat, cow, and similar classes.

This is a basic rule-based severity system. It helps the dashboard show a threat level, but it can be improved later with more advanced logic.

## 14. Dashboard Metrics

The dashboard shows:

- Number of registered cameras.
- Number of active cameras.
- Total recorded events.
- Events recorded in the last 24 hours.
- High and critical alert count.
- Detection engine status.
- Current threat level.

Threat level examples:

- `STABLE`: No high-priority events.
- `MONITORING`: Medium events exist.
- `ELEVATED`: High severity events exist.
- `CRITICAL`: Critical severity events exist.

## 15. Important API Endpoints

### Authentication

```text
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Health

```text
GET /api/v1/health
```

### Cameras

```text
GET    /api/v1/cameras
POST   /api/v1/cameras
GET    /api/v1/cameras/{camera_id}
PATCH  /api/v1/cameras/{camera_id}
DELETE /api/v1/cameras/{camera_id}
```

### Streaming

```text
GET  /api/v1/stream/cameras/{camera_id}/mjpeg
GET  /api/v1/stream/cameras/{camera_id}/health
POST /api/v1/stream/cameras/{camera_id}/snapshot
```

### Detection

```text
POST /api/v1/detection/cameras/{camera_id}/yolo
```

### Events

```text
GET  /api/v1/events
POST /api/v1/events
GET  /api/v1/events/{event_id}
```

### Dashboard

```text
GET /api/v1/dashboard/summary
```

## 16. Docker Deployment

The project uses Docker Compose to run three services:

1. `frontend`: React application.
2. `backend`: FastAPI application.
3. `db`: PostgreSQL database.

Command to start:

```powershell
docker compose up -d --build
```

Command to check status:

```powershell
docker compose ps
```

Expected containers:

```text
visionguard-frontend
visionguard-backend
visionguard-db
```

## 17. How To Run The Project For Demo

1. Start Docker Desktop.
2. Open PowerShell.
3. Go inside the project folder:

```powershell
cd "C:\Users\Aabhi\OneDrive\Documents\a sample for my new project\VisionGuard-AI"
```

4. Start the project:

```powershell
docker compose up -d --build
```

5. Open the frontend:

```text
http://localhost:5173/login
```

6. Login with the development admin account.
7. Go to Cameras and register the phone camera.
8. Go to Live Camera and start the stream.
9. Click Run YOLO Detection.
10. Go to Events and show the saved event image.
11. Return to Dashboard and show updated metrics.

## 18. Testing Checklist

Use this checklist before project presentation:

- Docker Desktop is running.
- `docker compose ps` shows backend, frontend, and db running.
- Login works.
- Dashboard loads.
- Camera is registered.
- Live camera stream is visible.
- Stream health shows ready.
- Snapshot works.
- YOLO detection runs.
- Annotated image is visible.
- Event is recorded.
- Event image is visible in Events page.
- Dashboard metrics update after event creation.

## 19. Current Limitations

The current version is stable for demonstration, but it still has limitations:

1. YOLO detection is manual, not continuous.
2. Real-time background detection is not implemented yet.
3. ByteTrack object tracking is planned for a future phase.
4. Face recognition is planned for a future phase.
5. Alert notification through email, SMS, or WhatsApp is not implemented yet.
6. Production deployment needs stronger secrets, HTTPS, and role-based permissions.
7. Some YOLO results may be incorrect if the camera is rotated or the image is unclear.

## 20. Future Enhancements

Future improvements can include:

- Continuous real-time YOLO detection.
- ByteTrack for tracking the same object across frames.
- Face recognition for authorized and unauthorized person detection.
- Fire, smoke, and weapon detection modules.
- Automatic alert notifications.
- Camera rotation controls.
- Role-based user permissions.
- Cloud deployment with HTTPS.
- Advanced analytics dashboard.
- Event search and export.

## 21. Simple Explanation For Project Guide

VisionGuard AI is a smart CCTV monitoring system. The system has a backend, frontend, database, and AI model. The frontend is used by the operator. The backend connects to the camera, captures frames, runs YOLO detection, and stores events in PostgreSQL.

When a camera is registered, the backend uses OpenCV to read the camera stream. The frontend displays the live stream. When the operator clicks Run YOLO Detection, the backend captures one frame and sends it to YOLO. YOLO returns detected objects with confidence values and bounding boxes. The backend saves an annotated image and stores an event in the database. The frontend then shows the event and image in the Events page.

The dashboard gives an overview of the system. It shows camera count, event count, alert count, and threat level. This helps the operator understand the current security status quickly.

The project is built in a modular way, so future features like tracking, face recognition, and automatic alerts can be added without changing the whole system.

## 22. Short Viva Questions And Answers

### What is VisionGuard AI?

VisionGuard AI is a CCTV surveillance platform that uses computer vision and YOLO object detection to monitor camera streams and record security events.

### Why did you use FastAPI?

FastAPI is fast, modern, and supports automatic API documentation. It also works well with Pydantic validation and dependency injection.

### Why did you use React?

React helps build a dynamic user interface with reusable components. It is useful for dashboards because the UI changes based on API data.

### Why did you use PostgreSQL?

PostgreSQL is reliable and suitable for storing structured data such as users, cameras, and events.

### Why did you use Docker?

Docker makes the project easier to run because backend, frontend, and database can start together with one command.

### What is YOLO used for?

YOLO is used to detect objects in camera frames. It returns object class names, confidence scores, and bounding boxes.

### Is detection real-time now?

The current version runs detection manually on one captured frame. Continuous real-time detection is planned for the next phase.

### What is the main advantage of this project?

The main advantage is that it combines live CCTV streaming, AI detection, event recording, and dashboard monitoring in one system.

### What are the future improvements?

Future improvements include continuous detection, object tracking with ByteTrack, face recognition, automatic alerts, and production deployment.

## 23. Conclusion

VisionGuard AI demonstrates how CCTV surveillance can be improved using AI and modern web technologies. The current system supports secure login, camera registration, live streaming, snapshot capture, YOLO detection, event storage, image display, and dashboard metrics.

This project is a strong foundation for a complete enterprise surveillance platform. It is modular, scalable, and ready for future AI features such as real-time detection, tracking, face recognition, and automated alerts.
