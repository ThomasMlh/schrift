import { Helmet } from 'react-helmet-async';
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
  noIndex = false
}: SEOHeadProps) => {
  // Generic keywords applied to every page
  const baseKeywords = "Bleach Brave Souls, BBS, Schrift, guildes, scores, BBS-Schrift, BBS Schrift";
  
  const allKeywords = keywords 
    ? `${baseKeywords}, ${keywords}` 
    : baseKeywords;
  
  // Force the title update on route changes
  useEffect(() => {
    document.title = title;
  }, [title]);
  
  return (
    <Helmet key={url} prioritizeSeoTags defer={false}>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      <meta property="og:type" content={type} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      <link rel="canonical" href={url} />
      
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};