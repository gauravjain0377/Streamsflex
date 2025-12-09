const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// In dev (no API_BASE or set to localhost), use relative URLs so
// the browser/phone talks to the same origin as the frontend.
// In prod (API_BASE is a real domain), use the full base URL.
const shouldUseRelative =
  !API_BASE ||
  API_BASE.includes('localhost') ||
  API_BASE.includes('127.0.0.1');

export const apiUrl = (path: string) => {
  // Ensure leading slash
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  if (shouldUseRelative) {
    // e.g. "/api/videos" → Vite dev server proxy handles it
    return path;
  }

  // e.g. "https://api.yourdomain.com/api/videos"
  return `${API_BASE}${path}`;
};


