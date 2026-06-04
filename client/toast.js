function showToast(message, type = "success") {

    const toast = document.createElement("div");
    

    toast.className = `toast-container toast-${type}`;
    
    const icon = type === "success" ? "🎉" : "❌";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
 
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "none"; 
        toast.remove();
    }, 3000);
}