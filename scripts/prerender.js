import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Routes à prérender avec leurs métadonnées SEO et contenu statique
const routes = [
  {
    path: 'index.html',
    title: 'Schrift BBS - Guildes Bleach Brave Souls',
    description: 'Découvrez les guildes Schrift A, B, C et D pour Bleach Brave Souls. Rejoignez notre communauté et participez aux classements et rotations.',
    keywords: 'Bleach Brave Souls, BBS, guildes, Schrift, communauté, classement, Schrift',
    content: `
      <h1>Bienvenue sur Schrift BBS</h1>
      <p>Plateforme officielle de gestion des guildes Schrift pour Bleach Brave Souls. Consultez les scores, les rotations, et le classement des meilleurs joueurs.</p>
      <ul>
        <li><a href="/personnages">Personnages de BBS</a> - Base de données complète</li>
        <li><a href="/cycles">Cycles et Rotations</a> - Planning des guildes</li>
        <li><a href="/joueurs">Joueurs</a> - Profils et statistiques</li>
        <li><a href="/scores">Scores</a> - Tableau des classements</li>
        <li><a href="/podium">Podium</a> - Top joueurs</li>
        <li><a href="/comparateur">Comparateur</a> - Comparez les personnages</li>
      </ul>
      <p>Guildes: Schrift A, Schrift B, Schrift C, Schrift D</p>
    `
  },
  {
    path: 'personnages/index.html',
    title: 'Personnages BBS - Schrift',
    description: 'Liste complète des personnages de Bleach Brave Souls avec leurs statistiques, affinités et types d\'attaque.',
    keywords: 'Bleach Brave Souls, personnages, characters, BBS, stats, affinité',
    content: `
      <h1>Personnages Bleach Brave Souls</h1>
      <p>Découvrez la liste complète des personnages de Bleach Brave Souls disponibles dans l'application Schrift.</p>
      <h2>Caractéristiques des personnages</h2>
      <ul>
        <li><strong>Affinité</strong>: Mind, Power, Speed, Heart, Tech</li>
        <li><strong>Type d'attaque</strong>: Melee, Ranged</li>
        <li><strong>Catégorie</strong>: No Affiliation, Hollow, Soul Reaper, Arrancar, Human</li>
        <li><strong>Killer</strong>: Bonus de dégâts contre certains types</li>
      </ul>
      <p>Filtrez et recherchez parmi des centaines de personnages pour optimiser vos équipes de guilde.</p>
      <a href="/">Retour à l'accueil</a>
    `
  },
  {
    path: 'cycles/index.html',
    title: 'Cycles de Guilde - Schrift BBS',
    description: 'Consultez tous les cycles de guilde, les rotations et les classements pour Bleach Brave Souls.',
    keywords: 'Bleach Brave Souls, cycles, rotation, guilde, classement',
    content: `
      <h1>Cycles de Guilde Schrift</h1>
      <p>Gérez et consultez les cycles de Guild Quest pour les guildes Schrift de Bleach Brave Souls.</p>
      <h2>Qu'est-ce qu'un cycle ?</h2>
      <p>Un cycle de guilde représente une période de quêtes de guilde avec des rotations spécifiques (affichages, killers, types d'attaque).</p>
      <h3>Fonctionnalités</h3>
      <ul>
        <li>Historique complet des cycles</li>
        <li>Rotations planifiées (A, B, C, S, SS)</li>
        <li>Classements des scores par cycle</li>
        <li>Stratégies et compositions d'équipe</li>
      </ul>
      <p><a href="/">Retour à l'accueil</a> | <a href="/scores">Voir les scores</a></p>
    `
  },
  {
    path: 'joueurs/index.html',
    title: 'Joueurs - Schrift BBS',
    description: 'Liste des joueurs des guildes Schrift pour Bleach Brave Souls. Consultez les profils et statistiques.',
    keywords: 'Bleach Brave Souls, joueurs, players, profil, stats',
    content: `
      <h1>Joueurs des Guildes Schrift</h1>
      <p>Découvrez les membres des guildes Schrift A, B, C et D pour Bleach Brave Souls.</p>
      <h2>Profils des joueurs</h2>
      <p>Chaque profil de joueur contient :</p>
      <ul>
        <li>Historique des scores</li>
        <li>Guilde d'appartenance</li>
        <li>Statistiques de performance</li>
        <li>Classement dans la guilde</li>
        <li>Participation aux cycles</li>
      </ul>
      <p>Filtrez par guilde : Schrift A, Schrift B, Schrift C, Schrift D</p>
      <a href="/">Retour à l'accueil</a> | <a href="/podium">Voir le podium</a>
    `
  },
  {
    path: 'scores/index.html',
    title: 'Scores et Classements - Schrift BBS',
    description: 'Tableau des scores et classements des joueurs pour les guildes Schrift de Bleach Brave Souls.',
    keywords: 'Bleach Brave Souls, scores, classement, ranking, leaderboard',
    content: `
      <h1>Scores et Classements BBS</h1>
      <p>Tableau complet des scores de Guild Quest pour les guildes Schrift de Bleach Brave Souls.</p>
      <h2>Comment fonctionnent les scores ?</h2>
      <p>Les scores sont enregistrés pour chaque rotation de Guild Quest et permettent de :</p>
      <ul>
        <li>Suivre les performances individuelles</li>
        <li>Comparer les joueurs entre guildes</li>
        <li>Identifier les meilleurs scores par rotation</li>
        <li>Analyser les stratégies gagnantes</li>
      </ul>
      <h3>Guildes Schrift</h3>
      <p>Schrift A • Schrift B • Schrift C • Schrift D</p>
      <a href="/">Retour à l'accueil</a> | <a href="/cycles">Voir les cycles</a>
    `
  },
  {
    path: 'podium/index.html',
    title: 'Podium - Meilleurs Scores BBS',
    description: 'Podium des meilleurs scores et joueurs des guildes Schrift pour Bleach Brave Souls.',
    keywords: 'Bleach Brave Souls, podium, top scores, meilleurs joueurs',
    content: `
      <h1>Podium des Meilleurs Joueurs BBS</h1>
      <p>Classement des meilleurs scores réalisés dans les Guild Quests de Bleach Brave Souls par les membres des guildes Schrift.</p>
      <h2>Top Joueurs</h2>
      <p>Découvrez qui domine les classements :</p>
      <ul>
        <li><strong>Par cycle</strong> - Les champions de chaque période</li>
        <li><strong>Par rotation</strong> - Maîtres des rotations spécifiques</li>
        <li><strong>Par guilde</strong> - Comparaison Schrift A, B, C, D</li>
        <li><strong>Records absolus</strong> - Les scores légendaires</li>
      </ul>
      <p>Rejoignez une guilde Schrift et défiez les meilleurs joueurs de la communauté Bleach Brave Souls !</p>
      <a href="/">Retour à l'accueil</a> | <a href="/joueurs">Voir les joueurs</a>
    `
  },
  {
    path: 'comparateur/index.html',
    title: 'Comparateur de Personnages - Schrift BBS',
    description: 'Comparez les statistiques et capacités des personnages de Bleach Brave Souls.',
    keywords: 'Bleach Brave Souls, comparateur, compare, personnages, stats',
    content: `
      <h1>Comparateur de Personnages BBS</h1>
      <p>Outil de comparaison des personnages de Bleach Brave Souls pour optimiser vos équipes de Guild Quest.</p>
      <h2>Fonctionnalités</h2>
      <ul>
        <li>Comparez jusqu'à plusieurs personnages côte à côte</li>
        <li>Analysez les affinités : Mind, Power, Speed, Heart, Tech</li>
        <li>Évaluez les types d'attaque : Melee vs Ranged</li>
        <li>Identifiez les killers optimaux pour chaque rotation</li>
        <li>Planifiez vos équipes selon les attributs requis</li>
      </ul>
      <h3>Critères de comparaison</h3>
      <p>Affinité • Type d'attaque • Catégorie • Killer • Statistiques</p>
      <p>Maximisez vos scores de guilde en choisissant les meilleurs personnages pour chaque situation.</p>
      <a href="/">Retour à l'accueil</a> | <a href="/personnages">Voir tous les personnages</a>
    `
  },
  {
    path: 'guides/index.html',
    title: 'Guides BBS - Schrift',
    description: 'Guides et astuces pour Bleach Brave Souls : farming d\'orbes, rotations, builds et stratégies.',
    keywords: 'Bleach Brave Souls, guides, orbes, farming, rotation, builds, astuces',
    content: `
      <h1>Guides Bleach Brave Souls</h1>
      <p>Découvrez nos guides complets pour optimiser votre expérience sur Bleach Brave Souls.</p>
      <h2>Guides disponibles</h2>
      <ul>
        <li><strong>Guide des Orbes</strong> - Comment farmer efficacement les orbes spirituels</li>
        <li><strong>Guide des Rotations</strong> - Stratégies et compositions d'équipe pour Guild Quest</li>
        <li><strong>Guide des Builds</strong> - Optimisation des personnages et accessoires</li>
      </ul>
      <h3>Sources d'orbes</h3>
      <p>Maximisez vos gains d'orbes grâce à nos conseils sur :</p>
      <ul>
        <li>Guild Quest et classements</li>
        <li>Tour Senkaimon</li>
        <li>Epic Raid (EAP)</li>
        <li>Résurrections</li>
        <li>Brave Bonus</li>
        <li>Arène PvP</li>
        <li>Raids et événements quotidiens</li>
      </ul>
      <p>Rejoignez les guildes Schrift et améliorez vos performances dans Bleach Brave Souls !</p>
      <a href="/">Retour à l'accueil</a> | <a href="/cycles">Voir les cycles</a>
    `
  },
];

