import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://f1telemetry.vercel.app/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ]
}