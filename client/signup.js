async function signup(event, modal, loadFormFunction) {
  if (event) event.preventDefault();

  const usernameEl = document.getElementById("signup-username");
  const emailEl = document.getElementById("signup-email");
  const passwordEl = document.getElementById("signup-password");

  if (!usernameEl || !emailEl || !passwordEl) {
    console.error("Signup form inputs missing in DOM!");
    return;
  }

  const username = usernameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (!username || !email || !password) {
    if (typeof showToast === "function") {
      showToast("All fields are required!", "error");
    } else {
      alert("All fields are required!");
    }
    return;
  }

  if (username.length < 3) {
    if (typeof showToast === "function") {
      showToast("Username must be at least 3 characters long", "error");
    } else {
      alert("Username must be at least 3 characters long");
    }
    return;
  }

  if (password.length < 6) {
    if (typeof showToast === "function") {
      showToast("Password must be at least 6 characters long", "error");
    } else {
      alert("Password must be at least 6 characters long");
    }
    return;
  }

  const submitBtn = document.querySelector("#popupSignupForm button[type='submit']");
  const originalBtnText = submitBtn ? submitBtn.innerText : "Sign Up";
  let slowTimer = null;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Creating account...";
    slowTimer = setTimeout(() => {
      if (submitBtn && submitBtn.disabled) {
        submitBtn.innerText = "Connecting to server...";
      }
    }, 2500);
  }

  try {
    const apiUrl = window.CONFIG ? window.CONFIG.getApiUrl() : "https://idea-sharing-platform-backend.onrender.com/api";
    const res = await fetch(`${apiUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      if (typeof showToast === "function") {
        showToast("Account created successfully! Please login.", "success");
      } else {
        alert("Account created successfully! Please login.");
      }

      if (typeof loadFormFunction === "function") {
        loadFormFunction("login.html");
      }
    } else {
      const msg = data.message || data.error || "Signup failed! Please check your details.";
      if (typeof showToast === "function") {
        showToast(msg, "error");
      } else {
        alert(msg);
      }
    }
  } catch (err) {
    console.error("Signup network error:", err);
    if (typeof showToast === "function") {
      showToast("Server connection error! Please try again.", "error");
    } else {
      alert("Server error: Connection failed!");
    }
  } finally {
    if (slowTimer) clearTimeout(slowTimer);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
    }
  }
}

function initSignup(modal, loadFormFunction) {
  const toLogin = document.getElementById("go-to-login");
  if (toLogin) {
    toLogin.onclick = (e) => {
      e.preventDefault();
      if (typeof loadFormFunction === "function") {
        loadFormFunction("login.html");
      }
    };
  }

  const signupForm = document.getElementById("popupSignupForm");
  if (signupForm) {
    signupForm.onsubmit = (e) => signup(e, modal, loadFormFunction);
  }
}

window.initSignup = initSignup;
window.signup = signup;
