const API = import.meta.env.VITE_API_URL || '/api';
const EMBED_TOKEN_KEY = 'lingualeap-embed-session';

function isEmbedded() {
  try { return window.self !== window.top; } catch { return true; }
}

export async function api(path: string, options: RequestInit = {}) {
  const embedded = isEmbedded();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (embedded) {
    headers.set('X-LinguaLeap-Embed', '1');
    try {
      const token = sessionStorage.getItem(EMBED_TOKEN_KEY);
      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch { /* Cookies remain the fallback when session storage is unavailable. */ }
  }

  let response: Response;
  try {
    response = await fetch(API + path, { credentials: 'include', ...options, headers });
  } catch {
    throw new Error('Cannot reach the LinguaLeap API. Check your connection and try again.');
  }

  let data: any;
  try { data = await response.json(); }
  catch { data = { error: `The API returned an empty response (${response.status}).` }; }
  if (embedded && data.sessionToken) {
    try { sessionStorage.setItem(EMBED_TOKEN_KEY, data.sessionToken); } catch { /* Cookie may still work. */ }
  }
  if (!response.ok) {
    if (embedded && response.status === 401) {
      try { sessionStorage.removeItem(EMBED_TOKEN_KEY); } catch { /* Ignore unavailable storage. */ }
    }
    throw new Error(data.error || 'Request failed');
  }
  if (path === '/auth/logout') {
    try { sessionStorage.removeItem(EMBED_TOKEN_KEY); } catch { /* Ignore unavailable storage. */ }
  }
  return data;
}
