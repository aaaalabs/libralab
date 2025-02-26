import React from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'LocalBusiness' | 'Product' | 'Article' | 'Event';
  data: any;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export const OrganizationStructuredData: React.FC = () => {
  const organizationData = {
    name: 'LIBRAlab',
    url: 'https://epic.libralab.ai',
    logo: 'https://epic.libralab.ai/libralab_icon_darkmode.svg',
    description: 'LIBRAlab is an AI coliving community near Innsbruck, Austria. 244m² living space with spectacular mountain views for AI researchers, engineers, and entrepreneurs.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Omes',
      addressRegion: 'Tyrol',
      addressCountry: 'Austria',
      postalCode: '6444',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '47.2682',
      longitude: '11.3933',
    },
    sameAs: [
      'https://www.linkedin.com/company/libralabs',
      // Add other social profiles here
    ],
    telephone: '+43-XXX-XXXXXXX', // Replace with actual phone number if available
    email: 'info@libralab.ai', // Replace with actual email if available
    foundingDate: '2023', // Replace with actual founding date
    founder: {
      '@type': 'Person',
      name: 'LIBRAlab Founder', // Replace with actual founder name
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'AI Coliving',
      'Tech Community',
      'Digital Nomads',
      'Hacker House',
    ],
  };

  return <StructuredData type="Organization" data={organizationData} />;
};

export const ColivingSpaceStructuredData: React.FC = () => {
  const colivingData = {
    '@type': 'LodgingBusiness',
    name: 'LIBRAlab AI Coliving Space',
    url: 'https://epic.libralab.ai',
    image: 'https://epic.libralab.ai/libralab_icon_darkmode.svg',
    description: 'LIBRAlab is an AI coliving community near Innsbruck, Austria. 244m² living space with spectacular mountain views for AI researchers, engineers, and entrepreneurs.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Omes',
      addressRegion: 'Tyrol',
      addressCountry: 'Austria',
      postalCode: '6444',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '47.2682',
      longitude: '11.3933',
    },
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Living Space',
        value: '244.13m²',
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Additional Space',
        value: '160.25m²',
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Garden',
        value: '900m²',
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Mountain Views',
        value: 'Yes',
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'WiFi',
        value: 'Yes',
      },
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'AI researchers, engineers, entrepreneurs, and enthusiasts',
    },
  };

  return <StructuredData type="LocalBusiness" data={colivingData} />;
};
