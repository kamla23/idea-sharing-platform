async function processLogin(event, modal) {
  if (event) event.preventDefault();

  const emailEl = document.getElementById("login-email");
  const passwordEl = document.getElementById("login-password");

  if (!emailEl || !passwordEl) {
    console.error("Login fields missing in DOM!");
    return;
  }

  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (!email || !password) {
    if (typeof showToast === "function") {
      showToast("Email and password are required!", "error");
    } else {
      alert("Email and password are required!");
    }
    return;
  }

  const submitBtn = document.querySelector("#popupLoginForm button[type='submit']");
  const originalBtnText = submitBtn ? submitBtn.innerText : "Sign In";
  let slowTimer = null;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Signing in...";
    slowTimer = setTimeout(() => {
      if (submitBtn && submitBtn.disabled) {
        submitBtn.innerText = "Connecting to server...";
      }
    }, 2500);
  }

  try {
    const apiUrl = window.CONFIG ? window.CONFIG.getApiUrl() : "https://idea-sharing-platform-backend.onrender.com/api";
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      if (typeof showToast === "function") {
        showToast("Login successful! Welcome back.", "success");
      }

      const token = data.token || data.accessToken || (data.user && data.user.token) || "";
      const user = data.user || { username: data.username || email.split("@")[0] };

      if (window.CONFIG) {
        window.CONFIG.setAuthSession(token, user);
      } else {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("user_login_name", user.username || "Creator");
      }

      if (modal) modal.style.display = "none";

      setTimeout(() => {
        if (window.location.pathname.includes("explore.html")) {
          if (typeof window.checkNav === "function") window.checkNav();
          if (typeof window.getIdeas === "function") window.getIdeas();
          window.location.reload();
        } else {
          window.location.href = "explore.html";
        }
      }, 700);
    } else {
      const msg = data.message || data.error || "Invalid Credentials! Please try again.";
      if (typeof showToast === "function") {
        showToast(msg, "error");
      } else {
        alert(msg);
      }
    }
  } catch (err) {
    console.error("Login network error:", err);
    if (typeof showToast === "function") {
      showToast("Server connection error! Please check your network.", "error");
    } else {
      alert("Server connection error!");
    }
  } finally {
    if (slowTimer) clearTimeout(slowTimer);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
    }
  }
}

function initLogin(modal, loadFormFunction) {
  const toSignup = document.getElementById("go-to-signup");
  if (toSignup) {
    toSignup.onclick = (e) => {
      e.preventDefault();
      if (typeof loadFormFunction === "function") {
        loadFormFunction("signup.html");
      }
    };
  }

  const loginForm = document.getElementById("popupLoginForm");
  if (loginForm) {
    loginForm.onsubmit = (e) => processLogin(e, modal);
  }
}

window.initLogin = initLogin;
window.processLogin = processLogin;
