/**
 * Simple REST client wrapping fetch with JSON helpers, base URL and auth header support.
 * REACT_APP_API_BASE can be:
 *  - a relative prefix like "/api" or "/api/v1"
 *  - an absolute base like "https://api.example.com/api"
 *  - "/" or empty to use site root
 */
const RAW_API_BASE = (process.env.REACT_APP_API_BASE ?? '').trim();

/**
 * Normalize API base and join with path, handling slashes and absolute URLs.
 */
function buildUrl(path) {
  const safePath = String(path || '');
  const base = RAW_API_BASE || '/api'; // default to /api which is common in many backends
  // If base is absolute (starts with http), use URL constructor directly.
  if (/^https?:\/\//i.test(base)) {
    const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
    const joined = safePath.startsWith('/') ? safePath : `/${safePath}`;
    return `${baseUrl}${joined}`;
  }
  // base is relative to current origin
  const normalizedBase = base === '/' ? '' : (base.startsWith('/') ? base : `/${base}`);
  const normalized = normalizedBase.endsWith('/') ? normalizedBase.slice(0, -1) : normalizedBase;
  const joined = safePath.startsWith('/') ? safePath : `/${safePath}`;
  return new URL(`${normalized}${joined}`, window.location.origin).toString();
}

function getHeaders(token, extra = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extra
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function debugLog(method, url, status) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`[api] ${method} ${url} -> ${status}`);
  }
}

// PUBLIC_INTERFACE
export async function apiGet(path, token, params) {
  /** Fetch JSON (GET) from REST API. */
  const urlStr = buildUrl(path);
  const url = new URL(urlStr);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString(), { headers: getHeaders(token) });
  debugLog('GET', url.toString(), res.status);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, token) {
  /** Post JSON to REST API. */
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(body)
  });
  debugLog('POST', url, res.status);
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPut(path, body, token) {
  /** Put JSON to REST API. */
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(body)
  });
  debugLog('PUT', url, res.status);
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiDelete(path, token) {
  /** Delete from REST API. */
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  debugLog('DELETE', url, res.status);
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  try { return await res.json(); } catch { return {}; }
}
