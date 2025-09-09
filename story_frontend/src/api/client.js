/**
 * Simple REST client wrapping fetch with JSON helpers, base URL and auth header support.
 */
const API_BASE = process.env.REACT_APP_API_BASE || '';

function getHeaders(token, extra = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extra
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// PUBLIC_INTERFACE
export async function apiGet(path, token, params) {
  /** Fetch JSON (GET) from REST API. */
  const url = new URL((API_BASE + path), window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString(), { headers: getHeaders(token) });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, token) {
  /** Post JSON to REST API. */
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPut(path, body, token) {
  /** Put JSON to REST API. */
  const res = await fetch(API_BASE + path, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiDelete(path, token) {
  /** Delete from REST API. */
  const res = await fetch(API_BASE + path, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  try { return await res.json(); } catch { return {}; }
}
