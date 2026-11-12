const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('archvizon_token');
    }
    return null;
  }

  setToken(token) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('archvizon_token', token);
      } else {
        localStorage.removeItem('archvizon_token');
      }
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errors = data.errors || [];
        throw error;
      }

      return data;
    } catch (error) {
      if (error.status === 401 && typeof window !== 'undefined') {
        // Automatically clear token on 401 unauthorized
        this.setToken(null);
      }
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const api = new ApiClient();
export default api;
