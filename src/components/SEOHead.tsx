import { Helmet } from 'react-helmet-async';

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
  keywords = "Bleach Brave Souls, BBS, guildes, scores, classement, rotation, cycle, Schrift",
  image = "https://bbs-schrift.fr/logo.png",
  url = "https://bbs-schrift.fr",
  type = "website",
  structuredData
}: SEOHeadProps) => {
  return (
    <Helmet>
      {/* Title */}
      <title>{title}</title>
      
      {/* Basic meta tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={title} />
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