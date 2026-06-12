'use client';

import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  structuredData?: object;
  noIndex?: boolean;
}

export const SEOHead = ({
  title = "Schrift - Guildes et Scores Bleach Brave Souls",
  description = "Plateforme de gestion des guildes et scores pour Bleach Brave Souls. Suivez vos rotations, cycles et classements de guilde.",
  keywords = "",
  image = "https://bbs-schrift.fr/android-chrome-512x512.png",
  url = "https://bbs-schrift.fr",
  type = "website",
  structuredData,
  noIndex = false,
}: SEOHeadProps) => {
  const baseKeywords = "Bleach Brave Souls, BBS, Schrift, guildes, scores, BBS-Schrift, BBS Schrift";
  const allKeywords = keywords ? `${baseKeywords}, ${keywords}` : baseKeywords;

  useEffect(() => {
    document.title = title;

    const setMeta = (nameAttr: string, nameValue: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${nameAttr}="${nameValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, nameValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', allKeywords);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    if (noIndex) setMeta('name', 'robots', 'noindex, nofollow');

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    if (structuredData) {
      let script = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, allKeywords, image, url, type, noIndex, structuredData]);

  return null;
};
