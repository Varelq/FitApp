const sqlite3 = require('sqlite3').verbose();

const recipes = [
    {
        title: "Owsianka z owocami i orzechami",
        ingredients: "Płatki owsiane gotowane na mleku, z dodatkiem świeżych owoców i orzechów. Idealne śniadanie na dobry początek dnia.",
        instructions: "Gotuj płatki owsiane na mleku, dodaj owoce i orzechy. Podawaj na ciepło z ulubionymi dodatkami.",
        author: "Marek Triceps",
        date: "2025-06-02",
        diet: "wegetariańska",
        img: "public/owsianka.png"
    },
    {
        title: "Zupa krem z dyni",
        ingredients: "Dynia, marchew, mleczko kokosowe, przyprawy.",
        instructions: "Ugotuj dynię i marchew, zmiksuj z mleczkiem kokosowym i przyprawami. Podawaj na ciepło.",
        author: "Anna Dietetyk",
        date: "2025-06-05",
        diet: "wegetariańska",
        img: "public/zupa_dyniowa.png"
    },
    {
        title: "Makaron z pesto i pomidorkami",
        ingredients: "Pełnoziarnisty makaron, pesto bazyliowe, pomidorki koktajlowe, parmezan.",
        instructions: "Ugotuj makaron, wymieszaj z pesto, dodaj pokrojone pomidorki i posyp parmezanem.",
        author: "Kasia Runner",
        date: "2025-06-06",
        diet: "wegetariańska",
        img: "public/makaron_pesto.png"
    },
    {
        title: "Placki z cukinii",
        ingredients: "Cukinia, jajko, mąka owsiana, przyprawy.",
        instructions: "Zetrzyj cukinię, wymieszaj z jajkiem, mąką i przyprawami. Smaż na złoto.",
        author: "Janek Fizjo",
        date: "2025-06-07",
        diet: "wegetariańska",
        img: "public/placki_cukinia.png"
    },
    {
        title: "Sałatka z kurczakiem i awokado",
        ingredients: "Grillowany kurczak, świeże awokado, rukola, pomidorki koktajlowe, oliwa z oliwek.",
        instructions: "Pokrój składniki, wymieszaj z rukolą i oliwą. Podawaj na zimno.",
        author: "Anna Dietetyk",
        date: "2025-06-01",
        diet: "low carb",
        img: "public/kurczak_awokado.png"
    },
    {
        title: "Omlet białkowy z warzywami",
        ingredients: "Białka jaj, szpinak, papryka, cebula.",
        instructions: "Ubij białka, dodaj warzywa, smaż na patelni. Podawaj na ciepło.",
        author: "Janek Fizjo",
        date: "2025-06-04",
        diet: "low carb",
        img: "public/omlet.png"
    },
    {
        title: "Burger bez bułki",
        ingredients: "Mielona wołowina, ser, sałata, pomidor, cebula.",
        instructions: "Uformuj kotlet, usmaż, podawaj zawinięty w liść sałaty z dodatkami.",
        author: "Marek Triceps",
        date: "2025-06-08",
        diet: "low carb",
        img: "public/burger_salata.png"
    },
    {
        title: "Tortilla z jajecznicą i szpinakiem",
        ingredients: "Jajka, szpinak, cebulka, pełnoziarnista tortilla.",
        instructions: "Usmaż jajecznicę ze szpinakiem i cebulką, zawiń w tortillę.",
        author: "Anna Dietetyk",
        date: "2025-06-09",
        diet: "low carb",
        img: "public/tortilla_jajka.png"
    },
    {
        title: "Pieczony łosoś z warzywami",
        ingredients: "Łosoś, brokuły, marchewka, ziemniaki.",
        instructions: "Ułóż łososia z warzywami w naczyniu, piecz do miękkości.",
        author: "Kasia Runner",
        date: "2025-06-03",
        diet: "peskatariańska",
        img: "public/losos.png"
    },
    {
        title: "Sałatka z tuńczykiem i jajkiem",
        ingredients: "Tuńczyk, jajko na twardo, sałata rzymska, oliwki, pomidory.",
        instructions: "Pokrój składniki, wymieszaj z sałatą i oliwkami.",
        author: "Janek Fizjo",
        date: "2025-06-10",
        diet: "peskatariańska",
        img: "public/salatka_tunczyk.png"
    },
    {
        title: "Makrela z warzywami na parze",
        ingredients: "Makrela, brokuł, kalafior, marchew.",
        instructions: "Gotuj makrelę i warzywa na parze do miękkości.",
        author: "Marek Triceps",
        date: "2025-06-11",
        diet: "peskatariańska",
        img: "public/makrela.png"
    },
    {
        title: "Jajka faszerowane łososiem",
        ingredients: "Jajka, wędzony łosoś, koperek.",
        instructions: "Przekrój jajka na pół, wymieszaj żółtka z łososiem i koperkiem, nadziej białka.",
        author: "Anna Dietetyk",
        date: "2025-06-12",
        diet: "peskatariańska",
        img: "public/jajka_losos.png"
    }
];

const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
        process.exit(1);
    }
});

// Ensure the table exists before inserting
db.run(`
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        author TEXT,
        date TEXT,
        diet TEXT,
        image_path TEXT
    )
`, function(err) {
    if (err) {
        console.error('Table creation error:', err.message);
        db.close();
        process.exit(1);
    }

    recipes.forEach(recipe => {
        db.run(
            `INSERT INTO recipes (title, ingredients, instructions, author, date, diet, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                recipe.title,
                recipe.ingredients,
                recipe.instructions,
                recipe.author,
                recipe.date,
                recipe.diet,
                recipe.img
            ],
            function(err) {
                if (err) {
                    console.error('Insert error:', err.message);
                } else {
                    console.log(`Inserted: ${recipe.title}`);
                }
            }
        );
    });

    // Wait a moment to ensure all inserts finish, then close
    setTimeout(() => {
        db.close(() => {
            console.log('Migration complete. Database connection closed.');
        });
    }, 1000);
});
