const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const apiUrl = (path: string) => {
  if (!path.startsWith('/')) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
};


