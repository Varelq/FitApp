const recipes = [
    {
        name: "Sałatka z kurczakiem i awokado",
        desc: "Grillowany kurczak, świeże awokado, rukola, pomidorki koktajlowe, oliwa z oliwek. Szybka i zdrowa propozycja na lunch.",
        author: "Anna Dietetyk",
        date: "2025-06-01",
        tags: ["kurczak", "sałatka", "lunch", "fit"],
        img: "public/kurczak_awokado.png"
    },
    {
        name: "Owsianka z owocami i orzechami",
        desc: "Płatki owsiane gotowane na mleku, z dodatkiem świeżych owoców i orzechów. Idealne śniadanie na dobry początek dnia.",
        author: "Marek Triceps",
        date: "2025-06-02",
        tags: ["owsianka", "śniadanie", "fit", "orzechy"],
        img: "public/owsianka.png"
    },
    {
        name: "Pieczony łosoś z warzywami",
        desc: "Łosoś pieczony z brokułami, marchewką i ziemniakami. Bogaty w białko i kwasy omega-3.",
        author: "Kasia Runner",
        date: "2025-06-03",
        tags: ["łosoś", "obiad", "omega3", "fit"],
        img: "public/losos.png"
    },
    {
        name: "Omlet białkowy z warzywami",
        desc: "Białka jaj, szpinak, papryka, cebula. Lekki i pożywny posiłek po treningu.",
        author: "Janek Fizjo",
        date: "2025-06-04",
        tags: ["omlet", "kolacja", "białko", "warzywa"],
        img: "public/omlet.png"
    }
];

function renderRecipes(filter = "") {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = "";
    const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(filter) ||
        recipe.desc.toLowerCase().includes(filter) ||
        recipe.tags.some(tag => tag.includes(filter))
    );
    if (filtered.length === 0) {
        recipeList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 30px 0;">Nie znaleziono przepisów.</div>`;
        return;
    }
    filtered.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img class="recipe-img" src="${recipe.img}" alt="${recipe.name}">
            <div class="recipe-content">
                <div class="recipe-title">${recipe.name}</div>
                <div class="recipe-meta">autor: ${recipe.author} | ${recipe.date}</div>
                <div class="recipe-desc">${recipe.desc}</div>
                <div class="recipe-tags">
                    ${recipe.tags.map(tag => `<span class="recipe-tag">#${tag}</span>`).join(' ')}
                </div>
            </div>
        `;
        recipeList.appendChild(card);
    });
} 

document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('searchBox');
    renderRecipes();
    searchBox.addEventListener('input', e => {
        renderRecipes(e.target.value.trim().toLowerCase());
    });
});
