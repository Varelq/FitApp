document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/api/posts") // dopasuj URL backendu jeśli trzeba
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(posts => {
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
        `;
        container.appendChild(postElem);
      });
    })
    .catch(err => {
      document.getElementById("posts-container").innerHTML = `<p style="color:red;">Błąd ładowania postów: ${err.message}</p>`;
      console.error("Fetch error:", err);
    });
});
