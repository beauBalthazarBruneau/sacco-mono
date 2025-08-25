export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    bio?: string
    avatar?: string
  }
  publishedAt: string
  updatedAt?: string
  readTime: string
  category: string
  tags: string[]
  image: {
    url: string
    alt: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImage?: string
  }
  featured: boolean
  published: boolean
}

export interface BlogMetadata {
  totalPosts: number
  categories: string[]
  tags: string[]
  lastUpdated: string
}
