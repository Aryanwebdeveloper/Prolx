import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User } from "lucide-react";
import { getBlogPosts } from "@/app/blog-actions";

export default async function BlogPreview() {
  const { data: posts, error } = await getBlogPosts({ publishedOnly: true });
  
  // Slice to get only the latest 3
  const latestPosts = (posts || []).slice(0, 3);

  // If no posts in DB, show nothing or dummy posts (let's show dummy if empty for "fully enhanced" feel)
  const displayPosts = latestPosts.length > 0 ? latestPosts : [
    {
      id: "dummy-1",
      title: "How to Scale Your Business with a Modern Digital Product",
      excerpt: "In 2026, the digital landscape is more competitive than ever. Here's a comprehensive guide to scaling your brand effectively.",
      featured_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
      created_at: new Date().toISOString(),
      author_name: "Zain Ahmad",
      slug: "scale-your-business-2026",
      category: "Strategy"
    },
    {
      id: "dummy-2",
      title: "The Future of Mobile App Development in the PWA Era",
      excerpt: "Progressive Web Apps are changing the game for small and medium businesses. Find out if a PWA is right for your next project.",
      featured_image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
      created_at: new Date().toISOString(),
      author_name: "Sara Malik",
      slug: "future-of-pwas",
      category: "Tech"
    },
    {
      id: "dummy-3",
      title: "Why UX Design is the Highest ROI Activity for Startups",
      excerpt: "A beautiful UI gets people through the door, but a seamless UX keeps them coming back. Learn why design is a strategic investment.",
      featured_image_url: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=600&q=80",
      created_at: new Date().toISOString(),
      author_name: "Fatima Shah",
      slug: "ux-design-roi",
      category: "Design"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0D9488] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 font-mono">
              Insights & News
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              From Our{" "}
              <em
                style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#0D9488" }}
              >
                Journal
              </em>
            </h2>
          </div>
          <Link
            href="/blog"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0D9488] text-[#0D9488] font-semibold rounded-xl hover:bg-[#0D9488] hover:text-white transition-all shadow-md shadow-teal-50"
          >
            Read All Articles
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col h-full bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#0D9488] hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.featured_image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80"}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#0D9488] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {post.category || "General"}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-[10px] text-[#94A3B8] font-semibold uppercase tracking-widest mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-[#0D9488]" />
                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} className="text-[#0D9488]" />
                    {post.author_name || "Prolx Team"}
                  </span>
                </div>
                
                <h3
                  className="text-xl font-bold text-[#0F172A] mb-3 group-hover:text-[#0D9488] transition-colors line-clamp-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {post.title}
                </h3>
                
                <p className="text-sm text-[#64748B] line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                   <span className="text-xs font-bold text-[#0D9488] flex items-center gap-1">
                     Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </span>
                   {post.read_time && (
                     <span className="text-[10px] text-[#94A3B8] font-medium">{post.read_time} read</span>
                   )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
