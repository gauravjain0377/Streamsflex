## Streamsflex

Premium, responsive, and creator‑focused video streaming platform — built with React, Node.js, MongoDB, and Cloudinary.

Streamsflex lets you upload long‑form videos once and deliver them seamlessly across desktop, tablet, and mobile with a YouTube‑style experience: custom player, instant thumbnails, watch analytics, likes, and a focused admin dashboard. The project is structured as a single repository containing both the **frontend (Vite + React + TypeScript)** and the **backend (Express + MongoDB + Cloudinary)** so it can be developed and deployed end‑to‑end with minimal friction.

---

### Table of Contents

- **[About](#about)**
- **[Features](#features)**
- **[Tech Stack](#tech-stack)**
- **[Screenshots](#screenshots)**
- **[Folder Structure](#folder-structure)**
- **[Installation](#installation)**
- **[Environment Variables](#environment-variables)**
- **[Running](#running)**
- **[API Overview](#api-overview)**
- **[Contributing](#contributing)**
- **[Contact](#contact)**
- **[Future Enhancements](#future-enhancements)**

---

## About

Streamsflex is designed for creators and small teams who want to host and share their own video content without building a full video platform from scratch.

Instead of dealing with raw file storage, transcoding pipelines, and analytics by hand, you:

- Upload a video (and optionally a thumbnail),
- Let Cloudinary handle video + thumbnail storage,
- Track real‑time views, devices, likes, and duration in MongoDB,
- Share clean, stable watch links with your audience,
- Monitor performance from an integrated admin dashboard.

The goal is a product‑grade experience that feels familiar to users (similar to YouTube) but runs entirely on your own stack and database.

---

## Features

- **Creator‑ready video uploads**
  - Upload videos directly from the browser using a polished upload flow.
  - Optional thumbnail upload; if none is provided, the first‑second frame is used via Cloudinary.
  - Only URLs and metadata are stored in MongoDB – no large files in your database.

- **Modern playback experience**
  - Custom `VideoPlayer` with:
    - Center and bottom play/pause controls.
    - Always‑visible timeline and seek bar.
    - Volume slider and playback speed controls (0.5x–2x).
    - Fullscreen toggle (enter and exit with the same button).
  - Responsive layout that adapts intelligently to desktop, tablet, and mobile.

- **Engagement & analytics**
  - View counts persisted per video.
  - Device breakdown (desktop / tablet / mobile) for each view.
  - Video duration captured from the player and written back to MongoDB.
  - Likes stored in the database and reflected instantly on the UI.

- **Sharing & social distribution**
  - Stable watch URLs in the format: `#/watch/:id`.
  - Share modal with:
    - Native share support (where available).
    - One‑click links for WhatsApp and X (Twitter).
    - “Copy link” to share anywhere.

- **Admin dashboard**
  - High‑level view of platform performance:
    - Total views and device mix.
    - Per‑video metrics driven entirely by live MongoDB data.

- **Deployment‑friendly architecture**
  - Frontend optimized for static hosting (e.g. Vercel).
  - Backend ready for Node hosts (e.g. Render).
  - Clean separation using `VITE_API_BASE_URL` so the frontend can talk to any API base.

---

## Tech Stack

- **Frontend**
  - React + TypeScript (Vite)
  - React Router (`Home`, `Upload`, `Watch`, `Admin`)
  - Utility‑first styling (Tailwind‑style classes)
  - Context providers:
    - `VideoContext` for video list, views, likes, and updates
    - `DeviceContext` for responsive behavior (desktop / tablet / mobile)

- **Backend**
  - Node.js + Express (`server/index.js`)
  - MongoDB with Mongoose (`Video` schema + analytics)
  - Multer (in‑memory) for `multipart/form-data` uploads
  - Cloudinary Node SDK for video + thumbnail storage

- **Tooling**
  - Vite dev server and build pipeline
  - TypeScript via `tsconfig.json`
  - Environment‑driven configuration (`.env`, `VITE_API_BASE_URL`)

---

## Folder Structure

Streamsflex/
├─ server/
│  └─ index.js            # Express API (MongoDB + Cloudinary, uploads, views, likes)
│
├─ pages/
│  ├─ Home.tsx            # Discover / listing page
│  ├─ Upload.tsx          # Video + thumbnail upload experience
│  ├─ Watch.tsx           # Watch page with custom player, likes, share
│  └─ Admin.tsx           # Admin analytics dashboard
│
├─ components/
│  └─ VideoPlayer.tsx     # Custom HTML5 video player + controls + fullscreen
│
├─ context/
│  ├─ DeviceContext.tsx   # Desktop / tablet / mobile detection
│  └─ VideoContext.tsx    # Video list, add/update, views, likes
│
├─ utils/
│  ├─ api.ts              # API base URL helper (VITE_API_BASE_URL aware)
│  └─ deviceUtils.ts      # Device utilities and aspect‑ratio helpers
│
├─ App.tsx                # Application shell and routing
├─ index.tsx              # React entrypoint
├─ types.ts               # Shared TypeScript types (Video, DeviceType, etc.)
├─ constants.ts           # UI constants and breakpoints
├─ vite.config.ts         # Vite configuration + local /api proxy
└─ package.json           # NPM scripts and dependencies---

## Installation

- **Prerequisites**
  - Node.js 18+ (LTS recommended)
  - npm
  - MongoDB instance (Atlas or self‑hosted)
  - Cloudinary account (for video + thumbnail storage)

- **Clone**

git clone https://github.com/gauravjain0377/Streamsflex.git
cd Streamsflex- **Install dependencies (single root project)**

npm install---

## Environment Variables

### Backend (`.env` at project root, used by `server/index.js`)

PORT=5000

MONGODB_URI=your-mongodb-connection-string

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
**`MONGODB_URI`** – MongoDB Atlas or local connection string.
- **`CLOUDINARY_*`** – Cloud name, API key, and API secret from the Cloudinary dashboard.
- **`PORT`** – Optional; defaults to `5000`.

### Frontend (Vite, e.g. `.env.local`)

VITE_API_BASE_URL=http://localhost:5000- In development, point this to your local backend.
- In production, set it to your deployed API, e.g. `https://streamsflex.onrender.com`.

The helper `apiUrl` in `utils/api.ts` uses this value (and falls back to relative paths for localhost) for all network requests.

---

## Running

### Local development

1. **Start the backend**

  
   npm run server
      - Runs `node server/index.js`.
   - Verify with `http://localhost:5000/api/health` → `{ "status": "ok" }`.

2. **Start the frontend**

   In a second terminal:

  
   npm run dev
      - Vite starts on `http://localhost:5173` (or similar).
   - Ensure `VITE_API_BASE_URL=http://localhost:5000` (or leave it empty to use relative `/api` paths).

In hosted environments, deploy:

- The **frontend** (built `dist/` folder) to a static host like Vercel.
- The **backend** (`server/index.js`) to a Node host like Render.

---

## API Overview

Base URL is defined by `VITE_API_BASE_URL` on the frontend:

- Local: `http://localhost:5000`
- Production: e.g. `https://streamsflex.onrender.com`

### Core endpoints

- **GET `/api/health`**  
  Health check; returns `{ "status": "ok" }`.

- **GET `/api/videos`**  
  Returns a list of all videos (newest first).

- **POST `/api/videos`**  
  Upload a new video.
  - `multipart/form-data` with:
    - `video`: required file.
    - `thumbnail`: optional file.
    - `title`: required string.
    - `description`: required string.
    - `uploader`: optional string.

- **POST `/api/videos/:id/view`**  
  Increment views and device analytics for a video.  
  Body: `{ "device": "desktop" | "tablet" | "mobile" }`.

- **POST `/api/videos/:id/duration`**  
  Persist the rounded duration (in seconds) once the player knows it.  
  Body: `{ "duration": number }`.

- **POST `/api/videos/:id/like`**  
  Increment the like count for a video.

- **GET `/`**  
  Returns `"Streamsflex API is running"` – useful to confirm backend is alive.

---

## Contributing

This project is currently developed and maintained by a single owner, but the structure is kept simple so it can be extended easily.

- **If you fork or extend it**:
  - Keep changes focused and documented.
  - Update env variable sections if you add new external services.
  - Prefer small, well‑named components and clear TypeScript types.

- **Good areas to improve**:
  - Richer analytics and charts on the admin dashboard.
  - Better error messages and retry flows around uploads.
  - Accessibility and keyboard navigation in the custom video player.

---

## Contact

**Developed by:** Gaurav Jain  
**Email:** [jaingaurav906@gmail.com](mailto:jaingaurav906@gmail.com)  
**LinkedIn:** [linkedin.com/in/this-is-gaurav-jain/](https://www.linkedin.com/in/this-is-gaurav-jain/)  
**GitHub:** [github.com/gauravjain0377](https://github.com/gauravjain0377)  
**𝕏:** [x.com/gauravjain0377](https://x.com/gauravjain0377)

---

## Future Enhancements

- **Authentication & user profiles**
  - Secure login, per‑user libraries, and creator dashboards.

- **Comments and community**
  - Threaded comments, replies, and moderation tools.

- **Advanced streaming**
  - HLS/DASH with adaptive bitrate and better start times on slow networks.

- **Discovery & SEO**
  - Search, tags, categories, and rich link previews (Open Graph / social cards).

- **Operational tooling**
  - Detailed analytics (retention, watch time per device).
  - Admin controls for flagging and managing content.
 
  ---

Crafted for developers and creators who value speed, control, and a polished viewing experience.
