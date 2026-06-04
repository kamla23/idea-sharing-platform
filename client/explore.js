
document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("ideas-container");
  const filter = document.getElementById("category-filter");
  const URL = "https://idea-sharing-platform-backend.onrender.com/api";

 
  let user = localStorage.getItem("user_login_name") 
  
  let authToken = localStorage.getItem("token") || ""; 

  const storedUser = localStorage.getItem("user");
  let userObj = null;

  if (storedUser) {
    try {
      userObj = JSON.parse(storedUser);
  
      if (!authToken && userObj) {
        authToken = userObj.token || userObj.accessToken || ""; 
      }
    } catch (err) {
      console.error("Error parsing user object from localStorage:", err);
    }
  }


  console.log("Logged-in User:", user);
  console.log("Token Status:", authToken ? " FOUND" : "NOT FOUND (Login again)");

  let editId = null;
  let likedSet = new Set();


  function getRequestHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    return headers;
  }

  const modal = document.createElement("div");
  modal.style =
    "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:1000; align-items:center; justify-content:center; backdrop-filter: blur(3px);";
  modal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:450px; font-family: sans-serif;">
            <h3 style="margin:0 0 15px 0; color:#ff6347;"> Edit Idea</h3>
            <label style="font-weight:bold; font-size:13px;">Title</label>
            <input type="text" id="pop-title" style="width:100%; padding:10px; margin:5px 0 15px 0; border:1px solid #cbd5e1; border-radius:6px;">
            <label style="font-weight:bold; font-size:13px;">Category</label>
            <select id="pop-cat" style="width:100%; padding:10px; margin:5px 0 15px 0; border:1px solid #cbd5e1; border-radius:6px;">
                <option value="Technology">Technology</option>
                <option value="Science">Science</option>
                <option value="Art">Art</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
            </select>
            <label style="font-weight:bold; font-size:13px;">Description</label>
            <textarea id="pop-desc" rows="4" style="width:100%; padding:10px; margin:5px 0 20px 0; border:1px solid #cbd5e1; border-radius:6px; resize:none;"></textarea>
            <div style="display:flex; gap:12px; justify-content:end;">
                <button id="pop-cancel" style="background:#e2e8f0; border:none; padding:10px 20px; border-radius:6px; cursor:pointer;">Cancel</button>
                <button id="pop-save" style="background:#ff6347; color:white; border:none; padding:10px 20px; border-radius:6px; cursor:pointer;">Save</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  async function getIdeas() {
    try {
      const res = await fetch(`${URL}/ideas`, {
        method: "GET",
        headers: getRequestHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        showFiltered(data && data.length > 0 ? data : []);
      } else {
        showFiltered([]);
      }
    } catch (err) {
      showFiltered([]);
    }
  }

  function showFiltered(all) {
    const val = filter.value;
    const filtered =
      val === "all" ? all : all.filter((i) => i.category === val);

    if (filtered.length === 0) {
      box.innerHTML = `
                <div style="text-align:center; padding:50px 20px; color:#64748b; font-size:16px; width:100%; grid-column: 1 / -1;">
                    <i class="fa-regular fa-lightbulb" style="font-size:40px; color:#cbd5e1; display:block; margin-bottom:15px; margin: 0 auto 15px auto;"></i>
                    No live ideas found in this category. Be the first to share one!
                </div>`;
      return;
    }
    render(filtered);
  }

  function render(data) {
    box.innerHTML = "";
    data.forEach((item) => {
      const card = document.createElement("div");
      const cat = item.category || "Other";
      card.id = `card-${item._id}`;
      card.className = `idea-card border-${cat}`;

      let cmtsHTML = "";
      if (item.comments && item.comments.length > 0) {
        item.comments.forEach((c) => {
          cmtsHTML += `<div style="margin-bottom:8px;"><strong>${
            c.username || "Guest"
          }:</strong> <span>${c.text}</span></div>`;
        });
      }

      const isLiked = likedSet.has(item._id);
      

      const currentLoggedInUser = localStorage.getItem("user_login_name");
      const isAuthor = item.author && (item.author.username === currentLoggedInUser || item.author === currentLoggedInUser);
      
      card.innerHTML = `
                <div class="view-block">
                    <div class="card-header">
                        <span class="tag tag-${cat}">${cat}</span>
                        <div class="card-actions" style="${isAuthor ? 'display:flex;' : 'display:none;'}">
                            <button class="btn-icon edit-btn" data-id="${item._id}" data-title="${item.title}" data-cat="${cat}" data-desc="${item.description}"><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="btn-icon del-btn" data-id="${item._id}"><i class="fa-regular fa-trash-can"></i></button>
                        </div>
                    </div>
                    <h3>${item.title}</h3>
                    <p class="idea-desc">${item.description}</p>
                    <div class="card-meta">By <strong>${item.author?.username || item.author || "Unknown"}</strong></div>
                    <div class="card-stats" style="margin-top:12px; user-select:none;">
                        <span class="like-btn" data-id="${item._id}" style="cursor:pointer; margin-right:15px;">
                            <i class="${isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}" style="color:${isLiked ? "#dc2626" : "#64748b"};"></i> <span class="like-count">${item.likes || 0}</span>
                        </span>
                        <span class="cmt-btn" data-id="${item._id}" style="cursor:pointer;">
                            <i class="fa-regular fa-comment"></i> <span class="cmt-count">${item.comments ? item.comments.length : 0}</span>
                        </span>
                    </div>
                    <div class="cmt-box" style="${cmtsHTML ? "display:block;" : "display:none;"} max-height:120px; overflow-y:auto; background:#f8fafc; padding:10px; margin-top:12px; font-size:13px; border-radius:6px;">
                        ${cmtsHTML}
                    </div>
                </div>
            `;
      box.appendChild(card);
    });
    bindActions();
  }

  function bindActions() {
    document.querySelectorAll(".like-btn").forEach((b) => {
      b.onclick = async function () {
        if (user === "Guest") {
          alert("Please Login first!");
          return;
        }
        const id = this.getAttribute("data-id");
        const icon = this.querySelector("i");
        const count = this.querySelector(".like-count");
        let num = parseInt(count.innerText) || 0;

        if (likedSet.has(id)) {
          likedSet.delete(id);
          icon.className = "fa-regular fa-heart";
          icon.style.color = "#64748b";
          num = Math.max(0, num - 1);
        } else {
          likedSet.add(id);
          icon.className = "fa-solid fa-heart";
          icon.style.color = "#dc2626";
          num++;
        }
        count.innerText = num;
        try {
          await fetch(`${URL}/ideas/${id}/like`, {
            method: "POST",
            headers: getRequestHeaders(),
            credentials: "include",
          });
        } catch (err) {}
      };
    });

    document.querySelectorAll(".cmt-btn").forEach((b) => {
      b.onclick = async function () {
        if (user === "Guest") {
          alert("Please Login first!");
          return;
        }
        const id = this.getAttribute("data-id");
        const msg = prompt(`Commenting as: ${user}`);
        if (msg && msg.trim() !== "") {
          const card = document.getElementById(`card-${id}`);
          const cmtBox = card.querySelector(".cmt-box");
          const cmtCount = card.querySelector(".cmt-count");
          cmtBox.innerHTML += `<div><strong>${user}:</strong> <span>${msg.trim()}</span></div>`;
          cmtBox.style.display = "block";
          cmtCount.innerText = parseInt(cmtCount.innerText) + 1;
          try {
            await fetch(`${URL}/ideas/${id}/comment`, {
              method: "POST",
              headers: getRequestHeaders({ "Content-Type": "application/json" }),
              credentials: "include",
              body: JSON.stringify({ text: msg.trim(), username: user }),
            });
          } catch (err) {}
        }
      };
    });

    document.querySelectorAll(".del-btn").forEach((b) => {
      b.onclick = async function () {
        if (!confirm("Are you sure you want to delete this idea? 🗑️")) return;
        const id = this.getAttribute("data-id");
        document.getElementById(`card-${id}`).remove();
        try {
          await fetch(`${URL}/ideas/${id}`, {
            method: "DELETE",
            headers: getRequestHeaders(),
            credentials: "include",
          });
        } catch (err) {}
      };
    });

    document.querySelectorAll(".edit-btn").forEach((b) => {
      b.onclick = function () {
        editId = this.getAttribute("data-id");
        document.getElementById("pop-title").value = this.getAttribute("data-title");
        document.getElementById("pop-cat").value = this.getAttribute("data-cat");
        document.getElementById("pop-desc").value = this.getAttribute("data-desc");
        modal.style.display = "flex";
      };
    });
  }

  document.getElementById("pop-cancel").onclick = () =>
    (modal.style.display = "none");

  document.getElementById("pop-save").onclick = async () => {
    const t = document.getElementById("pop-title").value.trim();
    const c = document.getElementById("pop-cat").value;
    const d = document.getElementById("pop-desc").value.trim();

    modal.style.display = "none";
    try {
      await fetch(`${URL}/ideas/${editId}`, {
        method: "PUT",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({ title: t, category: c, description: d }),
      });
      getIdeas();
    } catch (err) {}
  };

  filter.addEventListener("change", getIdeas);
  getIdeas();

  const shareModal = document.getElementById("share-modal");
  const btnShareOpen = document.getElementById("share-idea-btn");
  const btnShareClose = document.getElementById("close-share-btn");
  const btnShareCancel = document.getElementById("share-cancel");
  const popupIdeaForm = document.getElementById("popup-idea-form");

  if (btnShareOpen) {
      btnShareOpen.onclick = () => {
          if (user === "Guest") {
              alert("Please login first to share an idea! ");
              return;
          }
          shareModal.style.display = "flex";
      };
  }

  if (btnShareClose) btnShareClose.onclick = () => shareModal.style.display = "none";
  if (btnShareCancel) btnShareCancel.onclick = () => shareModal.style.display = "none";

  if (popupIdeaForm) {
      popupIdeaForm.onsubmit = async (e) => {
          e.preventDefault();

          const title = document.getElementById("idea-title").value.trim();
          const category = document.getElementById("idea-cat").value;
          const description = document.getElementById("idea-desc").value.trim();

          try {
              const res = await fetch(`${URL}/ideas`, {
                  method: "POST",
                  headers: getRequestHeaders({ "Content-Type": "application/json" }),
                  credentials: "include", 
                  body: JSON.stringify({ 
                      title, 
                      category, 
                      description,
                      userId: userObj ? (userObj.id || userObj._id) : null,
                      username: user 
                  })
              });

              if (res.ok) {
                  alert("Idea shared successfully! ");
                  popupIdeaForm.reset(); 
                  shareModal.style.display = "none"; 
                  getIdeas();
              } else {
                  const errData = await res.json().catch(() => ({}));
                  alert(errData.message || errData.error || "Failed to share idea. Please re-login and try again!");
              }
          } catch (err) {
              console.error("Error sharing idea:", err);
              alert("Server error! Please try again later.");
          }
      };
  }
});





