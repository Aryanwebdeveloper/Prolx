import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://prolx.cloud'
  
  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/portfolio',
    '/contact',
    '/pricing',
    '/careers',
    '/blog',
    '/faqs',
    '/team',
    '/support',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Dynamic Blog routes
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'Published')

    if (posts) {
      blogRoutes = posts.map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch (e) {
    console.error('Error generating blog sitemap:', e)
  }

  // Dynamic Portfolio routes (Case Studies)
  let portfolioRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('slug, updated_at, created_at')

    if (projects) {
      portfolioRoutes = projects.map((project: any) => ({
        url: `${baseUrl}/portfolio/${project.slug}`,
        lastModified: new Date(project.updated_at || project.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }
  } catch (e) {
    console.error('Error generating portfolio sitemap:', e)
  }

  return [...staticRoutes, ...blogRoutes, ...portfolioRoutes]
}
