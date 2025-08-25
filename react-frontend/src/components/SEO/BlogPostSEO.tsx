import React, { useEffect } from 'react'
import type { BlogPost } from '../../types/blog'

interface BlogPostSEOProps {
  post: BlogPost
  baseUrl?: string
}

const setMetaTag = (name: string, content: string, property?: boolean) => {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let meta = document.querySelector(selector) as HTMLMetaElement
  
  if (!meta) {
    meta = document.createElement('meta')
    if (property) {
      meta.setAttribute('property', name)
    } else {
      meta.setAttribute('name', name)
    }
    document.head.appendChild(meta)
  }
  
  meta.setAttribute('content', content)
}

const setLinkTag = (rel: string, href: string) => {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
  
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    document.head.appendChild(link)
  }
  
  link.setAttribute('href', href)
}

const setStructuredData = (data: object) => {
  let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement
  
  if (!script) {
    script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }
  
  script.textContent = JSON.stringify(data)
}

export const BlogPostSEO: React.FC<BlogPostSEOProps> = ({ 
  post, 
  baseUrl = 'https://sacco.ai' 
}) => {
  useEffect(() => {
    const postUrl = `${baseUrl}/blog/${post.slug}`
    const imageUrl = post.seo.ogImage || post.image.url
    
    // Set document title
    document.title = post.seo.metaTitle
    
    // Basic meta tags
    setMetaTag('description', post.seo.metaDescription)
    setMetaTag('keywords', post.seo.keywords.join(', '))
    setMetaTag('author', post.author.name)
    setMetaTag('robots', 'index, follow')
    setMetaTag('googlebot', 'index, follow')
    
    // Open Graph tags
    setMetaTag('og:type', 'article', true)
    setMetaTag('og:title', post.seo.metaTitle, true)
    setMetaTag('og:description', post.seo.metaDescription, true)
    setMetaTag('og:image', imageUrl, true)
    setMetaTag('og:url', postUrl, true)
    setMetaTag('og:site_name', 'Sacco - AI Fantasy Football', true)
    setMetaTag('og:locale', 'en_US', true)
    setMetaTag('article:author', post.author.name, true)
    setMetaTag('article:published_time', post.publishedAt, true)
    setMetaTag('article:modified_time', post.updatedAt || post.publishedAt, true)
    setMetaTag('article:section', post.category, true)
    
    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', post.seo.metaTitle)
    setMetaTag('twitter:description', post.seo.metaDescription)
    setMetaTag('twitter:image', imageUrl)
    setMetaTag('twitter:site', '@SaccoAI')
    setMetaTag('twitter:creator', '@SaccoAI')
    
    // Canonical link
    setLinkTag('canonical', postUrl)
    
    // Structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": imageUrl,
      "author": {
        "@type": "Person",
        "name": post.author.name,
        "description": post.author.bio
      },
      "publisher": {
        "@type": "Organization",
        "name": "Sacco",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt || post.publishedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": postUrl
      },
      "articleSection": post.category,
      "keywords": post.seo.keywords.join(", "),
      "wordCount": post.content.split(' ').length,
      "timeRequired": post.readTime,
      "articleBody": post.content
    }
    
    setStructuredData(structuredData)
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Sacco - AI-Powered Fantasy Football Draft Assistant | Win Your League'
    }
  }, [post, baseUrl])

  return null // This component only manages head elements
}
