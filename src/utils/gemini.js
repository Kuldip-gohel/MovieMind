/**
 * Gemini requests are handled by the Python backend so API keys never ship
 * to the browser. Kept as a small compatibility utility for existing imports.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function askGemini(userRequest) {
  if (!userRequest?.trim()) throw new Error('Please describe the movie you are in the mood for.');
  const response = await fetch(`${API_BASE}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: userRequest.trim() })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || 'Movie discovery failed.');
  return data;
}
