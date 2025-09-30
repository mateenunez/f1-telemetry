import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://f1telemetry.com/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://f1telemetry.com/schedule',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ]
}