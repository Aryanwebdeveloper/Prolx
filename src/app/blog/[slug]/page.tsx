import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronLeft, Calendar, User } from "lucide-react";
import { getBlogPost } from "@/app/blog-actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await getBlogPost(slug);
  if (!post) {
    return { title: 'Post Not Found | Prolx' };
  }
  return {
    title: `${post.meta_title || post.title} | Prolx`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      images: post.featured_image_url ? [post.featured_image_url] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />
      <main className="pt-32 pb-20">
        <article className="container mx-auto px-4 max-w-4xl">
           <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[#0D9488] mb-8 hover:underline">
              <ChevronLeft size={16} /> Back to Blog
           </Link>
           
           <div className="mb-8">
              {post.category && (
                <span className="text-xs font-mono bg-[#CCFBF1] text-[#0D9488] px-3 py-1 rounded-full mb-4 inline-block">
                  {post.category}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-6 leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-[#64748B] text-sm">
                 {post.author_name && (
                   <span className="flex items-center gap-2"><User size={16} /> {post.author_name}</span>
                 )}
                 <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                 {post.read_time && (
                   <span className="flex items-center gap-2"><Clock size={16} /> {post.read_time}</span>
                 )}
              </div>
           </div>
           
           {post.featured_image_url && (
             <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden mb-12">
               <Image src={post.featured_image_url} alt={post.title} fill className="object-cover" priority />
             </div>
           )}
           
           {/* Replace this with a Markdown component if markdown is used, or keep dangerouslySetInnerHTML for HTML */}
           <div className="prose prose-lg max-w-none text-[#475569] prose-headings:text-[#0F172A] prose-a:text-[#0D9488] prose-img:rounded-2xl" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
           
        </article>
      </main>
      <ProlxFooter />
    </div>
  );
}
