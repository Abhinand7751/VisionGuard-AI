# VisionGuard AI Architecture

## Phase 1 Overview

The application is split into backend, frontend, deployment, datasets, AI models, documentation, and tests. This keeps product code, infrastructure, documentation, and future machine learning assets separated from the beginning.

## Backend Layers

- `api`: HTTP route definitions and API versioning.
- `core`: cross-cutting application concerns such as settings and logging.
- `database`: engine, session, and migration integration.
- `models`: SQLAlchemy ORM models.
- `schemas`: Pydantic request and response contracts.
- `services`: business use cases.
- `detection`: future computer vision inference modules.
- `tracking`: future multi-object tracking modules.
- `alerts`: future alert dispatching and escalation modules.
- `utils`: shared helper utilities.

## Frontend Layers

- `components`: reusable UI elements.
- `layouts`: application shells such as the dashboard layout.
- `pages`: route-level screens.
- `services`: API clients and external integrations.
- `styles`: global styling.

## Phase 1 Boundaries

AI detection is intentionally omitted. The live camera page and streaming endpoint expose placeholders so the interface and integration shape can evolve without prematurely coupling the system to a model implementation.

## Camera And Event Foundation

The first confirmed module introduces two persistent resources:

- `Camera`: a registered CCTV source with name, stream URL, location, active state, and timestamps.
- `SurveillanceEvent`: an event record tied to a camera, with event type, severity, description, optional snapshot URL, and timestamps.

Routes stay thin and delegate work to service classes. Services receive SQLAlchemy sessions through FastAPI dependency injection, keeping persistence details out of route handlers.

The frontend reads camera and event counts through a dedicated API service. Empty and offline states are handled in the UI without introducing mock AI detections.

## Camera Management UI

The Cameras page provides operational CRUD controls for registered CCTV sources. It uses the same API client as the dashboard and live camera surfaces, so camera state is shared through backend persistence rather than local mock data.

The Events page supports camera and severity filtering. Camera filtering is passed to the backend API, while severity filtering is applied client-side until a richer query API is introduced.

Manual event recording lets operators create event records before AI detection exists. This is useful for validating persistence, filtering, and UI workflows without pretending the system is already detecting threats.

## Health And Validation

The health endpoint now reports database connectivity using a lightweight SQL check. Camera source validation happens in Pydantic schemas, so invalid stream formats are rejected before service logic creates database records.

## OpenCV Streaming

The streaming module exposes registered active cameras as multipart MJPEG responses. The frontend renders the stream through an image element, which keeps the browser integration simple and avoids introducing a custom video protocol before detection is added.

The stream service owns OpenCV capture lifecycle management and releases the camera when the response closes. This module does not perform object detection, tracking, or frame persistence.

Stream diagnostics open the configured camera source and attempt to read one frame. Snapshot capture uses the same OpenCV path, stores a JPEG under local storage, and creates a `snapshot_capture` surveillance event with the generated snapshot URL.

## Manual YOLO Detection

The first AI module performs YOLO inference on a single captured frame from an active registered camera. The detector is lazy-loaded so the API can start before model weights are loaded. Detection results include class names, confidence scores, bounding boxes, original snapshot URL, and annotated snapshot URL.

This is not yet continuous real-time threat detection. The next AI step should introduce a background detection worker or stream processor with event throttling and model lifecycle controls.

## Authentication

The authentication module adds a `User` model, password hashing, JWT token issuance, and protected API routes. The frontend stores the access token locally, attaches it to API requests, and protects dashboard routes behind a login page.

MJPEG streams are rendered by an image element, so the frontend appends the token as a query parameter for stream URLs. Standard JSON API calls continue to use the `Authorization: Bearer` header.
