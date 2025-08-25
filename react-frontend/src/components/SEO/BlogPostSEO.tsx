import React from 'react'
import { Helmet } from 'react-helmet-async'
import type { BlogPost } from '../../types/blog'

interface BlogPostSEOProps {
  post: BlogPost
  baseUrl?: string
}

export const BlogPostSEO: React.FC<BlogPostSEOProps> = ({ 
  post, 
  baseUrl = 'https://sacco.ai' 
}) => {
  const postUrl = `${baseUrl}/blog/${post.slug}`
  const imageUrl = post.seo.ogImage || post.image.url
  
  // Generate structured data for the blog post
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

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{post.seo.metaTitle}</title>
      <meta name="description" content={post.seo.metaDescription} />
      <meta name="keywords" content={post.seo.keywords.join(', ')} />
      <meta name="author" content={post.author.name} />
      <link rel="canonical" href={postUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.seo.metaTitle} />
      <meta property="og:description" content={post.seo.metaDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={postUrl} />
      <meta property="og:site_name" content="Sacco - AI Fantasy Football" />
      <meta property="article:author" content={post.author.name} />
      <meta property="article:published_time" content={post.publishedAt} />
      <meta property="article:modified_time" content={post.updatedAt || post.publishedAt} />
      <meta property="article:section" content={post.category} />
      {post.tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}\n      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.seo.metaTitle} />
      <meta name="twitter:description" content={post.seo.metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@SaccoAI" />
      <meta name="twitter:creator" content="@SaccoAI" />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta property="og:locale" content="en_US" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}
