const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const TOKEN_KEY = "planner-token";
let authToken = localStorage.getItem(TOKEN_KEY) || "";

export function setAuthToken(token) {
  authToken = token || "";
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  return authToken;
}

function firstError(body) {
  if (!body) return null;
  if (typeof body === "string") return body;
  if (body.detail) return body.detail;
  const keys = Object.keys(body);
  if (keys.length === 0) return null;
  const first = body[keys[0]];
  if (Array.isArray(first)) return first[0];
  if (typeof first === "string") return first;
  return JSON.stringify(body);
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authToken) headers["Authorization"] = `Token ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    setAuthToken("");
    const err = new Error("Your session expired. Please log in again.");
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = firstError(body) || JSON.stringify(body);
    } catch {
      /* ignore */
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, data) =>
    request(path, { method: "POST", body: JSON.stringify(data) }),
  patch: (path, data) =>
    request(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export { API_BASE };