function generatePrerenderedHTML(route) {
  // Lire le template HTML de base
  const templatePath = join(__dirname, '..', 'dist', 'index.html');
  let html = readFileSync(templatePath, 'utf-8');

  // Remplacer les métadonnées SEO principales
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${route.title}</title>`
  );

  html = html.replace(
    /<meta name="description" content="[^"]*"[^>]*>/,
    `<meta name="description" content="${route.description}">`
  );

  html = html.replace(
    /<meta name="keywords" content="[^"]*"[^>]*>/,
    `<meta name="keywords" content="${route.keywords}">`
  );

  // Mettre à jour Open Graph
  html = html.replace(
    /<meta property="og:title" content="[^"]*"[^>]*>/,
    `<meta property="og:title" content="${route.title}">`
  );

  html = html.replace(
    /<meta property="og:description" content="[^"]*"[^>]*>/,
    `<meta property="og:description" content="${route.description}">`
  );

  const url = route.path === 'index.html' 
    ? 'https://bbs-schrift.fr' 
    : `https://bbs-schrift.fr/${route.path.replace('/index.html', '')}`;
  
  html = html.replace(
    /<meta property="og:url" content="[^"]*"[^>]*>/,
    `<meta property="og:url" content="${url}">`
  );

  // Mettre à jour Twitter
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"[^>]*>/,
    `<meta name="twitter:title" content="${route.title}">`
  );

  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"[^>]*>/,
    `<meta name="twitter:description" content="${route.description}">`
  );

  // Mettre à jour canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*"[^>]*>/,
    `<link rel="canonical" href="${url}">`
  );

  // Ajouter un indicateur pour le prerendering
  html = html.replace(
    '</head>',
    '  <meta name="prerender-status-code" content="200">\n  </head>'
  );

  return html;
}

function prerender() {
  console.log('🚀 Démarrage du prerendering...\n');

  routes.forEach((route) => {
    try {
      const html = generatePrerenderedHTML(route);
      const outputPath = join(__dirname, '..', 'dist', route.path);
      
      // Créer le dossier si nécessaire
      mkdirSync(dirname(outputPath), { recursive: true });
      
      // Écrire le fichier
      writeFileSync(outputPath, html, 'utf-8');
      
      console.log(`✅ Généré: ${route.path}`);
    } catch (error) {
      console.error(`❌ Erreur pour ${route.path}:`, error.message);
    }
  });

  console.log('\n✨ Prerendering terminé !');
}

prerender();
