let recipes = [];
let currentUser = null;
let currentUserRole = null;

// Pobierz aktualnego użytkownika i jego rolę z backendu (na podstawie sesji)
function fetchCurrentUser() {
    return fetch('/api/current_user', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            currentUser = data.username;
            currentUserRole = data.role;
        });
}

// Komunikat o sukcesie
function showRecipeSuccess(msg) {
    const el = document.getElementById('recipeSuccess');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.opacity = '1';
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => { el.style.display = 'none'; }, 500);
    }, 2000);
}

// Pobierz przepisy z backendu
function fetchRecipes() {
    fetch('/api/recipes', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            recipes = data;
            renderRecipes();
        });
}

// Renderowanie kart przepisów
function renderRecipes(filter = "", selectedDiet = "") {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = "";

    const filtered = recipes.filter(recipe => {
        const matchesText =
            (recipe.title && recipe.title.toLowerCase().includes(filter)) ||
            (recipe.ingredients && recipe.ingredients.toLowerCase().includes(filter)) ||
            (recipe.instructions && recipe.instructions.toLowerCase().includes(filter));
        return matchesText && (selectedDiet === "" || (recipe.diet && recipe.diet === selectedDiet));
    });

    if (filtered.length === 0) {
        recipeList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 30px 0;">Nie znaleziono przepisów.</div>`;
        return;
    }

    filtered.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img class="recipe-img" src="${recipe.image_path || 'public/default_recipe_user.png'}" alt="${recipe.title}">
            <div class="recipe-content">
                <div class="recipe-title">${recipe.title}</div>
                <div class="recipe-meta">autor: ${recipe.author || 'Nieznany'} | ${recipe.date || ''}</div>
                <div class="recipe-desc">
                    ${(recipe.ingredients || '').length > 80 
                        ? (recipe.ingredients.substring(0, 80) + '...') 
                        : recipe.ingredients}
                </div>
                <div class="recipe-tags">
                    ${recipe.diet ? `<span class="recipe-tag">#${recipe.diet}</span>` : ''}
                </div>
            </div>
        `;
        card.addEventListener('click', () => showRecipeDetail(recipe.id));
        recipeList.appendChild(card);
    });
}

// Obsługa modali, filtrów i formularzy
document.addEventListener('DOMContentLoaded', () => {
    fetchCurrentUser().then(() => {
        fetchRecipes();
    });

    const searchBox = document.getElementById('searchBox');
    const dietFilter = document.getElementById('dietFilter');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const addRecipeModal = document.getElementById('addRecipeModal');
    const addRecipeForm = document.getElementById('addRecipeForm');
    const recipeDetailModal = document.getElementById('recipeDetailModal');
    const closeDetailModal = document.getElementById('closeDetailModal');

    function updateFilter() {
        const text = searchBox ? searchBox.value.trim().toLowerCase() : "";
        const diet = dietFilter ? dietFilter.value : "";
        renderRecipes(text, diet);
    }

    if (searchBox) searchBox.addEventListener('input', updateFilter);
    if (dietFilter) dietFilter.addEventListener('change', updateFilter);

    if (addRecipeBtn) {
        addRecipeBtn.onclick = () => {
            addRecipeModal.style.display = 'block';
        };
    }
    if (addRecipeModal) {
        addRecipeModal.onclick = (e) => {
            if (e.target === addRecipeModal) addRecipeModal.style.display = 'none';
        };
    }
    if (addRecipeForm) {
        addRecipeForm.onsubmit = function(e) {
            e.preventDefault();
            const form = e.target;

            fetch('/api/recipes', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title.value,
                    ingredients: form.ingredients.value,
                    instructions: form.instructions.value
                })
            }).then(res => {
                if (res.status === 401) {
                    alert("Musisz być zalogowany, aby dodać przepis!");
                    return;
                }
                form.reset();
                addRecipeModal.style.display = 'none';
                showRecipeSuccess("Przepis został dodany!");
                fetchRecipes();
            });
        };
    }
    if (closeDetailModal) {
        closeDetailModal.onclick = () => {
            recipeDetailModal.style.display = 'none';
        };
    }
});

// Szczegóły przepisu i obsługa usuwania
function showRecipeDetail(id) {
    fetch(`/api/recipes/${id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(recipe => {
            document.getElementById('detailTitle').textContent = recipe.title;
            document.getElementById('detailIngredients').textContent = recipe.ingredients;
            document.getElementById('detailInstructions').textContent = recipe.instructions;
            renderComments(recipe.comments, id);
            document.getElementById('recipeDetailModal').style.display = 'block';

            // Prosta logika: moderator lub autor widzi przycisk "Usuń"
            const deleteBtn = document.getElementById('deleteRecipeBtn');
            if (deleteBtn) {
                const isOwner = currentUser && recipe.author && currentUser === recipe.author;
                const isModerator = currentUserRole === 'moderator';
                if (isOwner || isModerator) {
                    deleteBtn.style.display = 'block';
                    deleteBtn.onclick = function() {
                        if (confirm('Czy na pewno chcesz usunąć ten przepis?')) {
                            fetch(`/api/recipes/${id}`, { 
                                method: 'DELETE', 
                                credentials: 'include' 
                            }).then(() => {
                                document.getElementById('recipeDetailModal').style.display = 'none';
                                fetchRecipes();
                            });
                        }
                    };
                } else {
                    deleteBtn.style.display = 'none';
                    deleteBtn.onclick = null;
                }
            }

            document.getElementById('addCommentForm').onsubmit = function(e) {
                e.preventDefault();
                const form = e.target;
                fetch(`/api/recipes/${id}/comments`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        author: form.author ? form.author.value : "",
                        comment: form.comment.value
                    })
                }).then(() => {
                    form.reset();
                    fetch(`/api/recipes/${id}/comments`, { credentials: 'include' })
                        .then(res => res.json())
                        .then(comments => renderComments(comments, id));
                });
            };
        });
}

// Renderowanie komentarzy
function renderComments(comments, recipeId) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `<strong>${c.author || 'Anonim'}:</strong> ${c.comment} <span style="color:#888;font-size:0.9em;">${c.date || ''}</span>`;
        commentsList.appendChild(div);
    });
}
    