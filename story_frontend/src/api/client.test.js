import { apiGet, apiPost } from './client';

// We will (re)import the module under different env setups by clearing the module cache between tests.
// Helper to re-require client.js fresh with a given REACT_APP_API_BASE
async function loadClientWithBase(base) {
  // set env for this module load
  process.env.REACT_APP_API_BASE = base;
  // delete from require cache (CommonJS path). For CRA/jest with ES modules transpiled, jest.resetModules handles it
  jest.resetModules();
  // re-import the module
  const mod = await import('./client');
  return mod;
}

describe('client buildUrl and fetch logic', () => {
  const originalLocation = window.location;

  beforeAll(() => {
    // Ensure we have a known origin for URL resolution
    delete window.location;
    // @ts-ignore
    window.location = new URL('https://example.com/app/index.html');
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('buildUrl uses absolute REACT_APP_API_BASE and joins path with single slash', async () => {
    // Arrange
    const { default: _ignored, apiGet: localGet } = await loadClientWithBase('https://api.example.com/api');
    // Mock fetch to capture URL
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    // Act
    await localGet('/status');

    // Assert
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toBe('https://api.example.com/api/status');
  });

  test('buildUrl with relative base "/api" resolves against current origin', async () => {
    const { apiGet: localGet } = await loadClientWithBase('/api');
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await localGet('health'); // missing leading slash should be normalized

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin).toBe('https://example.com');
    expect(url.pathname).toBe('/api/health');
  });

  test('buildUrl with base "/" places path at site root', async () => {
    const { apiGet: localGet } = await loadClientWithBase('/');
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await localGet('/v1/ping');

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.href).toBe('https://example.com/v1/ping');
  });

  test('default base when REACT_APP_API_BASE empty -> "/api"', async () => {
    const { apiGet: localGet } = await loadClientWithBase('');
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await localGet('/echo');

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe('/api/echo');
  });

  test('headers: adds Content-Type and Authorization when token provided', async () => {
    const { apiGet: localGet } = await loadClientWithBase('/api');
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await localGet('/secure', 'abc.123.token');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const options = fetchMock.mock.calls[0][1] || {};
    expect(options.headers).toBeTruthy();
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['Authorization']).toBe('Bearer abc.123.token');
  });

  test('headers: omits Authorization when token not provided', async () => {
    const { apiGet: localGet } = await loadClientWithBase('/api');
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await localGet('/public', null);

    const options = fetchMock.mock.calls[0][1] || {};
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['Authorization']).toBeUndefined();
  });

  test('apiGet appends query params', async () => {
    const { apiGet: localGet } = await loadClientWithBase('/api');
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await localGet('/search', null, { q: 'dragon', page: 2 });

    const called = fetchMock.mock.calls[0][0];
    const url = new URL(called);
    expect(url.searchParams.get('q')).toBe('dragon');
    expect(url.searchParams.get('page')).toBe('2');
  });

  test('apiPost uses POST method, stringifies body, and includes headers', async () => {
    const { apiPost: localPost } = await loadClientWithBase('/api');
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 1 }),
    });

    await localPost('/items', { name: 'Sword' }, 'tok123');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, options] = fetchMock.mock.calls[0];
    expect(new URL(calledUrl).pathname).toBe('/api/items');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['Authorization']).toBe('Bearer tok123');
    expect(options.body).toBe(JSON.stringify({ name: 'Sword' }));
  });

  test('apiGet throws on non-ok response', async () => {
    const { apiGet: localGet } = await loadClientWithBase('/api');
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'boom' }),
    });

    await expect(localGet('/fail')).rejects.toThrow(/GET \/fail failed: 500/);
  });

  test('absolute base without trailing slash joins correctly when path missing leading slash', async () => {
    const { apiPost: localPost } = await loadClientWithBase('https://api.example.com/base/');
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await localPost('submit', { ok: 1 });

    const called = fetchMock.mock.calls[0][0];
    expect(called).toBe('https://api.example.com/base/submit');
  });
});
