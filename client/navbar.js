fetch("navbar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("navbar").innerHTML = data;

    const user = JSON.parse(localStorage.getItem("user"));

    const userName = document.getElementById("user-name");
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.getElementById("logout-link");

    if (user) {
      userName.style.display = "block";
      userName.innerText = user.username;

      loginLink.style.display = "none";
      logoutLink.style.display = "block";
    }
  });

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
