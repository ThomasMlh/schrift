// Configuration SEO centralisée
export const siteConfig = {
  name: "Schrift BBS",
  description: "Plateforme de gestion des guildes et scores pour Bleach Brave Souls",
  url: "https://bbs-schrift.fr",
  ogImage: "https://bbs-schrift.fr/logo.png",
  links: {
    twitter: "",
    github: "",
    discord: ""
  }
};

export const generatePageTitle = (pageTitle: string) => {
  return `${pageTitle} | ${siteConfig.name}`;
};

export const generatePageUrl = (path: string) => {
  return `${siteConfig.url}${path}`;
};