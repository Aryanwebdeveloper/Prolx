import { ConsultationClient } from "./consultation-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Consultation | Prolx Digital Agency",
  description: "Schedule a free 30-minute discovery call with our team to discuss your project goals, technical needs, and timeline.",
};

export default function BookConsultationPage() {
  return <ConsultationClient />;
}
