function showToast(message, type = "success") {
  const existing = document.querySelector(".toast-container");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast-container toast-${type}`;

  const icon = type === "success" ? "🎉" : "❌";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 300);
    }
  }, 3200);
}

window.showToast = showToast;
