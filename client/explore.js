document.addEventListener("DOMContentLoaded", () => {
    const box = document.getElementById("ideas-container");
    const filter = document.getElementById("category-filter");
    
    const URL = "https://idea-sharing-platform-backend.onrender.com/api";
    
    let user = "Guest"; 
    let currentEditId = null;
    let localLikedIdeas = new Set(); 


    const modal = document.createElement("div");
    modal.style = "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:1000; align-items:center; justify-content:center; backdrop-filter: blur(3px);";
    modal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family: sans-serif;">
            <h3 style="margin-top:0; color:#059669; border-bottom:2px solid #f1f5f9; padding-bottom:10px; margin-bottom:15px;">✏️ Edit Idea Details</h3>
            
            <label style="font-weight:bold; font-size:13px; color:#475569;">Title</label>
            <input type="text" id="pop-title" style="width:100%; padding:10px; margin:5px 0 15px 0; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
            
            <label style="font-weight:bold; font-size:13px; color:#475569;">Category</label>
            <select id="pop-cat" style="width:100%; padding:10px; margin:5px 0 15px 0; border:1px solid #cbd5e1; border-radius:6px; background:white; box-sizing:border-box;">
                <option value="Technology">Technology</option>
                <option value="Science">Science</option>
                <option value="Art">Art</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
            </select>
            
            <label style="font-weight:bold; font-size:13px; color:#475569;">Tags (Comma Separated)</label>
            <input type="text" id="pop-tags" style="width:100%; padding:10px; margin:5px 0 15px 0; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
            
            <label style="font-weight:bold; font-size:13px; color:#475569;">Description</label>
            <textarea id="pop-desc" rows="4" style="width:100%; padding:10px; margin:5px 0 20px 0; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box; resize:none;"></textarea>
            
            <div style="display:flex; gap:12px; justify-content:end;">
                <button id="pop-cancel" style="background:#e2e8f0; color:#475569; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer;">Cancel</button>
                <button id="pop-save" style="background:#059669; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer;">Save Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    function getHeaders(extraHeaders = {}) {
        const token = localStorage.getItem("token");
        const headers = { ...extraHeaders };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    }

    async function checkAuth() {
        try {
            const res = await fetch(`${URL}/auth/me`, { 
                method: "GET", 
                headers: getHeaders() 
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.username) {
                    user = data.username; 
                    console.log("Logged in user verified:", user);
                }
            } else {
                user = "Guest";
            }
        } catch (err) { 
            user = "Guest";
            console.log("Auth bypass mode active."); 
        }
        getIdeas(); 
    }

    async function getIdeas() {
        try {
            const res = await fetch(`${URL}/ideas`, { 
                method: "GET",
                headers: getHeaders()
            });
            if(res.ok) {
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
        const filteredData = val === "all" ? all : all.filter(i => i.category === val);
        
        if (filteredData.length === 0) {
            box.innerHTML = `
                <div style="text-align:center; padding:50px 20px; color:#64748b; font-size:16px; width:100%; grid-column: 1 / -1;">
                    <i class="fa-regular fa-lightbulb" style="font-size: 40px; color: #cbd5e1; margin-bottom: 15px; display: block;"></i>
                     No live ideas found in this category. Be the first to share one!
                </div>`;
            return;
        }
        
        render(filteredData);
    }

    function render(data) {
        box.innerHTML = ""; 
        data.forEach(item => {
            const card = document.createElement("div");
            const cat = item.category || 'Other';
            card.id = `card-${item._id}`;
            card.className = `idea-card border-${cat}`;

            let tags = item.tags ? item.tags.map(t => `<span style="font-size:12px; color:#059669; font-weight:bold; background:#f0fdf4; padding:2px 8px; border-radius:4px;">${t}</span>`).join(" ") : "";
            
            let cmtsHTML = "";
            if (item.comments && item.comments.length > 0) {
                item.comments.forEach(c => {
                    const cmtUser = c.username || c.user || "Guest";
                    cmtsHTML += `<div style="margin-bottom:8px; line-height:1.4;"><i class="fa-regular fa-comment-dots" style="color:#94a3b8; margin-right:4px;"></i> <strong>${cmtUser}:</strong> <span>${c.text}</span></div>`;
                });
            }

            const isLiked = localLikedIdeas.has(item._id);
            const displayAuthor = item.author?.username || item.author || 'Unknown';

            card.innerHTML = `
                <div class="view-block">
                    <div class="card-header">
                        <span class="tag tag-${cat}">${cat}</span>
                        <div class="card-actions">
                            <button class="btn-icon edit-btn" data-id="${item._id}" data-title="${item.title}" data-cat="${cat}" data-tags="${item.tags ? item.tags.join(", ") : ""}" data-desc="${item.description}"><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="btn-icon del-trigger-btn" data-id="${item._id}"><i class="fa-regular fa-trash-can"></i></button>
                        </div>
                    </div>
                    <h3>${item.title}</h3>
                    <p class="idea-desc">${item.description}</p>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">${tags}</div>
                    <div class="card-meta">By <strong>${displayAuthor}</strong></div>
                    
                    <div class="card-stats" style="user-select:none; margin-top:12px;">
                        <span class="like-btn" data-id="${item._id}" style="cursor:pointer; margin-right:15px;">
                            <i class="${isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" style="color:${isLiked ? '#dc2626' : '#64748b'};"></i> <span class="like-count">${item.likes || 0}</span>
                        </span>
                        <span class="cmt-btn" data-id="${item._id}" style="cursor:pointer;">
                            <i class="fa-regular fa-comment"></i> <span class="cmt-count">${item.comments ? item.comments.length : 0}</span>
                        </span>
                    </div>
                    
                    <div class="cmt-box" style="${cmtsHTML ? 'display:block;' : 'display:none;'} max-height:150px; overflow-y:auto; background:#f8fafc; border-radius:6px; padding:10px; margin-top:12px; font-size:13px;">
                        ${cmtsHTML}
                    </div>
                </div>

                <div class="delete-confirm-block" style="display:none; text-align:center; padding:20px 10px;">
                    <i class="fa-solid fa-triangle-exclamation" style="color:#dc2626; font-size:30px; margin-bottom:10px;"></i>
                    <h4 style="margin:0 0 10px 0; color:#1e293b;">Are you absolutely sure?</h4>
                    <p style="font-size:12px; color:#64748b; margin:0 0 15px 0;">This action cannot be undone.</p>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button class="cancel-del-btn" style="background:#e2e8f0; color:#475569; border:none; padding:6px 14px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:13px;">Cancel</button>
                        <button class="confirm-del-btn" data-id="${item._id}" style="background:#dc2626; color:white; border:none; padding:6px 14px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:13px;">Delete</button>
                    </div>
                </div>
            `;
            box.appendChild(card);
        });

        actions();
    }

    function actions() {
        document.querySelectorAll(".like-btn").forEach(b => {
            b.onclick = async function() {
                if (!localStorage.getItem("token") || user === "Guest") {
                    alert("Please Login first to like ideas!");
                    window.location.href = "login.html";
                    return;
                }

                const id = this.getAttribute("data-id");
                const icon = this.querySelector("i");
                const countSpan = this.querySelector(".like-count");
                
                let currentLikes = parseInt(countSpan.innerText);
                if (isNaN(currentLikes)) currentLikes = 0;

                if (localLikedIdeas.has(id)) {
                    localLikedIdeas.delete(id);
                    icon.className = "fa-regular fa-heart";
                    icon.style.color = "#64748b";
                    currentLikes = Math.max(0, currentLikes - 1);
                } else {
                    localLikedIdeas.add(id);
                    icon.className = "fa-solid fa-heart";
                    icon.style.color = "#dc2626";
                    currentLikes = currentLikes + 1;
                }

                countSpan.innerText = currentLikes;

                try {
                    await fetch(`${URL}/ideas/${id}/like`, { 
                        method: "POST", 
                        headers: getHeaders()
                    });
                } catch (err) { 
                    console.error("Backend sync failed:", err); 
                }
            };
        });

        document.querySelectorAll(".cmt-btn").forEach(b => {
            b.onclick = async function() {
                if (!localStorage.getItem("token") || user === "Guest") {
                    alert("🔒 Please Login first to comment!");
                    window.location.href = "login.html";
                    return;
                }

                const id = this.getAttribute("data-id");
                const msg = prompt(`Commenting as: ${user}`); 
                
                if (msg && msg.trim() !== "") {
                    const card = document.getElementById(`card-${id}`);
                    const cmtBox = card.querySelector(".cmt-box");
                    const cmtCount = card.querySelector(".cmt-count");

                    const currentHTML = cmtBox.innerHTML;
                    cmtBox.innerHTML = currentHTML + `<div style="margin-bottom:8px; line-height: 1.4;"><i class="fa-regular fa-comment-dots" style="color: #94a3b8; margin-right: 4px;"></i> <strong>${user}:</strong> <span>${msg.trim()}</span></div>`;
                    cmtBox.style.display = "block";
                    cmtCount.innerText = parseInt(cmtCount.innerText) + 1;

                    try {
                        await fetch(`${URL}/ideas/${id}/comment`, {
                            method: "POST",
                            headers: getHeaders({ 'Content-Type': 'application/json' }),
                            body: JSON.stringify({ text: msg.trim() })
                        });
                    } catch (err) { console.error(err); }
                }
            };
        });

        document.querySelectorAll(".del-trigger-btn").forEach(b => {
            b.onclick = function() {
                const card = document.getElementById(`card-${this.getAttribute("data-id")}`);
                card.querySelector(".view-block").style.display = "none";
                card.querySelector(".delete-confirm-block").style.display = "block";
            };
        });

        document.querySelectorAll(".cancel-del-btn").forEach(b => {
            b.onclick = function() {
                const card = this.closest(".idea-card");
                card.querySelector(".delete-confirm-block").style.display = "none";
                card.querySelector(".view-block").style.display = "block";
            };
        });

        document.querySelectorAll(".confirm-del-btn").forEach(b => {
            b.onclick = async function() {
                const id = this.getAttribute("data-id");
                document.getElementById(`card-${id}`).remove();
                try {
                    await fetch(`${URL}/ideas/${id}`, { 
                        method: "DELETE", 
                        headers: getHeaders()
                    });
                } catch (err) { console.error(err); }
            };
        });

        document.querySelectorAll(".edit-btn").forEach(b => {
            b.onclick = function() {
                currentEditId = this.getAttribute("data-id");
                document.getElementById("pop-title").value = this.getAttribute("data-title");
                document.getElementById("pop-cat").value = this.getAttribute("data-cat");
                document.getElementById("pop-tags").value = this.getAttribute("data-tags");
                document.getElementById("pop-desc").value = this.getAttribute("data-desc");
                modal.style.display = "flex";
            };
        });
    }

    document.getElementById("pop-cancel").onclick = () => modal.style.display = "none";

    document.getElementById("pop-save").onclick = async () => {
        const t = document.getElementById("pop-title").value.trim();
        const c = document.getElementById("pop-cat").value;
        const tg = document.getElementById("pop-tags").value.trim();
        const d = document.getElementById("pop-desc").value.trim();
        let tagsArr = tg !== "" ? tg.split(",").map(x => x.trim().startsWith("#") ? x.trim() : "#" + x.trim()) : [];

        const targetCard = document.getElementById(`card-${currentEditId}`);
        if(targetCard) {
            targetCard.querySelector("h3").innerText = t;
            targetCard.querySelector(".idea-desc").innerText = d;
            const editBtn = targetCard.querySelector(".edit-btn");
            editBtn.setAttribute("data-title", t);
            editBtn.setAttribute("data-cat", c);
            editBtn.setAttribute("data-tags", tg);
            editBtn.setAttribute("data-desc", d);
        }

        modal.style.display = "none";

        try {
            await fetch(`${URL}/ideas/${currentEditId}`, {
                method: "PUT",
                headers: getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ title: t, category: c, tags: tagsArr, description: d })
            });
            getIdeas();
        } catch (err) { console.error(err); }
    };

    filter.addEventListener("change", getIdeas);
    checkAuth();
});