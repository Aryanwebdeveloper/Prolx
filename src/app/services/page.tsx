import ServicesClient from "./services-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Web & App Development, SEO, Design | Prolx",
  description: "Explore our premium digital services including website development, mobile apps, UI/UX design, SEO, SaaS development, and more.",
};

export default function ServicesPage() {
  return <ServicesClient />;
}
