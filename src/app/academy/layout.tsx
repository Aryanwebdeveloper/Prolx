import type { Metadata } from "next";
import ProlxNavbar from "@/components/prolx-navbar";
import ProlxFooter from "@/components/prolx-footer";
import BackToTop from "@/components/back-to-top";

export const metadata: Metadata = {
  title: {
    template: "%s | Prolx Academy",
    default: "Prolx Academy — Learn Today's Most In-Demand Digital Skills",
  },
  description:
    "Join Prolx Academy and gain practical industry experience through expert-led training programs, live projects, internships, and career mentorship. Courses in Web Development, AI, Design, Marketing & more.",
  keywords: [
    "software training Abbottabad",
    "coding bootcamp Pakistan",
    "online courses Urdu",
    "web development course",
    "digital marketing training",
    "Prolx Academy",
    "IT training institute Pakistan",
  ],
  openGraph: {
    siteName: "Prolx Academy",
    type: "website",
  },
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <ProlxNavbar />
      {children}
      <ProlxFooter />
      <BackToTop />
    </div>
  );
}
