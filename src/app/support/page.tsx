import { SupportClient } from "./support-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Center | Help & Resources | Prolx",
  description: "Get the support you need. Submit a ticket, browse our knowledge base, or contact our support team for assistance with your digital products.",
};

export default function SupportPage() {
  return <SupportClient />;
}
