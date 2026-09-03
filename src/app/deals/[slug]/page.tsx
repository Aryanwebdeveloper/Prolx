import React from "react";
import Metadata from "next";
import { redirect } from "next/navigation";
import { getCampaignBySlug } from "@/app/deals-actions";
import DealsLandingClient from "@/components/deals/deals-landing-client";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || "14-august";
  const campaign = await getCampaignBySlug(slug);

  const title = `${campaign.title} | Website Development Packages Pakistan | Prolx Digital Agency`;
  const description = `Get a professional business website or e-commerce store in Pakistan starting from PKR 9,999! 14 August Independence Day Special Deals by Prolx Digital Agency. Limited slots available.`;

  return {
    title,
    description,
    keywords: [
      "website development Pakistan",
      "website developer Pakistan",
      "14 august deals Pakistan",
      "business website Pakistan",
      "e-commerce website Pakistan",
      "affordable website development Pakistan",
      "restaurant website Pakistan",
      "website design services Pakistan",
      "Prolx digital agency",
    ],
    openGraph: {
      title,
      description,
      url: `https://prolx.cloud/deals/${slug}`,
      siteName: "Prolx Digital Agency",
      images: [
        {
          url: "https://prolx.cloud/ProLx_withoutBackground.png",
          width: 1200,
          height: 630,
          alt: "Prolx 14 August Azadi Special Deals Pakistan",
        },
      ],
      locale: "en_PK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://prolx.cloud/deals/${slug}`,
    },
  };
}

export default async function DealCampaignPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams.slug || "14-august";
  const campaign = await getCampaignBySlug(slug);

  if (!campaign || !campaign.is_active) {
    redirect("/pricing");
  }

  return (
    <main>
      <DealsLandingClient
        campaign={campaign}
        utmParams={{
          source: resolvedSearchParams.utm_source,
          medium: resolvedSearchParams.utm_medium,
          campaign: resolvedSearchParams.utm_campaign,
          content: resolvedSearchParams.utm_content,
        }}
      />
    </main>
  );
}
