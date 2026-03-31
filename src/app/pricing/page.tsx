import { getPricingPlans } from "@/app/pricing-actions";
import PricingClient from "./pricing-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans | Prolx Digital Agency",
  description: "Transparent pricing for website development, custom apps, and digital solutions.",
};

export default async function PricingPage() {
  const { data: plans } = await getPricingPlans(true); // true = activeOnly

  return <PricingClient plans={plans || []} />;
}
