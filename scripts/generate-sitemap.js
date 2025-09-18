const fs = require('fs');

const BASE_URL = 'https://an-gi.io.vn';
const LOCALES = ['en', 'vi'];
const API_DISH = 'https://api.an-gi.io.vn/dish';
const API_INGREDIENT = 'https://api.an-gi.io.vn/ingredient';
const PAGE_SIZE = 9000;


async function fetchAll(apiUrl, key) {
  let page = 1;
  let results = [];
  let total = 0;
  do {
    const url = new URL(apiUrl);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', PAGE_SIZE);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    const data = await res.json();
    const items = data[key] || data.data || [];
    total = data.total || items.length;
    results = results.concat(items);
    page++;
  } while (results.length < total);
  return results;
}

(async () => {
  // Fetch dishes
  const dishes = await fetchAll(API_DISH, 'dishes');
  console.log(`Fetched ${dishes.length} dishes`);
  // Fetch ingredients
  const ingredients = await fetchAll(API_INGREDIENT, 'ingredients');

  // Static routes (without locale)
  const staticRoutes = [
    { path: '', priority: 1.0 },
    { path: 'dish', priority: 0.7 },
    { path: 'ingredient', priority: 0.7 },
    { path: 'game/wheel-of-fortune', priority: 0.9 },
    { path: 'game/flipping-card', priority: 0.9 },
    { path: 'game/voting/create', priority: 0.9 },
    // Add more static routes as needed
  ];

  // Start with all static routes for each locale
  let urls = [];
  for (const locale of LOCALES) {
    staticRoutes.forEach(route => {
      urls.push({
        loc: `${BASE_URL}/${locale}${route.path ? '/' + route.path : ''}`,
        priority: route.priority
      });
    });
  }

  // Add dynamic dish URLs for each locale
  for (const locale of LOCALES) {
    dishes.forEach(dish => {
      if (dish.slug) {
        urls.push({ loc: `${BASE_URL}/${locale}/dish/${dish.slug}`, priority: 1 });
      } else if (dish._id) {
        urls.push({ loc: `${BASE_URL}/${locale}/dish/${dish._id}`, priority: 1 });
      }
    });
    // Add dynamic ingredient URLs for each locale
    ingredients.forEach(ingredient => {
      if (ingredient.slug) {
        urls.push({ loc: `${BASE_URL}/${locale}/ingredient/${ingredient.slug}`, priority: 0.7 });
      } else if (ingredient._id) {
        urls.push({ loc: `${BASE_URL}/${locale}/ingredient/${ingredient._id}`, priority: 0.7 });
      }
    });
  }

  // Build XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
    '\n</urlset>\n';

  // Write to public/sitemap.xml
  fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
  console.log('Sitemap generated: public/sitemap.xml');
})();
