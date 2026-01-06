import fs from 'fs';
import path from 'path';

// Routes statiques à inclure dans le sitemap
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/personnages', priority: '0.8', changefreq: 'weekly' },
  { path: '/cycles', priority: '0.8', changefreq: 'weekly' },
  { path: '/joueurs', priority: '0.7', changefreq: 'daily' },
  { path: '/scores', priority: '0.9', changefreq: 'daily' },
  { path: '/podium', priority: '0.8', changefreq: 'daily' },
  { path: '/comparateur', priority: '0.6', changefreq: 'weekly' },
];

const baseUrl = 'https://bbs-schrift.fr';
const today = new Date().toISOString().split('T')[0];

function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Pages principales -->
${staticRoutes.map(route => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
  
  <!-- Note: Les URL dynamiques (personnages individuels, cycles, rotations) 
       peuvent être ajoutées ici si nécessaire -->

</urlset>`;

  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log('✅ Sitemap généré avec succès:', sitemapPath);
}

generateSitemap();
