const DEFAULT_ERROR = 'Terjadi kesalahan saat mengambil data.';

export const UNAUTHORIZED_EVENT = 'mini-cms:unauthorized';

export class ApiError extends Error {
  constructor(message, { status = 0, errors = {} } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
  } = options;
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };
  const requestOptions = {
    method,
    headers: requestHeaders,
    credentials: 'same-origin',
    signal,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(path, requestOptions);
  } catch {
    throw new ApiError(
      'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.',
    );
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    // Respons non-JSON ditangani sebagai kegagalan di bawah.
  }

  if (!response.ok || payload?.success !== true) {
    if (response.status === 401 && path !== '/api/auth/login') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }

    throw new ApiError(payload?.message || DEFAULT_ERROR, {
      status: response.status,
      errors: payload?.errors ?? {},
    });
  }

  return payload.data;
}

export function getArticles({ page = 1, limit = 6 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(`/api/articles?${params}`);
}

export function getArticleBySlug(slug) {
  return apiRequest(`/api/articles/${encodeURIComponent(slug)}`);
}

export function loginAdmin({ email, password }) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function getCurrentAdmin() {
  return apiRequest('/api/auth/me');
}

export function logoutAdmin(csrfToken) {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
}

export function getDashboard() {
  return apiRequest('/api/admin/dashboard');
}

export function getAdminArticles({
  page = 1,
  limit = 10,
  q = '',
  status = '',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (q) {
    params.set('q', q);
  }

  if (status) {
    params.set('status', status);
  }

  return apiRequest(`/api/admin/articles?${params}`);
}

export function getAdminArticle(id) {
  return apiRequest(`/api/admin/articles/${encodeURIComponent(id)}`);
}

export function createAdminArticle(data, csrfToken) {
  return apiRequest('/api/admin/articles', {
    method: 'POST',
    body: data,
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
}

export function updateAdminArticle(id, data, csrfToken) {
  return apiRequest(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: data,
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
}

export function deleteAdminArticle(id, csrfToken) {
  return apiRequest(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
}
