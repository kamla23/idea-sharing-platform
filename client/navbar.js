// fetch("navbar.html")
//   .then((res) => res.text())
//   .then((data) => {
//     document.getElementById("navbar").innerHTML = data;

//     const user = JSON.parse(localStorage.getItem("user"));

//     const userName = document.getElementById("user-name");
//     const loginLink = document.getElementById("login-link");
//     const logoutLink = document.getElementById("logout-link");

//     if (user) {
//       userName.style.display = "block";
//       userName.innerText = user.username;

//       loginLink.style.display = "none";
//       logoutLink.style.display = "block";
//     }
//   });

// function logout() {
//   localStorage.removeItem("token");
//   localStorage.removeItem("user");
//   window.location.href = "login.html";
// }




fetch("navbar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("navbar").innerHTML = data;

    // 🔥 Direct backend se poocho ki user logged in hai ya nahi
    checkAuthStatus();
  })
  .catch((err) => console.error("Navbar load nahi ho paya:", err));

async function checkAuthStatus() {
  const userName = document.getElementById("user-name");
  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");

  try {
    // Backend ka status check karne wala endpoint
    const res = await fetch("https://idea-sharing-platform-backend.onrender.com/api/auth/status", {
      method: "GET",
      credentials: "include" // 👈 Yeh line cookies ko backend tak le jaane ke liye bahut zaroori hai
    });

    if (res.ok) {
      const data = await res.json(); // Backend response bhejega: { loggedIn: true, user: { username: "Kamla" } }
      
      if (data.loggedIn && data.user) {
        // User logged in hai
        userName.style.display = ""; 
        userName.innerText = data.user.username;
        loginLink.style.display = "none";
        logoutLink.style.display = "";
        
        // Logout click handler
        document.getElementById("logout-btn").addEventListener("click", (e) => {
          e.preventDefault();
          logoutUserBackend();
        });
        return;
      }
    }

    // Default state: Agar login nahi hai to sirf Login button dikhao
    userName.style.display = "none";
    loginLink.style.display = "";
    logoutLink.style.display = "none";

  } catch (err) {
    console.error("Auth status check failed:", err);
  }
}

// 🔥 Logout hone par backend se session delete karwana
async function logoutUserBackend() {
  try {
    await fetch("https://idea-sharing-platform-backend.onrender.com/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    
    alert("Logged out successfully!");
    // Option 2 ke mutabik wapas home page par bhej do
    window.location.href = "home.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
}