import { getBlogPostsForSitemap } from './blog'

interface SitemapUrl {
  url: string
  lastModified: string
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/**
 * Generate XML sitemap for the entire site
 */
export const generateSitemap = (baseUrl: string = 'https://sacco.ai'): string => {
  const staticPages: SitemapUrl[] = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFreq: 'weekly',
      priority: 1.0
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date().toISOString(),
      changeFreq: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/players`,
      lastModified: new Date().toISOString(),
      changeFreq: 'weekly',
      priority: 0.9
    }
  ]

  // Get blog post URLs
  const blogUrls: SitemapUrl[] = getBlogPostsForSitemap().map(post => ({
    url: `${baseUrl}${post.url}`,
    lastModified: post.lastModified,
    changeFreq: 'monthly',
    priority: 0.7
  }))

  // Combine all URLs
  const allUrls = [...staticPages, ...blogUrls]

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified}</lastmod>
    <changefreq>${url.changeFreq || 'monthly'}</changefreq>
    <priority>${url.priority || 0.5}</priority>
  </url>`).join('\n')}
</urlset>`

  return xml
}

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = (baseUrl: string = 'https://sacco.ai'): string => {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and auth paths
Disallow: /auth/
Disallow: /admin/
Disallow: /api/

# Allow blog content
Allow: /blog/`
}

/**
 * Save sitemap to public directory (for build process)
 */
export const saveSitemap = (baseUrl: string = 'https://sacco.ai'): void => {
  if (typeof window !== 'undefined') {
    console.warn('Sitemap generation should only run on the server side during build')
    return
  }
  
  // This would be used during the build process
  const sitemap = generateSitemap(baseUrl)
  const robots = generateRobotsTxt(baseUrl)
  
  // In a real implementation, this would write to the public directory
  console.log('Generated sitemap:', sitemap)
  console.log('Generated robots.txt:', robots)
}
