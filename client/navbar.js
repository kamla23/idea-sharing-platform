

fetch("navbar.html")
  .then((res) => {
    if (!res.ok) throw new Error("Navbar failed to load");
    return res.text();
  })
  .then((html) => {
    const navEl = document.getElementById("navbar");
    if (navEl) {
      navEl.innerHTML = html;
      checkNav();
      initGlobalAuth();
      setupHamburger();
    }
  })
  .catch((err) => console.error("Navbar Load Error:", err));

function setupHamburger() {
  const hamburger = document.getElementById("hamburger-icon");
  const navLinksContainer = document.getElementById("nav-links-container");

  if (hamburger && navLinksContainer) {
    hamburger.onclick = () => {
      navLinksContainer.classList.toggle("active");
      const icon = hamburger.querySelector("i");
      if (icon) {
        if (icon.classList.contains("fa-bars")) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-xmark");
        } else {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      }
    };
  }
}

function initGlobalAuth() {
  const modal = document.getElementById("auth-modal");
  const btnStart = document.getElementById("get-started-btn");
  const btnNavLog = document.getElementById("nav-login-btn");

  if (btnStart) {
    btnStart.onclick = () => loadForm("signup.html");
  }

  if (btnNavLog) {
    btnNavLog.onclick = (e) => {
      e.preventDefault();
      loadForm("login.html");
    };
  }

  function loadForm(file) {
    const authModal = document.getElementById("auth-modal");
    if (!authModal) return;

    fetch(file)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${file}`);
        return res.text();
      })
      .then((html) => {
        authModal.innerHTML = html;
        authModal.style.display = "flex";
        authModal.style.background = "rgba(0,0,0,0.6)";
        authModal.style.zIndex = "2000";
        authModal.style.alignItems = "center";
        authModal.style.justifyContent = "center";
        authModal.style.backdropFilter = "blur(4px)";

        setupPasswordToggle(authModal);
        initClose(authModal);

        if (file === "signup.html" && typeof window.initSignup === "function") {
          window.initSignup(authModal, loadForm);
        } else if (file === "login.html" && typeof window.initLogin === "function") {
          window.initLogin(authModal, loadForm);
        }
      })
      .catch((err) => console.error("Auth Popup Load Error:", err));
  }

  function setupPasswordToggle(container) {
    const eyeIcons = container.querySelectorAll(".toggle-password");
    eyeIcons.forEach((icon) => {
      icon.onclick = function () {
        const targetId = this.getAttribute("data-target");
        const passwordInput = document.getElementById(targetId);
        if (passwordInput) {
          if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.classList.remove("fa-eye");
            this.classList.add("fa-eye-slash");
          } else {
            passwordInput.type = "password";
            this.classList.remove("fa-eye-slash");
            this.classList.add("fa-eye");
          }
        }
      };
    });
  }

  function initClose(container) {
    const closeBtn = container.querySelector("#close-modal-btn");
    if (closeBtn) {
      closeBtn.onclick = () => {
        container.style.display = "none";
      };
    }

    container.onclick = (e) => {
      if (e.target === container) {
        container.style.display = "none";
      }
    };
  }

  window.openAuthModal = loadForm;
}

function checkNav() {
  const loginLink = document.getElementById("login-link");
  const userNameElement = document.getElementById("user-name");
  const logoutLink = document.getElementById("logout-link");

  const storedName = window.CONFIG ? window.CONFIG.getUsername() : localStorage.getItem("user_login_name");
  const isAuthenticated = window.CONFIG ? window.CONFIG.isAuthenticated() : Boolean(storedName);

  if (isAuthenticated && storedName) {
    if (loginLink) loginLink.style.display = "none";
    if (userNameElement) {
      userNameElement.style.display = "flex";
      userNameElement.innerHTML = `<i class="fa-regular fa-user" style="margin-right:6px;"></i> ${window.CONFIG ? window.CONFIG.escapeHTML(storedName) : storedName}`;
    }
    if (logoutLink) {
      logoutLink.style.display = "block";
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.onclick = (e) => {
          e.preventDefault();
          doLogout();
        };
      }
    }
  } else {
    if (loginLink) loginLink.style.display = "block";
    if (userNameElement) userNameElement.style.display = "none";
    if (logoutLink) logoutLink.style.display = "none";
  }
}

async function doLogout() {
  try {
    const apiUrl = window.CONFIG ? window.CONFIG.getApiUrl() : "https://idea-sharing-platform-backend.onrender.com/api";
    await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout network error:", err);
  } finally {
    if (window.CONFIG) {
      window.CONFIG.clearAuthSession();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_login_name");
    }

    if (typeof showToast === "function") {
      showToast("Logged out successfully!", "success");
    }

    setTimeout(() => {
      window.location.reload();
    }, 800);
  }
}

window.checkNav = checkNav;
window.doLogout = doLogout;
