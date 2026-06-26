const fs = require("fs");

const catalog = require("./catalog/catalog.json");

for (const item of catalog) {

    let score = 0;

    if (item.featured) score += 100;
    if (item.trending) score += 50;
    if (item.popular) score += 30;

    if (item.rating)
        score += Number(item.rating) * 10;

    if (item.poster &&
        !item.poster.includes("placehold.co"))
        score += 40;

    item.score = score;
}

catalog.sort((a, b) => b.score - a.score);

catalog.forEach((m, i) => {
    m.premium = i < 2000;
});

fs.writeFileSync(
    "./catalog/catalog.json",
    JSON.stringify(catalog, null, 2)
);

console.log("✅ Premium titles:",
    catalog.filter(x => x.premium).length);