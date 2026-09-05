const rawBase = import.meta.env.VITE_API_URL ?? "";
const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

async function request(path, options = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = { 
    "Content-Type": "application/json", 
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers 
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new Error("Cannot reach portfolio API. Start the server: uvicorn App:app --port 8000");
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : {};
  if (!res.ok) throw new Error(data.detail || data.error || res.statusText || "Request failed");
  return data;
}

export async function fetchPortfolio(includeArchived = false) {
  const q = includeArchived ? "?includeArchived=true" : "";
  const sep = q ? "&" : "?";
  return request(`/api/portfolio${q}${sep}_t=${Date.now()}`);
}

export async function savePortfolio(portfolio) {
  return request("/api/portfolio", {
    method: "PUT",
    body: JSON.stringify(portfolio),
  });
}

export async function uploadHeroPortrait(dataUrl) {
  return request("/api/upload/hero-portrait", {
    method: "POST",
    body: JSON.stringify({ dataUrl }),
  });
}

export async function uploadProjectImage(dataUrl, projectId) {
  return request("/api/upload/project-image", {
    method: "POST",
    body: JSON.stringify({ dataUrl, projectId }),
  });
}

export async function uploadResume(dataUrl, filename) {
  return request("/api/upload/resume", {
    method: "POST",
    body: JSON.stringify({ dataUrl, filename }),
  });
}

export async function loginAdmin(email, password) {
  let deviceId = localStorage.getItem("admin_device_id");
  if (!deviceId) {
    deviceId = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("admin_device_id", deviceId);
  }

  const data = await request("/api/auth/login", {
    method: "POST",
    headers: { "x-device-id": deviceId },
    body: JSON.stringify({ email, password }),
  });

  if (data?.token) {
    localStorage.setItem("admin_token", data.token);
  }
  return data;
}

export async function checkAdminSession() {
  return request("/api/auth/me");
}

export async function logoutAdmin() {
  localStorage.removeItem("admin_token");
  return request("/api/auth/logout", { method: "POST" });
}

export async function submitContact(form) {
  return request("/api/contact", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function fetchMessages(archived = false) {
  const q = archived ? "?archived=true" : "";
  return request(`/api/messages${q}`);
}

export async function updateMessage(id, patch) {
  return request(`/api/messages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteMessage(id) {
  return request(`/api/messages/${id}`, { method: "DELETE" });
}

export async function recordPortfolioView(visitorId) {
  return request("/api/analytics/view", {
    method: "POST",
    body: JSON.stringify({ visitorId }),
  });
}

export async function fetchAnalytics() {
  return request("/api/analytics");
}

export async function updateAdminPassword(currentPassword, newPassword) {
  return request("/api/auth/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function updateAdminEmail(currentPassword, newEmail) {
  return request("/api/auth/email", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newEmail }),
  });
}
