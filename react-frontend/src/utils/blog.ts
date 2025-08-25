import type { BlogPost, BlogMetadata } from '../types/blog'

// Import all blog post JSON files
import draftGuideData from '../data/blog/ultimate-2024-fantasy-football-draft-strategy-guide.json'
import aiAnalysisData from '../data/blog/ai-vs-traditional-analysis-data-beats-gut-feelings.json'
import waiverWireData from '../data/blog/waiver-wire-gold-find-hidden-gems-every-week.json'
import championshipData from '../data/blog/championship-week-advanced-lineup-optimization-strategies.json'
import tradeAnalyzerData from '../data/blog/trade-analyzer-making-deals-that-win-championships.json'
import metadataData from '../data/blog/metadata.json'

// Type assertion for imported JSON data
const blogPosts: BlogPost[] = [
  draftGuideData as BlogPost,
  aiAnalysisData as BlogPost,
  waiverWireData as BlogPost,
  championshipData as BlogPost,
  tradeAnalyzerData as BlogPost
]

const metadata: BlogMetadata = metadataData as BlogMetadata

/**
 * Get all published blog posts, sorted by publication date (newest first)
 */
export const getAllBlogPosts = (): BlogPost[] => {
  return blogPosts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/**
 * Get a blog post by its slug
 */
export const getBlogPostBySlug = (slug: string): BlogPost | null => {
  return blogPosts.find(post => post.slug === slug && post.published) || null
}

/**
 * Get featured blog posts
 */
export const getFeaturedBlogPosts = (): BlogPost[] => {
  return blogPosts
    .filter(post => post.published && post.featured)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/**
 * Get blog posts by category
 */
export const getBlogPostsByCategory = (category: string): BlogPost[] => {
  return blogPosts
    .filter(post => post.published && post.category === category)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/**
 * Get blog posts by tag
 */
export const getBlogPostsByTag = (tag: string): BlogPost[] => {
  return blogPosts
    .filter(post => post.published && post.tags.includes(tag))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/**
 * Get recent blog posts (default: last 3 posts)
 */
export const getRecentBlogPosts = (limit: number = 3): BlogPost[] => {
  return getAllBlogPosts().slice(0, limit)
}

/**
 * Get related blog posts based on tags and category
 */
export const getRelatedBlogPosts = (currentPost: BlogPost, limit: number = 3): BlogPost[] => {
  const related = blogPosts
    .filter(post => 
      post.published && 
      post.id !== currentPost.id && 
      (post.category === currentPost.category || 
       post.tags.some(tag => currentPost.tags.includes(tag)))
    )
    .sort((a, b) => {
      // Sort by relevance (category match first, then tag matches)
      const aRelevance = (a.category === currentPost.category ? 2 : 0) + 
                        a.tags.filter(tag => currentPost.tags.includes(tag)).length
      const bRelevance = (b.category === currentPost.category ? 2 : 0) + 
                        b.tags.filter(tag => currentPost.tags.includes(tag)).length
      return bRelevance - aRelevance
    })
  
  return related.slice(0, limit)
}

/**
 * Get blog metadata
 */
export const getBlogMetadata = (): BlogMetadata => {
  return metadata
}

/**
 * Get all unique categories
 */
export const getAllCategories = (): string[] => {
  return metadata.categories
}

/**
 * Get all unique tags
 */
export const getAllTags = (): string[] => {
  return metadata.tags
}

/**
 * Search blog posts by title, excerpt, or content
 */
export const searchBlogPosts = (query: string): BlogPost[] => {
  const lowercaseQuery = query.toLowerCase()
  
  return blogPosts
    .filter(post => 
      post.published && 
      (post.title.toLowerCase().includes(lowercaseQuery) ||
       post.excerpt.toLowerCase().includes(lowercaseQuery) ||
       post.content.toLowerCase().includes(lowercaseQuery) ||
       post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
       post.category.toLowerCase().includes(lowercaseQuery))
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/**
 * Generate blog post URL
 */
export const getBlogPostUrl = (slug: string): string => {
  return `/blog/${slug}`
}

/**
 * Get blog posts for sitemap generation
 */
export const getBlogPostsForSitemap = (): Array<{url: string, lastModified: string}> => {
  return blogPosts
    .filter(post => post.published)
    .map(post => ({
      url: getBlogPostUrl(post.slug),
      lastModified: post.updatedAt || post.publishedAt
    }))
}
