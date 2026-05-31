
const LOGIN_API_URL = "https://idea-sharing-platform-backend.onrender.com";

async function processLogin(event, modal) {
  if (event) event.preventDefault();

  const emailEl = document.getElementById("login-email");
  const passwordEl = document.getElementById("login-password");

  if (!emailEl || !passwordEl) {
    console.error("Login fields missing!");
    return;
  }

  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  if (!email || !password) {
    alert("All fields are required! ");
    return;
  }

  try {
    const res = await fetch(`${LOGIN_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      alert("Login successful! ");

      localStorage.clear();

     
      let extractedToken = data.token || data.accessToken || (data.user && data.user.token) || "";

    
      localStorage.setItem("token", extractedToken);

      let name = "Creator";
      if (data.user) {
         localStorage.setItem("user", JSON.stringify(data.user));
         name = data.user.username || data.user.name || name;
      } else if (data.username) {
         name = data.username;
         localStorage.setItem("user", JSON.stringify({ username: name }));
      } else {
         localStorage.setItem("user", JSON.stringify({ username: "User" }));
      }
      
      localStorage.setItem("user_login_name", name);

      console.log("Token successfully captured in LocalStorage:", extractedToken ? " YES" : " NO");

      if (modal) modal.style.display = "none"; 
      
 
      window.location.replace("explore.html"); 
    } else {
      alert(data.message || data.error || "Invalid Credentials! ");
    }
  } catch (err) {
    console.error("Login network error:", err);
    alert("Server error: Connection failed!");
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