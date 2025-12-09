## Streamsflex

Streamsflex is a modern, creator‑first video streaming platform that lets you upload long‑form videos once and deliver them everywhere – desktop, tablet and mobile – with a smooth, YouTube‑style viewing experience.

Built for small teams and individual creators, it turns raw video files into shareable, branded experiences with automatic thumbnails, watch analytics, likes, and a focused admin dashboard – without asking you to manage heavy video infrastructure yourself.

This repository contains both the **React/Vite frontend** and the **Node.js/Express + MongoDB API**, wired together to behave like a single, production‑ready product.

---

### Table of contents

- **[1. Core product capabilities](#1-core-product-capabilities)**
- **[2. Tech stack](#2-tech-stack)**
- **[3. Project structure](#3-project-structure)**
- **[4. Backend API](#4-backend-api-serverindexjs)**
- **[5. Environment variables](#5-environment-variables)**
- **[6. Running locally](#6-running-locally)**
- **[7. Deployment setup](#7-deployment-setup)**
- **[8. Usage guide](#8-usage-guide)**
- **[9. Notes about imagekit video processing units](#9-notes-about-imagekit-video-processing-units)**
- **[10. Scripts](#10-scripts)**
- **[11. Future improvements](#11-future-improvements-ideas)**

---

## 1. Core product capabilities

- **Video upload**
  - Uploads video files from the browser.
  - Optional custom thumbnail image upload.
  - If no thumbnail is uploaded, ImageKit’s **first-frame thumbnail** is used.
  - Only **links** (URL to video + thumbnail) and metadata are stored in MongoDB.

- **Playback**
  - Custom `VideoPlayer` component with:
    - Play / pause (center click and bottom button)
    - Always-visible timeline and scrubber
    - Volume control
    - Playback speed (0.5x, 1x, 1.5x, 2x)
    - Fullscreen toggle (enter and exit)
  - Device-aware layout:
    - Desktop, tablet and mobile aspect ratios and sizing.

- **Analytics**
  - **Views** counted per video.
  - **Device breakdown**: desktop, tablet, mobile.
  - **Duration** stored in DB after first watch (so length shows on cards).
  - Used by the **Admin dashboard** for dynamic stats.

- **Likes**
  - Any user can like a video.
  - Likes are stored in MongoDB and visible to everyone.

- **Sharing**
  - Each video has a **watch link**:  
    `https://your-frontend.com/#/watch/:id`
  - Share modal with:
    - System/native share (on supported devices).
    - Prebuilt links for **WhatsApp** and **X (Twitter)**.
    - “Copy link” button.

---

## 2. Tech stack

- **Frontend**
  - Vite + React + TypeScript
  - Tailwind-style utility classes (via your styling setup)
  - React Router (pages like `Home`, `Upload`, `Watch`, `Admin`)
  - Context-based state:
    - `VideoContext` for videos, views, likes, etc.
    - `DeviceContext` for desktop/tablet/mobile detection

- **Backend**
  - Node.js + Express
  - MongoDB (via Mongoose)
  - ImageKit Node SDK
  - Multer (in-memory) for multipart form uploads

---

## 3. Project structure

Overall layout of the repository:

```text
Streamsflex/
├─ server/
│  └─ index.js            # Express API (MongoDB + ImageKit, uploads, views, likes)
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
│  └─ deviceUtils.ts      # Device + aspect ratio utilities
│
├─ App.tsx                # Application shell and route wiring
├─ index.tsx              # React entrypoint
├─ types.ts               # Shared TypeScript types (Video, DeviceType, etc.)
├─ constants.ts           # UI constants and breakpoints
├─ vite.config.ts         # Vite configuration + local /api proxy
└─ package.json           # NPM scripts and dependencies
```

---

## 4. Backend API (server/index.js)

Base URL depends on environment:

- **Local dev**: `http://localhost:5000`
- **Render (production)**: e.g. `https://streamsflex.onrender.com`

### 4.1 Health check

- **GET** `/api/health`  
  Returns `{ status: "ok" }` if the API server is up.

### 4.2 Get all videos

- **GET** `/api/videos`
- **Response**: JSON array of video objects:

Fields (simplified):

- `_id: string`
- `title: string`
- `description: string`
- `originalUrl: string` – ImageKit video URL.
- `thumbnailUrl: string` – ImageKit thumbnail URL.
- `uploadedBy: string`
- `createdAt: string`
- `duration: number` – in seconds.
- `size: number` – in bytes.
- `likes: number`
- `analytics: { views: number, devices: { desktop, tablet, mobile }, watchTime: number }`

### 4.3 Upload video

- **POST** `/api/videos`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `video` – required, the video file.
  - `thumbnail` – optional, an image file.
  - `title` – required string.
  - `description` – required string.
  - `uploader` – optional string (who uploaded).

**Behavior:**

- Uses Multer in-memory storage to accept the files.
- Uploads video to ImageKit (folder: `/streamflex/videos`).
- If thumbnail is provided:
  - Uploads the thumbnail image to ImageKit (folder: `/streamflex/thumbnails`).
- If thumbnail is **not** provided:
  - Uses ImageKit’s first-frame thumbnail convention:  
    `thumbnailUrl = videoUploadResponse.url + "/ik-thumbnail.jpg"`.
- Saves a new `Video` document in MongoDB with:
  - `title`, `description`, `originalUrl`, `thumbnailUrl`,
  - `uploadedBy`, `size`, `duration=0` initially, `likes=0`, analytics defaults.

### 4.4 Increment view

- **POST** `/api/videos/:id/view`
- **Body (JSON)**:
  - `device: "desktop" | "tablet" | "mobile"`

**Behavior:**

- Finds video by `id`.
- Increments:
  - `analytics.views`
  - `analytics.devices[device]`.
- Returns updated video.

### 4.5 Update duration

- **POST** `/api/videos/:id/duration`
- **Body (JSON)**:
  - `duration: number` (seconds)

**Behavior:**

- Validates and rounds the duration.
- Updates `video.duration`.
- Returns updated video.

Used by `Watch.tsx` when the player first knows the exact duration.

### 4.6 Like a video

- **POST** `/api/videos/:id/like`

**Behavior:**

- Finds video by `id`.
- Increments `likes` by 1.
- Returns updated video.

### 4.7 Root route

- **GET** `/`
  - Returns simple text: `"Streamsflex API is running"`.
  - Useful on Render to confirm your API is live.

---

## 5. Environment variables

### 5.1 Backend (.env for `server/index.js`)

Create a `.env` file in the project root (Render will set these in its dashboard):

```env
PORT=5000

MONGODB_URI=your-mongodb-connection-string

IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

Notes:

- `MONGODB_URI` – from MongoDB Atlas or your Mongo instance.
- `IMAGEKIT_*` – from your ImageKit dashboard.

### 5.2 Frontend (Vite env)

For **local development**, create `.env.local` in the root:

```env
VITE_API_BASE_URL=http://localhost:5000
```

For **Vercel deployment (production)**, set in **Vercel project settings → Environment Variables**:

```text
VITE_API_BASE_URL = https://your-backend.onrender.com
```

Vite (and the helper `apiUrl` in `utils/api.ts`) will then build all API URLs using this base.

---

## 6. Running locally

### 6.1 Prerequisites

- Node.js (LTS recommended; project was tested around Node 18+ / 20+).
- MongoDB Atlas connection (or local Mongo instance).
- ImageKit account and keys.

### 6.2 Install dependencies

From project root:

```bash
npm install
```

### 6.3 Start backend (Express API)

Make sure `.env` is configured, then:

```bash
npm run server
```

This runs `node server/index.js` and listens on `PORT` (default `5000`).

Check:

- `http://localhost:5000/api/health` → `{ "status": "ok" }`

### 6.4 Start frontend (Vite dev server)

In another terminal:

```bash
npm run dev
```

Then open the printed `http://localhost:5173` (or similar) URL.

During local dev:

- `VITE_API_BASE_URL` is typically `http://localhost:5000`.

---

## 7. Deployment setup

### 7.1 Frontend on Vercel


## 8. Usage guide

### 8.1 Uploading a video

1. Go to the **Upload** page.
2. Fill in:
   - Title
   - Description
   - Uploader name (optional)
3. Select a **video file** (there is a client-side max size check to avoid huge, extremely slow uploads).
4. Optionally pick a **thumbnail image**:
   - If you skip this, ImageKit will generate a first-frame thumbnail.
5. Click **Upload**:
   - You’ll see a **progress indicator** while the file uploads.
   - On success, you are navigated back to the home page and the new video appears.

### 8.2 Watching a video

1. On the home/discover page, click a video card.
2. On the **Watch** page:
   - Views and duration are shown.
   - The custom player lets you:
     - Click on the video or center button to play/pause.
     - Drag the bottom seek bar to jump in the video.
     - Adjust volume and playback speed.
     - Click the fullscreen arrow to enter/exit fullscreen.

### 8.3 Likes & shares

- Click **Like** to increment the like counter for a video (saved in MongoDB).
- Click **Share**:
  - Use native share on mobile if supported.
  - Or share via WhatsApp, X, or copy the link.
  - Shared link opens the `Watch` page directly for that video.

### 8.4 Admin dashboard

- The **Admin** page uses real data from MongoDB:
  - Total views
  - Device breakdown
  - Video performance
  - (Based on whatever metrics you’ve wired inside `Admin.tsx`)

---

## 9. Notes about ImageKit video processing units

- ImageKit charges **video processing units** for dynamic video processing (e.g. `?tr=` transformations, transcoding, etc.).
- Once monthly units are **exhausted**, some transformed video URLs may fail, especially on mobile/tablet if they use device-specific transformations.
- To keep playback reliable even when units are exhausted:
  - `deviceUtils.getTransformedUrl` currently **returns the original video URL**, without `tr=` query params.
  - This avoids per-request processing and makes streaming more predictable.

If you upgrade your ImageKit plan and want more advanced video transformations (different crops per device, HLS, etc.), you can re-enable transformation logic in `deviceUtils.ts`.

---

## 10. Scripts

From `package.json` (names may vary slightly):

- `npm run dev` – start Vite dev server (frontend).
- `npm run build` – build production frontend.
- `npm run preview` – preview built frontend.
- `npm run server` – start backend: `node server/index.js`.

---

## 11. Future improvements (ideas)

- Authentication / user accounts to tie uploads and likes to real users.
- Comments per video.
- Advanced analytics dashboards (retention, avg watch time, etc.).
- HLS/DASH streaming with adaptive bitrate.
- Better error pages and 404 handling on frontend.

This README should give you and contributors a clear map of how Streamsflex works and how to run and deploy it end-to-end.