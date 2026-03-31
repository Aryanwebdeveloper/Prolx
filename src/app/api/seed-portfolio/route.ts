import { createClient } from "@/../supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Use the name from the user's description
  const projectName = "Spectrum Marketers";
  const slug = "spectrum-marketers";

  // 1. Upsert Portfolio Project
  const { data: project, error: pError } = await supabase
    .from("portfolio_projects")
    .upsert(
      {
        name: projectName,
        slug: slug,
        client: "Spectrum Marketers",
        category: "Digital Transformation",
        industry: "Distribution & Marketing",
        tech_stack: "Next.js 15, Supabase, Tailwind CSS, PostgreSQL",
        summary: "Transforming traditional distribution operations into a modern, digital-first system for the beauty and retail industry in Pakistan.",
        short_description: "Enterprise ERP for Beauty & Retail Distribution Management.",
        featured_image_url: "https://images.unsplash.com/photo-1540324155974-7523202daa3f?q=80&w=2630&auto=format&fit=crop",
        is_featured: true,
        display_order: 1,
        live_url: "https://spectrummarketers.prolx.agency",
        github_url: "https://github.com/prolx-agency/spectrum-erp-core"
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (pError) return NextResponse.json({ error: pError.message }, { status: 500 });

  // 2. Upsert Case Study
  const { error: csError } = await supabase
    .from("case_studies")
    .upsert(
      {
        portfolio_id: project.id,
        slug: slug,
        title: "Modernizing Beauty Retail Distribution: A Full-Scale Digital Ecosystem",
        client_name: "Spectrum Marketers Pakistan",
        industry: "Retail & Distribution",
        hero_image_url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2670&auto=format&fit=crop",
        project_background: "Spectrum Marketers is a well-established distribution and marketing company specializing in beauty parlor and retail products across multiple regions of Pakistan. Our projects focus on transforming traditional business operations into modern, digital-first systems. We have developed advanced web-based platforms that include inventory management, order tracking, client dashboards, and admin control panels.",
        client_challenges: "Fragmented inventory tracking across multiple Pakistani regions\nManual paper-based order processing slow-downs\nLack of real-time visibility for field sales teams\nInefficient manual invoicing and attendance records",
        research_strategy: "We focused on auditing the entire distribution lifecycle. Our strategy prioritized a 'complete digital ecosystem'—integrating analytics, automated invoicing, and document generation (offer letters/reports) into a single, unified interface for business owners and field staff.",
        design_process: "Design centered on 'Professional Efficiency.' We built custom client dashboards and restricted admin control panels to allow for granular permission management. The interface is optimized for both desktop management and field-ready mobile access for salesmen.",
        development_approach: "Built on a modern serverless stack, we implemented advanced platforms with features like attendance management, automated invoicing, and real-time document generation (reports/offer letters) to make management professional and high-performing.",
        technologies: "Next.js 15, Supabase (PostgreSQL), TypeScript, Tailwind CSS, Node.js",
        metrics: "400%|Efficiency|Transformation of business operations into digital-first systems.\n100%|Automation|Complete digital ecosystem for invoicing and documentation.\nReal-time|Insights|Instant tracking of orders and inventory across all regions.\n90%|Reduced Paper|Significant shift from manual to digital management.",
        status: "Published",
        screenshots: [
          "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      { onConflict: "portfolio_id" }
    );

  if (csError) return NextResponse.json({ error: csError.message }, { status: 500 });

  return NextResponse.json({ 
    message: "Spectrum Marketers REAL Data Seeded Successfully!",
    project_url: `/portfolio/${slug}`
  });
}
