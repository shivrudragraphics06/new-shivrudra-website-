const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000")).replace(/\/+$/, "");
export const PUBLIC_CONTENT_CHANGE_KEY = "shivrudra_public_content_changed";

function notifyPublicContentChanged() {
  try {
    localStorage.setItem(PUBLIC_CONTENT_CHANGE_KEY, `${Date.now()}:${Math.random()}`);
  } catch {
    // Saving still succeeds when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(PUBLIC_CONTENT_CHANGE_KEY));
}

export function assetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) return path;

  const normalizedPath = path.replace(/\\/g, "/");
  const uploadsIndex = normalizedPath.indexOf("uploads/");
  const publicPath =
    uploadsIndex >= 0 ? `/${normalizedPath.slice(uploadsIndex)}` : normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;

  return `${API_URL}${publicPath}`;
}

export async function publicApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api/public${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error("API request failed");
  return response.json();
}

export async function adminApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}/api/admin${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "API request failed");
  }

  const result = await response.json();
  if (options.method && !["GET", "HEAD"].includes(options.method.toUpperCase())) notifyPublicContentChanged();
  return result;
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error("Invalid login");

  return response.json() as Promise<{
    token: string;
    admin: { id: number; name: string; email: string };
  }>;
}
