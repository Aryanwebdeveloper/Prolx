import { getTestimonials } from "@/app/testimonials-actions";
import TestimonialsClient from "./testimonials-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials | Prolx Digital Agency",
  description: "Read what our clients say about our web and app development services.",
};

export default async function TestimonialsPage() {
  const { data: testimonials } = await getTestimonials(true);

  return <TestimonialsClient testimonials={testimonials || []} />;
}
