document.addEventListener("DOMContentLoaded", () => {
  const btnStart = document.getElementById("get-started-btn");

  function updateHeroState() {
    const isAuth = window.CONFIG ? window.CONFIG.isAuthenticated() : Boolean(localStorage.getItem("token"));

    if (isAuth && btnStart) {
      btnStart.innerText = "Share an Idea";
      btnStart.onclick = () => {
        window.location.href = "explore.html?action=new";
      };
    } else if (btnStart) {
      btnStart.innerText = "Get Started";
      btnStart.onclick = () => {
        if (typeof window.openAuthModal === "function") {
          window.openAuthModal("signup.html");
        }
      };
    }
  }

  updateHeroState();
});
