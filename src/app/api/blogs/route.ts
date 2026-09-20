import { connectToDatabase, getSeedData } from '@/lib/db';
import Blog from '@/lib/models/Blog';

function matchesCategory(blog: any, category: string) {
  const categories = Array.isArray(blog.categories) ? blog.categories : [blog.category].filter(Boolean);
  return categories.some((item: string) => item.toLowerCase() === category.toLowerCase());
}

function matchesRegion(blog: any, region: string) {
  const regionValues = [blog.region, blog.location]
    .filter(Boolean)
    .map((value: string) => value.toLowerCase());

  return regionValues.some((value: string) => value === region.toLowerCase() || value.includes(region.toLowerCase()));
}

function filterBlogs(blogs: any[], category?: string | null, search?: string | null, status: string = 'published', region?: string | null) {
  return blogs
    .filter((blog) => (status ? blog.status === status : true))
    .filter((blog) => (!category ? true : matchesCategory(blog, category) || blog.category?.toLowerCase() === category.toLowerCase()))
    .filter((blog) => (!region ? true : matchesRegion(blog, region)))
    .filter((blog) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const searchableValues = [
        blog.title,
        blog.seoTitle,
        blog.metaDescription,
        blog.content,
        blog.excerpt,
        blog.location,
        ...(Array.isArray(blog.tags) ? blog.tags : []),
      ].filter(Boolean);

      return searchableValues.some((value: string) => value.toLowerCase().includes(q));
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'published';
    const rawLimit = Number(searchParams.get('limit') || '24');
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 60) : 24;
    const rawOffset = Number(searchParams.get('offset') || '0');
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    await connectToDatabase();

    const filters: any[] = [{ status }];

    if (category) {
      const categoryRegex = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      filters.push({
        $or: [
          { categories: categoryRegex },
          { category: categoryRegex }
        ]
      });
    }

    if (region) {
      const regionRegex = new RegExp(`^${region.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      filters.push({
        $or: [
          { region: regionRegex },
          { location: regionRegex }
        ]
      });
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filters.push({
        $or: [
          { title: searchRegex },
          { seoTitle: searchRegex },
          { metaDescription: searchRegex },
          { content: searchRegex },
          { excerpt: searchRegex },
          { location: searchRegex },
          { tags: searchRegex }
        ]
      });
    }

    const query = filters.length > 1 ? { $and: filters } : filters[0];

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .select('-content')
      .skip(offset)
      .limit(limit + 1)
      .lean();

    const hasMore = blogs.length > limit;
    const page = hasMore ? blogs.slice(0, limit) : blogs;

    return Response.json(page, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Has-More': String(hasMore),
      },
    });
  } catch (error: any) {
    const seedData = getSeedData();
    if (seedData?.blogs) {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const region = searchParams.get('region');
      const search = searchParams.get('search');
      const status = searchParams.get('status') || 'published';
      const rawLimit = Number(searchParams.get('limit') || '24');
      const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 60) : 24;
      const rawOffset = Number(searchParams.get('offset') || '0');
      const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

      const filteredBlogs = filterBlogs(seedData.blogs, category, search, status, region);
      const fallbackBlogs = filteredBlogs
        .slice(offset, offset + limit)
        .map(({ content: _content, ...blog }) => blog);
      return Response.json(fallbackBlogs, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Has-More': String(offset + limit < filteredBlogs.length),
        },
      });
    }

    return Response.json({ error: error.message || 'Failed to load blog posts.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const categories = Array.isArray(body.categories)
      ? body.categories.map((c: any) => c?.toString().trim()).filter(Boolean)
      : (typeof body.category === 'string' && body.category.trim()
        ? [body.category.trim()]
        : ['world']);
    const uniqueCategories = Array.from(new Set(categories));

    const baseSlug = body.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newBlog = await Blog.create({
      title: body.title,
      slug: finalSlug,
      content: body.content,
      excerpt: body.excerpt || body.content.slice(0, 150),
      categories: uniqueCategories,
      category: uniqueCategories[0],
      region: body.region || body.location || '',
      location: body.location || body.region || '',
      tags: body.tags || [],
      featuredImage: body.featuredImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
      author: body.author || 'Editorial Correspondent',
      status: body.status || 'published',
      seoTitle: body.seoTitle || `${body.title} - WORLD NOW`,
      metaDescription: body.metaDescription || body.excerpt || '',
      isFeatured: body.isFeatured || false
    });

    if (body.isFeatured) {
      await Blog.updateMany({ _id: { $ne: newBlog._id }, isFeatured: true }, { isFeatured: false });
    }

    return Response.json(newBlog);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
