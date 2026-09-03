"use server";

import { createClient } from "../../supabase/server";
import { revalidatePath } from "next/cache";

export type DealPackage = {
  id: string;
  campaign_id?: string;
  category_id: string;
  category_name: string;
  name: string;
  slug?: string;
  regular_price_pkr: number;
  deal_price_pkr: number;
  savings_pkr: number;
  description: string;
  features: string[];
  delivery_estimate: string;
  is_popular?: boolean;
  badge_text?: string;
  display_order?: number;
  is_active?: boolean;
};

export type DealCampaign = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  announcement_text: string;
  start_date?: string;
  end_date?: string;
  countdown_end_date: string;
  total_slots: number;
  available_slots: number;
  is_active: boolean;
  is_featured: boolean;
  theme_config?: {
    primaryColor: string;
    accentColor: string;
    badgeText: string;
  };
  packages: DealPackage[];
};

// Default 14 August Azadi Special Campaign Fallback Data
const DEFAULT_14_AUGUST_CAMPAIGN: DealCampaign = {
  id: "14-august-azadi-2026",
  title: "14 AUGUST AZADI SPECIAL DEALS 🇵🇰",
  slug: "14-august",
  subtitle: "IS AZADI PAR, APNE BUSINESS KO ONLINE AZADI DO!",
  announcement_text: "🇵🇰 14 AUGUST AZADI SPECIAL DEALS — LIMITED TIME ONLY! 🇵🇰",
  countdown_end_date: "2026-08-15T00:00:00.000Z",
  total_slots: 20,
  available_slots: 7,
  is_active: false,
  is_featured: false,
  theme_config: {
    primaryColor: "#006633",
    accentColor: "#10B981",
    badgeText: "14 AUGUST AZADI SPECIAL",
  },
  packages: [
    {
      id: "pkg-business-starter",
      category_id: "business",
      category_name: "Business Website",
      name: "Starter Business Website",
      slug: "starter-business-website",
      regular_price_pkr: 19999,
      deal_price_pkr: 9999,
      savings_pkr: 10000,
      description: "Ideal for local Pakistani small businesses, startups, and service providers wanting a clean digital presence.",
      features: [
        "Modern Professional Design",
        "Mobile & Tablet Responsive",
        "Direct WhatsApp Chat Integration",
        "Contact & Inquiry Form",
        "Google Maps Location Setup",
        "Social Media Links & Icons",
        "SEO-Friendly Page Structure",
        "Super Fast Page Speed",
        "Basic Security Protection",
        "3 to 5 Days Delivery",
      ],
      delivery_estimate: "3 to 5 Days",
      is_popular: false,
      badge_text: "Azadi Starter Deal",
      display_order: 1,
      is_active: true,
    },
    {
      id: "pkg-business-pro",
      category_id: "business",
      category_name: "Business Website",
      name: "Professional Business Website",
      slug: "professional-business-website",
      regular_price_pkr: 35000,
      deal_price_pkr: 17999,
      savings_pkr: 17001,
      description: "Complete corporate website with dynamic sections, service showcases, custom contact flows, and content management.",
      features: [
        "Custom Modern Corporate Design",
        "Mobile-First Responsive Layout",
        "Dynamic Product/Service Showcase",
        "WhatsApp & Live Chat Widgets",
        "Interactive Contact & Lead Forms",
        "Google Maps & Location Manager",
        "Admin Dashboard Management",
        "Advanced On-Page SEO Setup",
        "High-Speed Speed Optimization",
        "Post-Launch Technical Support",
      ],
      delivery_estimate: "5 to 7 Days",
      is_popular: true,
      badge_text: "🔥 Most Popular Deal",
      display_order: 2,
      is_active: true,
    },
    {
      id: "pkg-ecommerce-starter",
      category_id: "ecommerce",
      category_name: "E-Commerce Website",
      name: "E-Commerce Storefront",
      slug: "ecommerce-storefront",
      regular_price_pkr: 45000,
      deal_price_pkr: 24999,
      savings_pkr: 20001,
      description: "Full online store equipped with product catalog, shopping cart, checkout, Cash on Delivery support, and order tracking.",
      features: [
        "Complete E-Commerce Online Store",
        "Product Catalog & Category System",
        "Shopping Cart & Express Checkout",
        "Cash On Delivery (COD) Integration",
        "Order Management System for Admin",
        "Direct WhatsApp Order Notifications",
        "Customer Account & Order History",
        "Mobile-Optimized Shopping Experience",
        "Inventory & Price Management",
        "SEO & Fast Page Load Speed",
      ],
      delivery_estimate: "7 to 10 Days",
      is_popular: false,
      badge_text: "Azadi E-Com Special",
      display_order: 3,
      is_active: true,
    },
    {
      id: "pkg-ecommerce-advanced",
      category_id: "ecommerce",
      category_name: "E-Commerce & Enterprise",
      name: "Advanced E-Commerce / Custom Business",
      slug: "advanced-ecommerce-custom-business",
      regular_price_pkr: 65000,
      deal_price_pkr: 34999,
      savings_pkr: 30001,
      description: "High-scale online store with online payment gateways, automated inventory, coupon codes, and custom business workflow.",
      features: [
        "Full Custom Scalable Architecture",
        "Online Card/Bank Payment Integration",
        "Advanced Order & Inventory Management",
        "Automated WhatsApp & Email Receipts",
        "Coupon Codes & Discount Engine",
        "Multi-Category & Variant Support",
        "Custom Business Workflow Automation",
        "VIP Priority Support & Maintenance",
        "Speed & Security Hardening",
        "Admin Dashboard Training Session",
      ],
      delivery_estimate: "10 to 14 Days",
      is_popular: false,
      badge_text: "Enterprise Azadi Deal",
      display_order: 4,
      is_active: true,
    },
    {
      id: "pkg-restaurant",
      category_id: "restaurant",
      category_name: "Restaurant & Café Website",
      name: "Restaurant & Café Digital Menu Website",
      slug: "restaurant-cafe-digital-menu-website",
      regular_price_pkr: 32000,
      deal_price_pkr: 16999,
      savings_pkr: 15001,
      description: "Attractive digital menu, online food ordering via WhatsApp, branch locator, and table reservation request form.",
      features: [
        "Interactive Digital Food Menu",
        "WhatsApp Direct Food Ordering",
        "Table Booking & Reservation Form",
        "Google Maps & Branch Locator",
        "Food Photo Gallery & Deals Banner",
        "Mobile Quick Order Interface",
        "SEO & Speed Optimization",
      ],
      delivery_estimate: "4 to 6 Days",
      is_popular: false,
      badge_text: "Food Industry Deal",
      display_order: 5,
      is_active: true,
    },
    {
      id: "pkg-boutique",
      category_id: "boutique",
      category_name: "Boutique & Fashion",
      name: "Boutique & Fashion Showcase",
      slug: "boutique-fashion-showcase",
      regular_price_pkr: 38000,
      deal_price_pkr: 19999,
      savings_pkr: 18001,
      description: "Elegant lookbook gallery, product collection showcase, and quick WhatsApp ordering for clothing brands.",
      features: [
        "High-End Fashion Aesthetic Layout",
        "Category & Lookbook Showcase",
        "Instant WhatsApp Inquiry & Order",
        "Size Chart & Product Details",
        "Instagram Feed & Social Integration",
        "Fast Loading High-Res Gallery",
      ],
      delivery_estimate: "5 to 7 Days",
      is_popular: false,
      badge_text: "Fashion Special",
      display_order: 6,
      is_active: true,
    },
    {
      id: "pkg-salon",
      category_id: "salon",
      category_name: "Salon & Beauty",
      name: "Salon & Beauty Booking Website",
      slug: "salon-beauty-booking-website",
      regular_price_pkr: 28000,
      deal_price_pkr: 14999,
      savings_pkr: 13001,
      description: "Showcase beauty services, price menu, customer reviews, and online appointment requests directly via WhatsApp.",
      features: [
        "Services & Price List Menu",
        "Appointment Booking Request Form",
        "WhatsApp Quick Consultation Button",
        "Client Transformations Gallery",
        "Customer Reviews & Rating Stars",
        "Branch Address & Operating Hours",
      ],
      delivery_estimate: "4 to 6 Days",
      is_popular: false,
      badge_text: "Beauty & Spa Deal",
      display_order: 7,
      is_active: true,
    },
    {
      id: "pkg-realestate",
      category_id: "realestate",
      category_name: "Real Estate Website",
      name: "Real Estate Property Portal",
      slug: "real-estate-property-portal",
      regular_price_pkr: 50000,
      deal_price_pkr: 27999,
      savings_pkr: 22001,
      description: "Feature property listings, plot details, inquiry forms, lead capturing, and agent WhatsApp buttons.",
      features: [
        "Property Listings & Filters",
        "Detailed Property View Pages",
        "Lead Capture & Inquiry Forms",
        "WhatsApp Agent Connect Buttons",
        "Google Maps Property Location",
        "Admin Portal to Update Listings",
      ],
      delivery_estimate: "7 to 10 Days",
      is_popular: false,
      badge_text: "Property Deal",
      display_order: 8,
      is_active: true,
    },
  ],
};

