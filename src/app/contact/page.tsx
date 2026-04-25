import { ContactClient } from "./contact-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Get a Quote | Prolx Digital Agency",
  description: "Ready to start your project? Contact Prolx for a free consultation. We offer premium web development, mobile apps, and digital marketing solutions.",
};

export default function ContactPage() {
  return <ContactClient />;
}
