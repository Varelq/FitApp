const examplePosts = [
  {
    id: 1,
    title: "🔥 5-minutowy trening na brzuch",
    content: "Idealny poranny zestaw ćwiczeń: plank, scyzoryki i russian twist.",
    author: "Marek Triceps",
    date: "2025-06-01 08:15",
    comments: [
      {id: 1, text: "A gdzie przysiady? Bez nóg to nie trening 😤", likes: 0, dislikes: 0},
      {id: 2, text: "Spisek producentów mat do ćwiczeń!", likes: 0, dislikes: 0}
    ],
    likes: 0,
    dislikes: 0
  },
  {
    id: 2,
    title: "🥗 Zdrowe śniadanie na szybki start",
    content: "Owsianka z owocami i orzechami – idealna dawka energii na cały dzień.",
    author: "Anna Dietetyk",
    date: "2025-06-02 07:30",
    comments: [
      {id: 1, text: "Pyszne i sycące!", likes: 0, dislikes: 0},
      {id: 2, text: "Polecam dodać trochę cynamonu.", likes: 0, dislikes: 0}
    ],
    likes: 0,
    dislikes: 0
  },
  {
    id: 3,
    title: "🤸 Jak poprawić mobilność stawów?",
    content: "Regularne rozciąganie i rolowanie mięśni to klucz do zdrowia i sprawności.",
    author: "Janek Fizjo",
    date: "2025-06-03 09:00",
    comments: [
      {id: 1, text: "Fajny wpis, przyda się!", likes: 0, dislikes: 0},
      {id: 2, text: "A jak często rolujesz?", likes: 0, dislikes: 0}
    ],
    likes: 0,
    dislikes: 0
  },
  {
    id: 4,
    title: "❤️‍🔥 Cardio na świeżym powietrzu",
    content: "Bieganie w parku może być świetną formą relaksu i spalania kalorii.",
    author: "Kasia Runner",
    date: "2025-06-04 06:45",
    comments: [
      {id: 1, text: "Zgadzam się, kocham biegać rano!", likes: 0, dislikes: 0},
      {id: 2, text: "Jakie masz ulubione trasy?", likes: 0, dislikes: 0}
    ],
    likes: 0,
    dislikes: 0
  }
];

const postsContainer = document.getElementById("posts-container");

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Wyświetl posty
function renderPosts() {
  postsContainer.innerHTML = "";
  examplePosts.forEach(post => {
    const postElem = document.createElement("div");
    postElem.className = "post";

    postElem.innerHTML = `
      <div class="post-header">
        <h2 class="post-title">${post.title}</h2>
        <div class="post-info">autor: ${post.author} | ${post.date}</div>
      </div>
      <div class="post-content">${post.content}</div>
      <div class="post-actions">
        <button class="like-post" data-id="${post.id}">👍 ${post.likes}</button>
        <button class="dislike-post" data-id="${post.id}">👎 ${post.dislikes}</button>
      </div>
      <div class="comments" data-post-id="${post.id}">
        ${post.comments.map(c => `
          <div class="comment" data-comment-id="${c.id}">
            <div class="comment-text">${c.text}</div>
            <div>
              <span class="comment-like" data-post-id="${post.id}" data-comment-id="${c.id}">👍 ${c.likes}</span>
              <span class="comment-dislike" data-post-id="${post.id}" data-comment-id="${c.id}" style="color:#e74c3c; margin-left:8px;">👎 ${c.dislikes}</span>
            </div>
          </div>
        `).join("")}
        <form class="comment-form" data-post-id="${post.id}">
          <textarea placeholder="Dodaj komentarz..." required></textarea>
          <button type="submit">Dodaj</button>
        </form>
      </div>
    `;

    postsContainer.appendChild(postElem);
  });
}

// Reakcje like/dislike posty i komentarze
postsContainer.addEventListener("click", e => {
  if(e.target.matches(".like-post")) {
    const id = parseInt(e.target.dataset.id);
    const post = examplePosts.find(p => p.id === id);
    if(post) {
      post.likes++;
      renderPosts();
      showToast("👍 Polubiono post!");
    }
  }
  else if(e.target.matches(".dislike-post")) {
    const id = parseInt(e.target.dataset.id);
    const post = examplePosts.find(p => p.id === id);
    if(post) {
      post.dislikes++;
      renderPosts();
      showToast("👎 Oceniono negatywnie.");
    }
  }
  else if(e.target.matches(".comment-like")) {
    const postId = parseInt(e.target.dataset.postId);
    const commentId = parseInt(e.target.dataset.commentId);
    const post = examplePosts.find(p => p.id === postId);
    if(post) {
      const comment = post.comments.find(c => c.id === commentId);
      if(comment) {
        comment.likes++;
        renderPosts();
        showToast("👍 Polubiono komentarz!");
      }
    }
  }
  else if(e.target.matches(".comment-dislike")) {
    const postId = parseInt(e.target.dataset.postId);
    const commentId = parseInt(e.target.dataset.commentId);
    const post = examplePosts.find(p => p.id === postId);
    if(post) {
      const comment = post.comments.find(c => c.id === commentId);
      if(comment) {
        comment.dislikes++;
        renderPosts();
        showToast("👎 Oceniono komentarz negatywnie.");
      }
    }
  }
});

// Dodawanie komentarza
postsContainer.addEventListener("submit", e => {
  if(e.target.matches(".comment-form")) {
    e.preventDefault();
    const postId = parseInt(e.target.dataset.postId);
    const post = examplePosts.find(p => p.id === postId);
    if(post) {
      const textarea = e.target.querySelector("textarea");
      const newCommentText = textarea.value.trim();
      if(newCommentText.length > 0) {
        const newId = post.comments.length ? post.comments[post.comments.length -1].id + 1 : 1;
        post.comments.push({id: newId, text: newCommentText, likes: 0, dislikes: 0});
        renderPosts();
        textarea.value = "";
        showToast("💬 Komentarz dodany!");
      }
    }
  }
});

// Asystent - rozwiniecie/składanie
const assistant = document.getElementById("assistant");
const assistantToggle = document.getElementById("assistant-toggle");
const assistantSend = document.getElementById("assistant-send");
const assistantInput = document.getElementById("assistant-input");
const assistantResponse = document.getElementById("assistant-response");

assistantToggle.addEventListener("click", e => {
  e.stopPropagation();
  if(assistant.classList.contains("expanded")) {
    assistant.classList.remove("expanded");
    assistantToggle.textContent = "+";
  } else {
    assistant.classList.add("expanded");
    assistantToggle.textContent = "−";
    assistantInput.focus();
  }
});

assistant.addEventListener("click", () => {
  if(!assistant.classList.contains("expanded")) {
    assistant.classList.add("expanded");
    assistantToggle.textContent = "−";
    assistantInput.focus();
  }
});

assistantSend.addEventListener("click", () => {
  const question = assistantInput.value.trim();
  if(question.length === 0) {
    alert("Proszę wpisać pytanie lub problem.");
    return;
  }
  assistantResponse.textContent = "Przetwarzam zapytanie...";
  // Symulacja odpowiedzi eksperta po 1.5s
  setTimeout(() => {
    assistantResponse.textContent = "Ekspert mówi: Dzięki za pytanie! Sprawdź nasze FAQ i wróć, jeśli potrzebujesz więcej pomocy 😉";
    assistantInput.value = "";
  }, 1500);
});

// Inicjuj wyświetlanie postów
renderPosts();