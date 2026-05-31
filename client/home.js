const URL = "https://idea-sharing-platform-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("auth-modal");
    const btnStart = document.getElementById("get-started-btn");
    const btnLogin = document.getElementById("nav-login-btn");

    if (btnStart) btnStart.onclick = () => loadForm("signup.html");
    if (btnLogin) btnLogin.onclick = (e) => { e.preventDefault(); loadForm("login.html"); };

    function loadForm(file) {
        fetch(file)
            .then(res => { if (!res.ok) throw new Error(); return res.text(); })
            .then(html => {
                modal.innerHTML = html;
                modal.style.display = "flex";
                if (file === "signup.html") initSignup();
                else if (file === "login.html") initLogin();
            }).catch(err => console.error(err));
    }

    function initSignup() {
        initClose();
        const toLogin = document.getElementById("go-to-login");
        if (toLogin) toLogin.onclick = (e) => { e.preventDefault(); loadForm("login.html"); };

        const form = document.getElementById("popupSignupForm");
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const username = document.getElementById("signup-username").value.trim();
                const email = document.getElementById("signup-email").value.trim();
                const password = document.getElementById("signup-password").value.trim();
                try {
                    const res = await fetch(`${URL}/auth/signup`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, email, password })
                    });
                    if (res.ok) {
                        alert("Account Created! Please Login.");
                        loadForm("login.html");
                    } else { alert("Signup failed!"); }
                } catch (err) { alert("Error!"); }
            };
        }
    }

    function initLogin() {
        initClose();
        const toSignup = document.getElementById("go-to-signup");
        if (toSignup) toSignup.onclick = (e) => { e.preventDefault(); loadForm("signup.html"); };

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
                        credentials: "include"
                    });
                    if (res.ok) {
                        const data = await res.json();
                        alert(" Logged In!");
                        
                        let name = "Creator";
                        if (data && data.username) name = data.username;
                        else if (data && data.user && data.user.username) name = data.user.username;
                        else if (email) name = email.split('@')[0];
                        
                        localStorage.setItem("user_login_name", name);
                        modal.style.display = "none";
                        window.location.reload(); 
                    } else { alert("Invalid Credentials!"); }
                } catch (err) { alert("Login Error!"); }
            };
        }
    }

    function initClose() {
        const closeBtn = document.getElementById("close-modal-btn");
        if (closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };
    }
});