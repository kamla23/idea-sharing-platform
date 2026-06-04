
const SIGNUP_API_URL = "https://idea-sharing-platform-backend.onrender.com";

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
    alert("All fields are required! ");
    return;
  }

  try {
  
    const res = await fetch(`${SIGNUP_API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      alert("Signup successful! ");
      if (typeof loadFormFunction === "function") {
        loadFormFunction("login.html"); 
      }
    } else {
      alert(data.message || data.error || "Signup failed! Please check details.");
    }

  } catch (err) {
    console.error("Signup network error:", err);
    alert("Server error: Connection failed!");
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