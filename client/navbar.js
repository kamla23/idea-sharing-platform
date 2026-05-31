


const API = "https://idea-sharing-platform-backend.onrender.com";


fetch("navbar.html")
  .then((res) => { if (!res.ok) throw new Error(); return res.text(); })
  .then((html) => {
    document.getElementById("navbar").innerHTML = html;
    checkNav(); 
    initGlobalAuth(); 
    setupHamburger(); 
  })
  .catch((err) => console.error("Navbar Load Error:", err));



function setupHamburger() {
    const hamburger = document.getElementById("hamburger-icon");
    const navLinksContainer = document.getElementById("nav-links-container");

    if (hamburger && navLinksContainer) {
        hamburger.onclick = () => {
            navLinksContainer.classList.toggle("active");
            const icon = hamburger.querySelector("i");
            if (icon.classList.contains("fa-bars")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }
        };
    }
}


function initGlobalAuth() {
    const modal = document.getElementById("auth-modal");
    const btnStart = document.getElementById("get-started-btn"); 
    const btnNavLog = document.getElementById("nav-login-btn"); 

    if (btnStart) btnStart.onclick = () => loadForm("signup.html");
    if (btnNavLog) btnNavLog.onclick = (e) => { e.preventDefault(); loadForm("login.html"); };

    function loadForm(file) {
        if (!modal) return;
        fetch(file)
            .then(res => { if (!res.ok) throw new Error(); return res.text(); })
            .then(html => {
                modal.innerHTML = html;
                modal.style.display = "flex";
                modal.style.background = "rgba(0,0,0,0.6)";
                modal.style.zIndex = "2000";
                modal.style.alignItems = "center";
                modal.style.justifyContent = "center";
                modal.style.backdropFilter = "blur(3px)";


                setupPasswordToggle();
                initClose();

                if (file === "signup.html" && typeof initSignup === "function") {
                    initSignup(modal, loadForm); 
                } else if (file === "login.html" && typeof initLogin === "function") {
                    initLogin(modal, loadForm); 
                }
                
            }).catch(err => console.error("Popup Load Error:", err));
    }

    function setupPasswordToggle() {
        const eyeIcons = modal.querySelectorAll(".toggle-password");
        eyeIcons.forEach(icon => {
            icon.onclick = function() {
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

    function initClose() {
        const closeBtn = document.getElementById("close-modal-btn");
        if (closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };
    }
}


function checkNav() {
    const loginLink = document.getElementById("login-link");
    const userNameElement = document.getElementById("user-name");
    const logoutLink = document.getElementById("logout-link");

    const storedName = localStorage.getItem("user_login_name");

    if (storedName) {
        if (loginLink) loginLink.style.display = "none";
        if (userNameElement) {
            userNameElement.style.display = "flex";
            userNameElement.innerText = storedName; 
        }
        if (logoutLink) {
            logoutLink.style.display = "block";
            const logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) logoutBtn.onclick = (e) => { e.preventDefault(); doLogout(); };
        }
    } else {
        if (loginLink) loginLink.style.display = "block";
        if (userNameElement) userNameElement.style.display = "none";
        if (logoutLink) logoutLink.style.display = "none";
    }
}


async function doLogout() {
    try {
        const res = await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
        if (res.ok) {
            alert("Logged out successfully! ");
            localStorage.clear(); 
            window.location.reload();
        } else {
            alert("Logout failed!");
        }
    } catch (err) {
        console.error("Logout Error:", err);
    }
}