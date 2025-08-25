#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple sitemap generation for build time
const generateSitemap = () => {
  const baseUrl = 'https://sacco.ai'
  const now = new Date().toISOString()
  
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/signup', priority: '0.8', changefreq: 'monthly' },
    { url: '/players', priority: '0.9', changefreq: 'weekly' }
  ]

  const blogPosts = [
    { slug: 'ultimate-2024-fantasy-football-draft-strategy-guide', lastmod: '2024-08-20T10:00:00Z' },
    { slug: 'ai-vs-traditional-analysis-data-beats-gut-feelings', lastmod: '2024-08-18T09:00:00Z' },
    { slug: 'waiver-wire-gold-find-hidden-gems-every-week', lastmod: '2024-08-15T08:00:00Z' },
    { slug: 'championship-week-advanced-lineup-optimization-strategies', lastmod: '2024-08-12T07:00:00Z' },
    { slug: 'trade-analyzer-making-deals-that-win-championships', lastmod: '2024-08-10T06:00:00Z' }
  ]

  const staticUrls = staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')

  const blogUrls = blogPosts.map(post => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls}
</urlset>`

  const publicDir = path.join(__dirname, '..', 'public')
  const sitemapPath = path.join(publicDir, 'sitemap.xml')
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  fs.writeFileSync(sitemapPath, sitemap)
  console.log('✅ Sitemap generated successfully!')
}

// Run the generator
generateSitemap()
