const API_BASE = import.meta.env.VITE_API_URL ?? "";

// --- Auth helpers ---
// No more sessionStorage — the browser automatically manages the HttpOnly cookie.

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "include", // Send the HttpOnly cookie with every request
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

/** Upload profile photo; saves to public/ and updates hero.image in portfolio.json */
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

/** Upload resume PDF; saves to public/ and updates site.resumeUrl in portfolio.json */
export async function uploadResume(dataUrl, filename) {
  return request("/api/upload/resume", {
    method: "POST",
    body: JSON.stringify({ dataUrl, filename }),
  });
}

/** Login — backend sets an HttpOnly cookie in the response automatically. */
export async function loginAdmin(email, password) {
  let deviceId = localStorage.getItem("admin_device_id");
  if (!deviceId) {
    deviceId = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("admin_device_id", deviceId);
  }

  await request("/api/auth/login", {
    method: "POST",
    headers: { "x-device-id": deviceId },
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Check if the session cookie is still valid.
 * Returns { ok: true } on success, throws on 401.
 */
export async function checkAdminSession() {
  return request("/api/auth/me");
}

/** Logout — backend clears the HttpOnly cookie. */
export async function logoutAdmin() {
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

/** Mock chatbot answer function for Phase 1 (Frontend Demo) */
export async function askChatbot(message, portfolio) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const text = message.toLowerCase().trim();
  let responseText = "";

  const site = portfolio?.site || {};
  const projects = portfolio?.projects || [];
  const skills = portfolio?.skills || [];
  const experience = portfolio?.experience || [];
  const social = portfolio?.social || [];

  if (text.includes("resume") || text.includes("pdf") || text.includes("cv")) {
    const resumeUrl = site.resumeUrl || "/Shubham_Jani_Resume.pdf";
    responseText = `You can view or download Shubham's resume here: **[Download Resume PDF](${resumeUrl})**. Let me know if you want to know about his projects or skills next!`;
  } else if (text.includes("project") || text.includes("portfolio") || text.includes("work")) {
    if (projects.length > 0) {
      responseText = `Shubham has worked on several amazing projects. Here are a few notable ones:\n\n` +
        projects.slice(0, 4).map(p => {
          const links = [
            p.liveUrl ? `[Live Demo](${p.liveUrl})` : null,
            p.repoUrl ? `[GitHub Repository](${p.repoUrl})` : null
          ].filter(Boolean).join(" | ");
          return `- **${p.title}** (${p.category}): ${p.description}\n  ${links ? `  *${links}*` : ""}`;
        }).join("\n\n") + `\n\nWould you like to know more about his skills or work experience?`;
    } else {
      responseText = "Shubham has built multiple full-stack and frontend projects, specializing in React, Node.js, and FastAPI. Please check the **Projects** section on the page to view them all!";
    }
  } else if (text.includes("skill") || text.includes("tech") || text.includes("language") || text.includes("framework")) {
    if (skills.length > 0) {
      responseText = `Shubham's technical skill set includes:\n\n` +
        skills.map(s => {
          const items = s.items.map(item => item.name).join(", ");
          return `- **${s.name}**: ${items}`;
        }).join("\n") + `\n\nHe has expertise in building full-stack web applications, database management, and UI/UX styling.`;
    } else {
      responseText = "Shubham is a Full Stack Developer skilled in React, Tailwind CSS, JavaScript (ES6+), Python, FastAPI, and MySQL databases.";
    }
  } else if (text.includes("experience") || text.includes("job") || text.includes("career")) {
    if (experience.length > 0) {
      responseText = `Here is a summary of Shubham's professional experience:\n\n` +
        experience.map(e => {
          return `- **${e.title}** at *${e.subtitle}* (${e.period})\n  ${e.description}`;
        }).join("\n\n") + `\n\nWould you like to get in touch with him or see his project repositories?`;
    } else {
      responseText = "Shubham has professional experience building responsive web architectures, database designs, and interactive dashboards using React and FastAPI.";
    }
  } else if (text.includes("contact") || text.includes("email") || text.includes("social") || text.includes("github") || text.includes("linkedin") || text.includes("reach")) {
    const emailLink = site.email ? `[${site.email}](mailto:${site.email})` : "[Contact Email](mailto:shubhamjani1731@gmail.com)";
    const socialLinks = social.map(s => `[${s.platform}](${s.url})`).join(" | ");
    
    responseText = `You can reach Shubham via:\n\n` +
      `- **Email**: ${emailLink}\n` +
      (site.location ? `- **Location**: ${site.location}\n` : "") +
      (socialLinks ? `- **Socials**: ${socialLinks}\n\n` : "\n\n") +
      `Or simply fill out the **Contact Form** right here on this page! He will receive your message and get back to you soon.`;
  } else if (text.includes("hi") || text.includes("hello") || text.includes("hey") || text.includes("greetings")) {
    responseText = `Hello! 👋 I am Shubham's AI Assistant. How can I help you today?\n\n` +
      `- 📄 Ask for his **Resume PDF**\n` +
      `- 💻 Ask about his **Projects**\n` +
      `- 🛠️ Learn about his **Skills**\n` +
      `- 📅 Inquire about his **Experience**\n` +
      `- 📧 Get his **Contact Info**`;
  } else {
    responseText = `Thanks for asking! I'm currently running in frontend demo mode. \n\nI can answer questions regarding Shubham's **skills**, **experience**, **projects**, **contact links**, or send you his **resume PDF**. \n\nFeel free to try asking "Show me your projects" or "Get resume"!`;
  }

  return { text: responseText };
}

