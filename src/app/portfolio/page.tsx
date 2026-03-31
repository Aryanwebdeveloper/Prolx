import { getPortfolioProjects } from "@/app/portfolio-actions";
import PortfolioClient from "./portfolio-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Prolx Digital Agency",
  description: "Explore our real projects and case studies across various industries.",
};

export default async function PortfolioPage() {
  const { data: projects } = await getPortfolioProjects();
  
  const catSet = new Set((projects || []).map(p => p.category).filter(Boolean));
  const categories = ["All", ...Array.from(catSet)];

  return <PortfolioClient projects={projects || []} categories={categories as string[]} />;
}
