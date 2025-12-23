import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // --- URLs para la versión en español (/es/) ---
    {
      url: 'https://www.f1telemetry.com/es',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://www.f1telemetry.com/es/schedule',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://www.f1telemetry.com/es/live-timing',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }

    // --- URLs para la versión en inglés (/en/) ---
    {
      url: 'https://www.f1telemetry.com/en',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://www.f1telemetry.com/en/schedule',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://www.f1telemetry.com/en/live-timing',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }
  ];
}