export async function getCampaignBySlug(slug: string = "14-august"): Promise<DealCampaign> {
  try {
    const supabase = await createClient();
    
    // Attempt DB query
    const { data: campaign, error: campaignErr } = await supabase
      .from("deals_campaigns")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (campaignErr || !campaign) {
      return DEFAULT_14_AUGUST_CAMPAIGN;
    }

    const { data: packages, error: pkgErr } = await supabase
      .from("deals_packages")
      .select("*")
      .eq("campaign_id", campaign.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (pkgErr || !packages || packages.length === 0) {
      return {
        ...DEFAULT_14_AUGUST_CAMPAIGN,
        ...campaign,
      };
    }

    const formattedPackages: DealPackage[] = packages.map((p) => ({
      id: p.id,
      campaign_id: p.campaign_id,
      category_id: p.category_id || "business",
      category_name: p.category_name || "Business Website",
      name: p.name,
      slug: p.slug || "",
      regular_price_pkr: Number(p.regular_price_pkr),
      deal_price_pkr: Number(p.deal_price_pkr),
      savings_pkr: Number(p.regular_price_pkr) - Number(p.deal_price_pkr),
      description: p.description || "",
      features: typeof p.features === "string" ? p.features.split("\n").filter(Boolean) : p.features || [],
      delivery_estimate: p.delivery_estimate || "3 to 5 Days",
      is_popular: p.is_popular,
      badge_text: p.badge_text,
      display_order: p.display_order,
      is_active: p.is_active,
    }));

    return {
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      subtitle: campaign.subtitle || DEFAULT_14_AUGUST_CAMPAIGN.subtitle,
      announcement_text: campaign.announcement_text || DEFAULT_14_AUGUST_CAMPAIGN.announcement_text,
      countdown_end_date: campaign.countdown_end_date || DEFAULT_14_AUGUST_CAMPAIGN.countdown_end_date,
      total_slots: campaign.total_slots ?? 20,
      available_slots: campaign.available_slots ?? 7,
      is_active: campaign.is_active,
      is_featured: campaign.is_featured,
      theme_config: campaign.theme_config || DEFAULT_14_AUGUST_CAMPAIGN.theme_config,
      packages: formattedPackages,
    };
  } catch (err) {
    console.error("Error in getCampaignBySlug, returning default campaign:", err);
    return DEFAULT_14_AUGUST_CAMPAIGN;
  }
}

export async function recordCampaignAnalytics(payload: {
  campaign_id?: string;
  event_type: 'page_view' | 'cta_click' | 'whatsapp_click' | 'demo_booking' | 'lead_submission';
  visitor_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  selected_package?: string;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("campaign_analytics").insert({
      campaign_id: payload.campaign_id || null,
      event_type: payload.event_type,
      visitor_id: payload.visitor_id || null,
      utm_source: payload.utm_source || null,
      utm_medium: payload.utm_medium || null,
      utm_campaign: payload.utm_campaign || null,
      selected_package: payload.selected_package || null,
    });
  } catch (err) {
    // Non-fatal analytics logging error
  }
}

export async function submitDealLead(payload: {
  campaign_id?: string;
  campaign_name?: string;
  package_id?: string;
  package_name: string;
  deal_price: string;
  name: string;
  whatsapp_number: string;
  email?: string;
  business_type?: string;
  website_type?: string;
  message?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  source_type?: 'contact_form' | 'whatsapp' | 'demo_booking';
}) {
  const supabase = await createClient();

  let leadRecord = null;
  let leadError = null;

  // 1. Try to record lead in deal_leads table
  try {
    const { data, error } = await supabase
      .from("deal_leads")
      .insert({
        campaign_id: payload.campaign_id || null,
        campaign_name: payload.campaign_name || "14 August Azadi Special Deals",
        package_id: payload.package_id || null,
        package_name: payload.package_name,
        deal_price: payload.deal_price,
        name: payload.name,
        whatsapp_number: payload.whatsapp_number,
        email: payload.email || null,
        business_type: payload.business_type || null,
        website_type: payload.website_type || null,
        message: payload.message || null,
        utm_source: payload.utm_source || null,
        utm_medium: payload.utm_medium || null,
        utm_campaign: payload.utm_campaign || null,
        utm_content: payload.utm_content || null,
        source_type: payload.source_type || 'demo_booking',
        status: "New",
      })
      .select()
      .single();

    leadRecord = data;
    leadError = error;
  } catch (err) {
    console.error("deal_leads insert error (fallback proceeding to contacts):", err);
  }

  // 2. ALSO insert into main contacts table so existing CRM/Contact panel captures it!
  try {
    const fullMessage = `[14 August Azadi Deal Lead]
Package: ${payload.package_name} (${payload.deal_price})
WhatsApp: ${payload.whatsapp_number}
Business Type: ${payload.business_type || "Unspecified"}
Website Category: ${payload.website_type || "Unspecified"}
UTM Source: ${payload.utm_source || "Direct / Organic"}
User Note: ${payload.message || "N/A"}`;

    await supabase.from("contacts").insert({
      status: "New",
      name: payload.name,
      email: payload.email || `${payload.whatsapp_number.replace(/[^0-9]/g, '')}@prolx-lead.local`,
      phone: payload.whatsapp_number,
      service: `14 August Deal: ${payload.package_name}`,
      budget: payload.deal_price,
      message: fullMessage,
    });
  } catch (err) {
    console.error("contacts insert error (non-fatal):", err);
  }

  // 3. Log conversion analytics
  await recordCampaignAnalytics({
    campaign_id: payload.campaign_id,
    event_type: 'lead_submission',
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    selected_package: payload.package_name,
  });

  // 4. Send Email Notification to Admin if email system exists
  if (payload.email) {
    try {
      const { sendEmail, ADMIN_EMAIL } = await import("@/lib/email");
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[🇵🇰 14 August Deal Lead] ${payload.name} — ${payload.package_name}`,
        html: `
          <h2>New 14 August Deal Lead Received!</h2>
          <p><strong>Name:</strong> ${payload.name}</p>
          <p><strong>WhatsApp:</strong> ${payload.whatsapp_number}</p>
          <p><strong>Selected Package:</strong> ${payload.package_name} (${payload.deal_price})</p>
          <p><strong>Business Type:</strong> ${payload.business_type || "N/A"}</p>
          <p><strong>Source:</strong> ${payload.utm_source || "Direct"}</p>
          <p><strong>Message:</strong> ${payload.message || "N/A"}</p>
        `,
      });
    } catch (e) {
      // Non-fatal
    }
  }

  // Revalidate admin dashboard and deals page
  revalidatePath("/dashboard");
  revalidatePath("/deals/14-august");

  return { data: leadRecord || { success: true }, error: leadError };
}

export async function getAdminCampaigns() {
  const supabase = await createClient();
  try {
    const { data: campaigns } = await supabase.from("deals_campaigns").select("*").order("created_at", { ascending: false });
    const { data: packages } = await supabase.from("deals_packages").select("*").order("display_order", { ascending: true });
    let { data: leads } = await supabase.from("deal_leads").select("*").order("created_at", { ascending: false });
    const { data: analytics } = await supabase.from("campaign_analytics").select("*").order("created_at", { ascending: false });

    // Fallback: If deal_leads table is empty or missing, fetch from contacts table
    if (!leads || leads.length === 0) {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("*")
        .ilike("service", "%14 August Deal%")
        .order("created_at", { ascending: false });

      if (contacts && contacts.length > 0) {
        leads = contacts.map((c: any) => ({
          id: c.id,
          name: c.name,
          whatsapp_number: c.phone || "N/A",
          email: c.email,
          package_name: c.service ? c.service.replace("14 August Deal: ", "") : "Azadi Deal",
          deal_price: c.budget || "PKR 9,999",
          business_type: c.message ? c.message.split("\n")[3]?.replace("Business Type: ", "") : "Service / Business",
          status: c.status || "New",
          created_at: c.created_at,
          utm_source: "Form Submission",
        }));
      }
    }

    return {
      campaigns: campaigns && campaigns.length > 0 ? campaigns : [DEFAULT_14_AUGUST_CAMPAIGN],
      packages: packages && packages.length > 0 ? packages : DEFAULT_14_AUGUST_CAMPAIGN.packages,
      leads: leads || [],
      analytics: analytics || [],
    };
  } catch (err) {
    return {
      campaigns: [DEFAULT_14_AUGUST_CAMPAIGN],
      packages: DEFAULT_14_AUGUST_CAMPAIGN.packages,
      leads: [],
      analytics: [],
    };
  }
}

export async function saveCampaign(campaignData: any) {
  const supabase = await createClient();
  if (campaignData.id && !campaignData.id.includes("azadi")) {
    const { data, error } = await supabase
      .from("deals_campaigns")
      .update(campaignData)
      .eq("id", campaignData.id)
      .select()
      .single();
    revalidatePath("/deals/14-august");
    return { data, error };
  } else {
    const { id, ...newObj } = campaignData;
    const { data, error } = await supabase
      .from("deals_campaigns")
      .insert(newObj)
      .select()
      .single();
    revalidatePath("/deals/14-august");
    return { data, error };
  }
}

export async function savePackage(pkgData: any) {
  const supabase = await createClient();
  if (pkgData.id && !pkgData.id.startsWith("pkg-")) {
    const { data, error } = await supabase
      .from("deals_packages")
      .update(pkgData)
      .eq("id", pkgData.id)
      .select()
      .single();
    revalidatePath("/deals/14-august");
    return { data, error };
  } else {
    const { id, ...newObj } = pkgData;
    const { data, error } = await supabase
      .from("deals_packages")
      .insert(newObj)
      .select()
      .single();
    revalidatePath("/deals/14-august");
    return { data, error };
  }
}

export async function deletePackage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("deals_packages").delete().eq("id", id);
  revalidatePath("/deals/14-august");
  return { error };
}

export async function updateDealLeadStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_leads")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  revalidatePath("/dashboard");
  return { data, error };
}
