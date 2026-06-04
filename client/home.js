
const URL = "https://idea-sharing-platform-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("auth-modal");
  const btnStart = document.getElementById("get-started-btn");
  const btnLogin = document.getElementById("nav-login-btn");

  function checkUserStatus() {
    const loggedInUser = localStorage.getItem("user_login_name");

    if (
      loggedInUser &&
      loggedInUser !== "undefined" &&
      loggedInUser !== "null"
    ) {
      if (btnStart) {
        btnStart.style.display = "none";
      }
    } else {
      if (btnStart) {
        btnStart.style.display = "block";
      }
    }
  }

  checkUserStatus();

  if (btnStart) btnStart.onclick = () => loadForm("signup.html");
  if (btnLogin)
    btnLogin.onclick = (e) => {
      e.preventDefault();
      loadForm("login.html");
    };

  function loadForm(file) {
    fetch(file)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then((html) => {
        modal.innerHTML = html;
        modal.style.display = "flex";
        if (file === "signup.html") initSignup();
        else if (file === "login.html") initLogin();
      })
      .catch((err) => console.error(err));
  }

  function initSignup() {
    initClose();
    const toLogin = document.getElementById("go-to-login");
    if (toLogin)
      toLogin.onclick = (e) => {
        e.preventDefault();
        loadForm("login.html");
      };

    const form = document.getElementById("popupSignupForm");
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const username = document
          .getElementById("signup-username")
          .value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document
          .getElementById("signup-password")
          .value.trim();
        try {
          const res = await fetch(`${URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
          });
          if (res.ok) {
            showToast("Account Created! Please Login Now.", "success");
            loadForm("login.html");
          } else {
            showToast("Signup failed! Please try again.", "error");
          }
        } catch (err) {
      
          showToast("Server Error during signup!", "error");
        }
      };
    }
  }

  function initLogin() {
    initClose();
    const toSignup = document.getElementById("go-to-signup");
    if (toSignup)
      toSignup.onclick = (e) => {
        e.preventDefault();
        loadForm("signup.html");
      };

    const form = document.getElementById("popupLoginForm");
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();
        try {
          const res = await fetch(`${URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            showToast("Logged In Successfully!", "success");

            let name = "Creator";
            if (data && data.username) name = data.username;
            else if (data && data.user && data.user.username)
              name = data.user.username;
            else if (email) name = email.split("@")[0];

            localStorage.setItem("user_login_name", name);
            modal.style.display = "none";
            
            setTimeout(() => {
                window.location.reload();
            }, 1200);
            
          } else {
            showToast("Invalid Credentials! Try again.", "error");
          }
        } catch (err) {
          showToast("Login Error! Check connection.", "error");
        }
      };
    }
  }
  function initClose() {
    const closeBtn = document.getElementById("close-modal-btn");
    if (closeBtn)
      closeBtn.onclick = () => {
        modal.style.display = "none";
      };
  }
});