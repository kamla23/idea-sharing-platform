
(function normalizeHost() {
  if (
    typeof window !== "undefined" &&
    window.location &&
    (window.location.port === "5500" || window.location.port === "5501")
  ) {
    const host = window.location.hostname;
    if (
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      (host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("172."))
    ) {
      const target = window.location.href.replace(host, "localhost");
      console.log(`[MindMeld] Auto-normalizing ${host} -> localhost to resolve CORS: ${target}`);
      window.location.replace(target);
    }
  }
})();

const CONFIG = { 

  DEFAULT_API_URL: "https://idea-sharing-platform-backend.onrender.com/api",

  getApiUrl() {
    return localStorage.getItem("custom_api_url") || this.DEFAULT_API_URL;
  },

 
  getToken() {
    const raw = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
    if (!raw) return "";
    return raw.replace(/^Bearer\s+/i, "").trim();
  },

  getUser() {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      return null;
    }
  },
  getUsername() {
    const user = this.getUser();
    return (
      (user && (user.username || user.name)) ||
      localStorage.getItem("user_login_name") ||
      null
    );
  },


  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUsername();
    return Boolean(token && user && user !== "undefined" && user !== "null");
  },

  
  setAuthSession(token, user) {
    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
      localStorage.setItem("token", cleanToken);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      const name = user.username || user.name || "Creator";
      localStorage.setItem("user_login_name", name);
    }
  },


  clearAuthSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("user_login_name");
  },


  getHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },


  escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

window.CONFIG = CONFIG;
