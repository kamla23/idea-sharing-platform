document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("ideas-container");
  const filter = document.getElementById("category-filter");
  const searchInput = document.getElementById("search-input");

  let allIdeas = [];
  let likedSet = new Set();
  let editId = null;


  const shareModal = document.getElementById("share-modal");
  const editModal = document.getElementById("edit-modal");
  const btnShareOpen = document.getElementById("share-idea-btn");
  const btnShareClose = document.getElementById("close-share-btn");
  const btnShareCancel = document.getElementById("share-cancel");
  const popupIdeaForm = document.getElementById("popup-idea-form");

  const popClose = document.getElementById("pop-close");
  const popCancel = document.getElementById("pop-cancel");
  const popSave = document.getElementById("pop-save");


  function requireAuth(actionName = "perform this action") {
    const isAuth = window.CONFIG ? window.CONFIG.isAuthenticated() : Boolean(localStorage.getItem("token"));
    if (!isAuth) {
      if (typeof showToast === "function") {
        showToast(`Please login first to ${actionName}!`, "error");
      }
      if (typeof window.openAuthModal === "function") {
        window.openAuthModal("login.html");
      }
      return false;
    }
    return true;
  }

 
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("action") === "new") {
    setTimeout(() => {
      if (requireAuth("share an idea")) {
        if (shareModal) shareModal.style.display = "flex";
      }
    }, 400);
  }


  async function getIdeas() {
    const apiUrl = window.CONFIG ? window.CONFIG.getApiUrl() : "https://idea-sharing-platform-backend.onrender.com/api";
    const headers = window.CONFIG ? window.CONFIG.getHeaders() : {};

    try {
      const res = await fetch(`${apiUrl}/ideas`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        allIdeas = Array.isArray(data) ? data : [];

   
        likedSet.clear();
        const currentUser = window.CONFIG ? window.CONFIG.getUser() : null;
        const currentUserId = currentUser ? (currentUser.id || currentUser._id) : null;

        if (currentUserId && allIdeas.length > 0) {
          allIdeas.forEach((item) => {
            if (Array.isArray(item.likes)) {
              const hasLiked = item.likes.some((like) => {
                const likeId = typeof like === "object" && like !== null ? (like._id || like.id) : like;
                return String(likeId) === String(currentUserId);
              });
              if (hasLiked) likedSet.add(item._id);
            }
          });
        }

        applyFilters();
      } else {
        box.innerHTML = `
          <div style="text-align:center; padding:50px 20px; color:#64748b; width:100%; grid-column: 1 / -1;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:36px; color:#ef4444; margin-bottom:12px; display:block;"></i>
            Failed to load ideas. Please try again later.
          </div>`;
      }
    } catch (err) {
      console.error("Fetch ideas error:", err);
      box.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:#64748b; width:100%; grid-column: 1 / -1;">
          <i class="fa-solid fa-wifi" style="font-size:36px; color:#cbd5e1; margin-bottom:12px; display:block;"></i>
          Unable to connect to server. Please check your internet connection.
        </div>`;
    }
  }

 
  window.getIdeas = getIdeas;

 
  function applyFilters() {
    const category = filter ? filter.value : "all";
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let filtered = allIdeas;

    if (category !== "all") {
      filtered = filtered.filter((i) => i.category === category);
    }

    if (query) {
      filtered = filtered.filter((i) => {
        const titleMatch = i.title && i.title.toLowerCase().includes(query);
        const descMatch = i.description && i.description.toLowerCase().includes(query);
        const catMatch = i.category && i.category.toLowerCase().includes(query);
        const authorMatch = i.author && (
          (typeof i.author === "object" && i.author.username && i.author.username.toLowerCase().includes(query)) ||
          (typeof i.author === "string" && i.author.toLowerCase().includes(query))
        );
        const tagsMatch = Array.isArray(i.tags) && i.tags.some((t) => t.toLowerCase().includes(query));

        return titleMatch || descMatch || catMatch || authorMatch || tagsMatch;
      });
    }

    renderIdeas(filtered);
  }


  function renderIdeas(ideas) {
    if (!box) return;
    box.innerHTML = "";

    if (ideas.length === 0) {
      box.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:#64748b; font-size:15px; width:100%; grid-column: 1 / -1;">
          <i class="fa-regular fa-lightbulb" style="font-size:42px; color:#cbd5e1; display:block; margin-bottom:15px;"></i>
          No ideas found matching your criteria. Be the first to share one!
        </div>`;
      return;
    }

    const currentUser = window.CONFIG ? window.CONFIG.getUser() : null;
    const currentUserId = currentUser ? String(currentUser.id || currentUser._id) : null;
    const currentUsername = window.CONFIG ? window.CONFIG.getUsername() : localStorage.getItem("user_login_name");
    const escape = window.CONFIG ? window.CONFIG.escapeHTML : (s) => String(s || "");

    ideas.forEach((item) => {
      const card = document.createElement("div");
      const cat = item.category || "Other";
      card.id = `card-${item._id}`;
      card.className = `idea-card border-${cat}`;

      const authorName = item.author?.username || (typeof item.author === "string" ? item.author : "Community Member");
      const authorId = item.author?._id ? String(item.author._id) : (typeof item.author === "string" ? String(item.author) : null);

      const isAuthor = Boolean(
        (currentUserId && authorId && currentUserId === authorId) ||
        (currentUsername && authorName && currentUsername.toLowerCase() === authorName.toLowerCase())
      );

      const isLiked = likedSet.has(item._id);
      const likesCount = Array.isArray(item.likes) ? item.likes.length : 0;
      const commentsCount = Array.isArray(item.comments) ? item.comments.length : 0;

      let tagsHTML = "";
      if (Array.isArray(item.tags) && item.tags.length > 0) {
        tagsHTML = `<div style="margin-top: 10px; margin-bottom: 8px;">` +
          item.tags.map((t) => `<span class="idea-tag-chip">#${escape(t)}</span>`).join("") +
          `</div>`;
      }

     
      let cmtsHTML = "";
      if (Array.isArray(item.comments) && item.comments.length > 0) {
        item.comments.forEach((c) => {
          const cAuthor = c.author?.username || c.username || "Member";
          cmtsHTML += `
            <div style="margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2e8f0; line-height: 1.4;">
              <strong style="color:#1e293b; font-size:12px;">${escape(cAuthor)}:</strong>
              <span style="color:#475569; font-size:13px; margin-left:4px;">${escape(c.text)}</span>
            </div>`;
        });
      }

      card.innerHTML = `
        <div class="view-block">
          <div class="card-header">
            <span class="tag tag-${cat}">${escape(cat)}</span>
            <div class="card-actions" style="${isAuthor ? "display:flex;" : "display:none;"}">
              <button class="btn-icon edit-btn" data-id="${item._id}" data-title="${escape(item.title)}" data-cat="${escape(cat)}" data-tags="${escape((item.tags || []).join(", "))}" data-desc="${escape(item.description)}" title="Edit Idea">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="btn-icon del-btn" data-id="${item._id}" title="Delete Idea">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

          <h3>${escape(item.title)}</h3>
          <p class="idea-desc">${escape(item.description)}</p>
          ${tagsHTML}

          <div class="card-meta">
            <i class="fa-regular fa-user" style="margin-right:4px;"></i> By <strong>${escape(authorName)}</strong>
          </div>

          <div class="card-stats" style="margin-top:12px; user-select:none;">
            <span class="like-btn" data-id="${item._id}" style="cursor:pointer; margin-right:18px;">
              <i class="${isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}" style="color:${isLiked ? "#dc2626" : "#64748b"}; font-size:16px;"></i>
              <span class="like-count" style="margin-left:4px;">${likesCount}</span>
            </span>
            <span class="cmt-toggle-btn" data-id="${item._id}" style="cursor:pointer;">
              <i class="fa-regular fa-comment" style="font-size:16px;"></i>
              <span class="cmt-count" style="margin-left:4px;">${commentsCount}</span>
            </span>
          </div>

          <!-- Interactive Comments Section -->
          <div class="cmt-section" id="cmt-section-${item._id}" style="display:none; margin-top:14px; background:#f8fafc; border: 1px solid #e2e8f0; border-radius:10px; padding:12px;">
            <div class="cmt-list" style="max-height:140px; overflow-y:auto; margin-bottom:8px;">
              ${cmtsHTML || `<div class="no-cmts-text" style="color:#94a3b8; font-size:12px; font-style:italic;">No comments yet. Start the conversation!</div>`}
            </div>
            <div class="cmt-input-group">
              <input type="text" class="cmt-input" placeholder="Write a comment..." maxlength="300" />
              <button type="button" class="post-cmt-btn" data-id="${item._id}">Post</button>
            </div>
          </div>
        </div>
      `;

      box.appendChild(card);
    });

    bindCardInteractions();
  }

  function bindCardInteractions() {
    const apiUrl = window.CONFIG ? window.CONFIG.getApiUrl() : "https://idea-sharing-platform-backend.onrender.com/api";
    const headers = window.CONFIG ? window.CONFIG.getHeaders({ "Content-Type": "application/json" }) : { "Content-Type": "application/json" };


    document.querySelectorAll(".like-btn").forEach((btn) => {
      btn.onclick = async function () {
        if (!requireAuth("like this idea")) return;

        const id = this.getAttribute("data-id");
        const icon = this.querySelector("i");
        const countSpan = this.querySelector(".like-count");
        let num = parseInt(countSpan.innerText) || 0;

        const wasLiked = likedSet.has(id);
        if (wasLiked) {
          likedSet.delete(id);
          icon.className = "fa-regular fa-heart";
          icon.style.color = "#64748b";
          num = Math.max(0, num - 1);
        } else {
          likedSet.add(id);
          icon.className = "fa-solid fa-heart";
          icon.style.color = "#dc2626";
          num += 1;
        }
        countSpan.innerText = num;

        try {
          const res = await fetch(`${apiUrl}/ideas/${id}/like`, {
            method: "PUT",
            headers,
            credentials: "include",
          });

          if (!res.ok) {
          
            if (wasLiked) {
              likedSet.add(id);
              icon.className = "fa-solid fa-heart";
              icon.style.color = "#dc2626";
              countSpan.innerText = num + 1;
            } else {
              likedSet.delete(id);
              icon.className = "fa-regular fa-heart";
              icon.style.color = "#64748b";
              countSpan.innerText = Math.max(0, num - 1);
            }
            if (res.status === 401) {
              requireAuth("like this idea");
            }
          }
        } catch (err) {
          console.error("Like error:", err);
        }
      };
    });

  
    document.querySelectorAll(".cmt-toggle-btn").forEach((btn) => {
      btn.onclick = function () {
        const id = this.getAttribute("data-id");
        const cmtSection = document.getElementById(`cmt-section-${id}`);
        if (cmtSection) {
          const isHidden = cmtSection.style.display === "none";
          cmtSection.style.display = isHidden ? "block" : "none";
          if (isHidden) {
            const input = cmtSection.querySelector(".cmt-input");
            if (input) input.focus();
          }
        }
      };
    });


    document.querySelectorAll(".post-cmt-btn").forEach((btn) => {
      btn.onclick = async function () {
        if (!requireAuth("post a comment")) return;

        const id = this.getAttribute("data-id");
        const card = document.getElementById(`card-${id}`);
        if (!card) return;

        const input = card.querySelector(".cmt-input");
        const text = input ? input.value.trim() : "";

        if (!text) {
          if (typeof showToast === "function") showToast("Comment cannot be empty!", "error");
          return;
        }

        const postBtn = this;
        postBtn.disabled = true;
        postBtn.innerText = "...";

        try {
          const res = await fetch(`${apiUrl}/ideas/${id}/comment`, {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({ text }),
          });

          const data = await res.json().catch(() => ({}));

          if (res.ok) {
            input.value = "";
            const currentUsername = window.CONFIG ? window.CONFIG.getUsername() : "You";
            const escape = window.CONFIG ? window.CONFIG.escapeHTML : (s) => String(s || "");

            const cmtList = card.querySelector(".cmt-list");
            const noCmts = cmtList.querySelector(".no-cmts-text");
            if (noCmts) noCmts.remove();

            cmtList.innerHTML += `
              <div style="margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2e8f0; line-height: 1.4;">
                <strong style="color:#1e293b; font-size:12px;">${escape(currentUsername)}:</strong>
                <span style="color:#475569; font-size:13px; margin-left:4px;">${escape(text)}</span>
              </div>`;

            const cmtCountSpan = card.querySelector(".cmt-count");
            if (cmtCountSpan) {
              cmtCountSpan.innerText = parseInt(cmtCountSpan.innerText || "0") + 1;
            }

            if (typeof showToast === "function") showToast("Comment added!", "success");
          } else {
            const msg = data.message || "Failed to post comment.";
            if (typeof showToast === "function") showToast(msg, "error");
          }
        } catch (err) {
          console.error("Comment error:", err);
          if (typeof showToast === "function") showToast("Error connecting to server!", "error");
        } finally {
          postBtn.disabled = false;
          postBtn.innerText = "Post";
        }
      };
    });

  
    document.querySelectorAll(".cmt-input").forEach((input) => {
      input.onkeydown = function (e) {
        if (e.key === "Enter") {
          const postBtn = this.parentElement.querySelector(".post-cmt-btn");
          if (postBtn) postBtn.click();
        }
      };
    });

 
    document.querySelectorAll(".del-btn").forEach((btn) => {
      btn.onclick = async function () {
        if (!confirm("Are you sure you want to permanently delete this idea? 🗑️")) return;

        const id = this.getAttribute("data-id");
        try {
          const res = await fetch(`${apiUrl}/ideas/${id}`, {
            method: "DELETE",
            headers,
            credentials: "include",
          });

          if (res.ok) {
            const card = document.getElementById(`card-${id}`);
            if (card) card.remove();
            if (typeof showToast === "function") showToast("Idea deleted successfully!", "success");
            allIdeas = allIdeas.filter((i) => i._id !== id);
            applyFilters();
          } else {
            const errData = await res.json().catch(() => ({}));
            if (typeof showToast === "function") showToast(errData.message || "Failed to delete idea.", "error");
          }
        } catch (err) {
          console.error("Delete error:", err);
          if (typeof showToast === "function") showToast("Server error during deletion!", "error");
        }
      };
    });

    
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.onclick = function () {
        editId = this.getAttribute("data-id");
        document.getElementById("pop-title").value = this.getAttribute("data-title") || "";
        document.getElementById("pop-cat").value = this.getAttribute("data-cat") || "Technology";
        document.getElementById("pop-tags").value = this.getAttribute("data-tags") || "";
        document.getElementById("pop-desc").value = this.getAttribute("data-desc") || "";

        if (editModal) editModal.style.display = "flex";
      };
    });
  }


  if (popClose) popClose.onclick = () => (editModal.style.display = "none");
  if (popCancel) popCancel.onclick = () => (editModal.style.display = "none");
  if (editModal) {
    editModal.onclick = (e) => {
      if (e.target === editModal) editModal.style.display = "none";
    };
  }

  if (popSave) {
    popSave.onclick = async () => {
      const title = document.getElementById("pop-title").value.trim();
      const category = document.getElementById("pop-cat").value;
      const tags = document.getElementById("pop-tags").value.trim();
      const description = document.getElementById("pop-desc").value.trim();

      if (!title || !description) {
        if (typeof showToast === "function") showToast("Title and description are required!", "error");
        return;
      }

      popSave.disabled = true;
      popSave.innerText = "Saving...";

      const apiUrl = window.CONFIG ? window.CONFIG.getApiUrl() : "https://idea-sharing-platform-backend.onrender.com/api";
      const headers = window.CONFIG ? window.CONFIG.getHeaders({ "Content-Type": "application/json" }) : { "Content-Type": "application/json" };

      try {
        const res = await fetch(`${apiUrl}/ideas/${editId}`, {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({ title, category, tags, description }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          if (typeof showToast === "function") showToast("Idea updated successfully!", "success");
          editModal.style.display = "none";
          getIdeas();
        } else {
          if (typeof showToast === "function") showToast(data.message || "Failed to update idea.", "error");
        }
      } catch (err) {
        console.error("Edit error:", err);
        if (typeof showToast === "function") showToast("Error connecting to server!", "error");
      } finally {
        popSave.disabled = false;
        popSave.innerText = "Save Changes";
      }
    };
  }


  if (btnShareOpen) {
    btnShareOpen.onclick = () => {
      if (requireAuth("share an idea")) {
        shareModal.style.display = "flex";
      }
    };
  }

  if (btnShareClose) btnShareClose.onclick = () => (shareModal.style.display = "none");
  if (btnShareCancel) btnShareCancel.onclick = () => (shareModal.style.display = "none");
  if (shareModal) {
    shareModal.onclick = (e) => {
      if (e.target === shareModal) shareModal.style.display = "none";
    };
  }

  if (popupIdeaForm) {
    popupIdeaForm.onsubmit = async (e) => {
      e.preventDefault();

      if (!requireAuth("share an idea")) return;

      const title = document.getElementById("idea-title").value.trim();
      const category = document.getElementById("idea-cat").value;
      const tags = document.getElementById("idea-tags").value.trim();
      const description = document.getElementById("idea-desc").value.trim();

      if (!title || !description) {
        if (typeof showToast === "function") showToast("Title and description are required!", "error");
        return;
      }

      const submitBtn = document.getElementById("share-submit-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Publishing...";
      }

      const apiUrl = window.CONFIG ? window.CONFIG.getApiUrl() : "https://idea-sharing-platform-backend.onrender.com/api";
      const headers = window.CONFIG ? window.CONFIG.getHeaders({ "Content-Type": "application/json" }) : { "Content-Type": "application/json" };

      try {
        const res = await fetch(`${apiUrl}/ideas`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ title, category, tags, description }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          if (typeof showToast === "function") showToast("Idea published successfully! 🚀", "success");
          popupIdeaForm.reset();
          shareModal.style.display = "none";
          getIdeas();
        } else {
          const msg = data.message || data.error || "Failed to publish idea.";
          if (typeof showToast === "function") showToast(msg, "error");
        }
      } catch (err) {
        console.error("Create idea error:", err);
        if (typeof showToast === "function") showToast("Server error during publish!", "error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Publish Idea`;
        }
      }
    };
  }

  if (filter) {
    filter.addEventListener("change", applyFilters);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }


  getIdeas();
});