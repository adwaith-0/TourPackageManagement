// ─── API Configuration ───────────────────────────────────────────
// Central config for the backend API base URL.
// Set VITE_API_BASE_URL in your .env file to override (defaults to localhost:3001 for local dev).

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
