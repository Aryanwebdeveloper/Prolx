import { FAQsClient } from "./faqs-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Prolx Digital Agency",
  description: "Find answers to common questions about our services, pricing, development process, and technical stack.",
};

export default function FAQsPage() {
  return <FAQsClient />;
}
