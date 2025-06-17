// public/przepisy.js

const recipes = [
    // Wegetariańskie
    {
        name: "Owsianka z owocami i orzechami",
        desc: "Płatki owsiane gotowane na mleku, z dodatkiem świeżych owoców i orzechów. Idealne śniadanie na dobry początek dnia.",
        author: "Marek Triceps",
        date: "2025-06-02",
        tags: ["owsianka", "śniadanie", "fit", "orzechy"],
        diet: "wegetariańska",
        img: "public/owsianka.png"
    },
    {
        name: "Zupa krem z dyni",
        desc: "Dynia, marchew, mleczko kokosowe, przyprawy. Idealna na jesienne dni.",
        author: "Anna Dietetyk",
        date: "2025-06-05",
        tags: ["zupa", "dynia", "wegetariańska", "obiad"],
        diet: "wegetariańska",
        img: "public/zupa_dyniowa.png"
    },
    {
        name: "Makaron z pesto i pomidorkami",
        desc: "Pełnoziarnisty makaron, pesto bazyliowe, pomidorki koktajlowe, parmezan.",
        author: "Kasia Runner",
        date: "2025-06-06",
        tags: ["makaron", "obiad", "wegetariańska", "pesto"],
        diet: "wegetariańska",
        img: "public/makaron_pesto.png"
    },
    {
        name: "Placki z cukinii",
        desc: "Cukinia, jajko, mąka owsiana, przyprawy. Lekka i szybka przekąska.",
        author: "Janek Fizjo",
        date: "2025-06-07",
        tags: ["cukinia", "placki", "fit", "wegetariańska"],
        diet: "wegetariańska",
        img: "public/placki_cukinia.png"
    },

    // Low Carb
    {
        name: "Sałatka z kurczakiem i awokado",
        desc: "Grillowany kurczak, świeże awokado, rukola, pomidorki koktajlowe, oliwa z oliwek.",
        author: "Anna Dietetyk",
        date: "2025-06-01",
        tags: ["kurczak", "sałatka", "lunch", "fit"],
        diet: "low carb",
        img: "public/kurczak_awokado.png"
    },
    {
        name: "Omlet białkowy z warzywami",
        desc: "Białka jaj, szpinak, papryka, cebula. Lekki i pożywny posiłek po treningu.",
        author: "Janek Fizjo",
        date: "2025-06-04",
        tags: ["omlet", "kolacja", "białko", "warzywa"],
        diet: "low carb",
        img: "public/omlet.png"
    },
    {
        name: "Burger bez bułki",
        desc: "Mielona wołowina, ser, sałata, pomidor, cebula. Wszystko zawinięte w liść sałaty.",
        author: "Marek Triceps",
        date: "2025-06-08",
        tags: ["burger", "lowcarb", "kolacja"],
        diet: "low carb",
        img: "public/burger_salata.png"
    },
    {
        name: "Tortilla z jajecznicą i szpinakiem",
        desc: "Jajka, szpinak, cebulka, zawinięte w pełnoziarnistą tortillę.",
        author: "Anna Dietetyk",
        date: "2025-06-09",
        tags: ["śniadanie", "lowcarb", "jajka"],
        diet: "low carb",
        img: "public/tortilla_jajka.png"
    },

    // Peskatariańskie
    {
        name: "Pieczony łosoś z warzywami",
        desc: "Łosoś pieczony z brokułami, marchewką i ziemniakami. Bogaty w białko i omega-3.",
        author: "Kasia Runner",
        date: "2025-06-03",
        tags: ["łosoś", "obiad", "omega3", "fit"],
        diet: "peskatariańska",
        img: "public/losos.png"
    },
    {
        name: "Sałatka z tuńczykiem i jajkiem",
        desc: "Tuńczyk, jajko na twardo, sałata rzymska, oliwki, pomidory.",
        author: "Janek Fizjo",
        date: "2025-06-10",
        tags: ["tuńczyk", "jajko", "sałatka"],
        diet: "peskatariańska",
        img: "public/salatka_tunczyk.png"
    },
    {
        name: "Makrela z warzywami na parze",
        desc: "Makrela gotowana na parze z warzywami: brokuł, kalafior, marchew.",
        author: "Marek Triceps",
        date: "2025-06-11",
        tags: ["makrela", "parowane", "obiad"],
        diet: "peskatariańska",
        img: "public/makrela.png"
    },
    {
        name: "Jajka faszerowane łososiem",
        desc: "Jajka gotowane na twardo faszerowane pastą z wędzonego łososia i koperku.",
        author: "Anna Dietetyk",
        date: "2025-06-12",
        tags: ["jajka", "łosoś", "przekąska"],
        diet: "peskatariańska",
        img: "public/jajka_losos.png"
    }
];

function renderRecipes(filter = "", selectedDiet = "") {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = "";

    const filtered = recipes.filter(recipe => {
        const matchesText = recipe.name.toLowerCase().includes(filter) ||
            recipe.desc.toLowerCase().includes(filter) ||
            recipe.tags.some(tag => tag.includes(filter));
        const matchesDiet = selectedDiet === "" || recipe.diet === selectedDiet;
        return matchesText && matchesDiet;
    });

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
                    <span class="recipe-tag">#${recipe.diet}</span>
                </div>
            </div>
        `;
        recipeList.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('searchBox');
    const dietFilter = document.getElementById('dietFilter');

    function updateFilter() {
        const text = searchBox.value.trim().toLowerCase();
        const diet = dietFilter.value;
        renderRecipes(text, diet);
    }

    renderRecipes();
    searchBox.addEventListener('input', updateFilter);
    dietFilter.addEventListener('change', updateFilter);
});
