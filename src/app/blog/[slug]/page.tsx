import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectToDatabase, getSeedData } from '@/lib/db';
import Blog from '@/lib/models/Blog';
import { buildArticleJsonLd, buildArticleMetadata } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import BlogArticleClient from './BlogArticleClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;

  try {
    await connectToDatabase();
    const blog = await Blog.findOne({ slug, status: 'published' }).lean().exec();

    if (!blog) {
      const seedData = getSeedData();
      const fallbackBlog = Array.isArray(seedData?.blogs)
        ? seedData.blogs.find((entry: any) => entry.slug === slug)
        : null;

      if (!fallbackBlog) {
        return {
          title: 'Article not found',
          description: 'The requested article could not be found.',
          robots: {
            index: false,
            follow: false,
          },
        };
      }

      return buildArticleMetadata({
        title: fallbackBlog.seoTitle || fallbackBlog.title || 'Article',
        description: fallbackBlog.metaDescription || fallbackBlog.excerpt || 'Read this article on World Now.',
        url: `${SITE_URL}/blog/${slug}`,
        image: fallbackBlog.featuredImage || fallbackBlog.ogImage || null,
        publishedTime: fallbackBlog.createdAt || null,
        modifiedTime: fallbackBlog.updatedAt || fallbackBlog.createdAt || null,
        author: fallbackBlog.author || 'World Now',
        tags: Array.isArray(fallbackBlog.tags) ? fallbackBlog.tags : [],
      });
    }

    return buildArticleMetadata({
      title: blog.seoTitle || blog.title || 'Article',
      description: blog.metaDescription || blog.excerpt || 'Read this article on World Now.',
      url: `${SITE_URL}/blog/${slug}`,
      image: blog.featuredImage || blog.ogImage || null,
      publishedTime: blog.createdAt || null,
      modifiedTime: blog.updatedAt || blog.createdAt || null,
      author: blog.author || 'World Now',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
    });
  } catch (error) {
    console.error('Metadata generation failed:', error);
    return {
      title: 'Article',
      description: 'Read this article on World Now.',
    };
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  let blog: any = null;

  try {
    await connectToDatabase();
    blog = await Blog.findOne({ slug, status: 'published' }).lean().exec();

    if (!blog) {
      const seedData = getSeedData();
      const fallbackBlog = Array.isArray(seedData?.blogs)
        ? seedData.blogs.find((entry: any) => entry.slug === slug)
        : null;

      if (!fallbackBlog) {
        notFound();
      }

      blog = fallbackBlog;
    }
  } catch (error) {
    console.error('Article page load failed:', error);
  }

  const jsonLd = buildArticleJsonLd({
    title: blog?.seoTitle || blog?.title || 'Article',
    description: blog?.metaDescription || blog?.excerpt || 'Read this article on World Now.',
    url: `${SITE_URL}/blog/${slug}`,
    image: blog?.featuredImage || blog?.ogImage || null,
    publishedTime: blog?.createdAt || null,
    modifiedTime: blog?.updatedAt || blog?.createdAt || null,
    author: blog?.author || 'World Now',
    tags: Array.isArray(blog?.tags) ? blog.tags : [],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogArticleClient />
    </>
  );
}
