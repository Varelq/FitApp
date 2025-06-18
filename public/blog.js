document.addEventListener("DOMContentLoaded", () => {
  fetchPosts();
});

function fetchPosts() {
  fetch("http://localhost:3000/api/posts")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(posts => renderPosts(posts))
    .catch(err => {
      document.getElementById("posts-container").innerHTML = 
        `<p style="color:red;">Błąd ładowania postów: ${err.message}</p>`;
      console.error("Fetch error:", err);
    });
}

function renderPosts(posts) {
  const container = document.getElementById("posts-container");
  container.innerHTML = "";
  
  if (posts.length === 0) {
    container.innerHTML = "<p>Brak postów do wyświetlenia.</p>";
    return;
  }

  posts.forEach(post => {
    const postElem = document.createElement("article");
    postElem.classList.add("post");
    postElem.innerHTML = `
      <h2>${post.title}</h2>
      ${post.image_path ? `<img src="${post.image_path}" alt="${post.title}" />` : ""}
      <p>${post.content}</p>
      <small>Opublikowano: ${post.date}</small>
      <div class="comments-section" id="comments-${post.id}">
        <h3>Komentarze (${post.comments?.length || 0})</h3>
        <div class="comments-list" id="comments-list-${post.id}"></div>
        <form class="comment-form" id="comment-form-${post.id}" autocomplete="off">
          <input type="text" name="author" placeholder="Autor (opcjonalnie)">
          <textarea name="comment" placeholder="Twój komentarz..." required></textarea>
          <button type="submit">Dodaj komentarz</button>
        </form>
      </div>
    `;
    
    container.appendChild(postElem);
    
    // Pobierz i pokaż komentarze dla posta
    fetchComments(post.id);
    
    // Obsługa dodawania komentarzy
    document.getElementById(`comment-form-${post.id}`).addEventListener("submit", e => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const commentData = {
        author: formData.get("author") || "",
        comment: formData.get("comment")
      };
      
      fetch(`http://localhost:3000/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData)
      })
      .then(() => {
        e.target.reset();
        fetchComments(post.id);
      })
      .catch(err => console.error("Błąd dodawania komentarza:", err));
    });
  });
}

function fetchComments(postId) {
  fetch(`http://localhost:3000/api/posts/${postId}/comments`)
    .then(res => res.json())
    .then(comments => {
      const commentsList = document.getElementById(`comments-list-${postId}`);
      commentsList.innerHTML = "";
      
      comments.forEach(comment => {
        const commentElem = document.createElement("div");
        commentElem.classList.add("comment");
        commentElem.innerHTML = `
          <strong>${comment.author || "Anonim"}</strong>
          <p>${comment.comment}</p>
          <small>${comment.date}</small>
        `;
        commentsList.appendChild(commentElem);
      });
    })
    .catch(err => console.error("Błąd pobierania komentarzy:", err));
}
