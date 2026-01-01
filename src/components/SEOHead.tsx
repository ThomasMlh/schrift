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
}

export const SEOHead = ({
  title = "Schrift - Guildes et Scores Bleach Brave Souls",
  description = "Plateforme de gestion des guildes et scores pour Bleach Brave Souls. Suivez vos rotations, cycles et classements de guilde.",
  keywords = "",
  image = "https://bbs-schrift.fr/logo.png",
  url = "https://bbs-schrift.fr",
  type = "website",
  structuredData
}: SEOHeadProps) => {
  // Keywords génériques appliqués à toutes les pages
  const baseKeywords = "Bleach Brave Souls, BBS, Schrift, guildes, scores, BBS-Schrift, BBS Schrift";
  
  // Combine les keywords de base avec les keywords spécifiques de la page
  const allKeywords = keywords 
    ? `${baseKeywords}, ${keywords}` 
    : baseKeywords;
  
  // Force la mise à jour du titre lors des changements de route
  useEffect(() => {
    document.title = title;
  }, [title]);
  
  return (
    <Helmet key={url} prioritizeSeoTags defer={false}>
      {/* Title */}
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      
      {/* Basic meta tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};