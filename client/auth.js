
async function signup(event) {
  if (event) event.preventDefault(); 


  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!username || !email || !password) {
    alert("All fields are required!");
    return;
  }

  try {
    const res = await fetch("http://192.168.10.89:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
         credentials: "include",
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Signup successful! ");
      window.location.href = "login.html"; 
    } else {
      alert(data.message || "Signup failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error: Connection failed!");
  }
}


async function login(event) {
  if (event) event.preventDefault();


  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("All fields are required!");
    return;
  }

  try {
    const res = await fetch("http://192.168.10.89:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.accessToken);
      alert("Login successful ");
      window.location.href = "explore.html"; 
    } else {
      alert(data.message || "Login failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error: Connection failed!");
  }
}


window.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById("signup-form");
  if (signupForm) signupForm.onsubmit = signup;

  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.onsubmit = login;
});