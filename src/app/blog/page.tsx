import { getBlogPosts } from "@/app/blog-actions";
import BlogClient from "./blog-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Prolx Digital Agency",
  description: "Insights, resources, and guides from the Prolx digital product team.",
};

export default async function BlogPage() {
  const { data: posts } = await getBlogPosts({ publishedOnly: true });
  
  // Extract unique categories, ensuring "All" is first
  const catSet = new Set((posts || []).map(p => p.category).filter(Boolean));
  const categories = ["All", ...Array.from(catSet)];

  return <BlogClient posts={posts || []} categories={categories} />;
}
