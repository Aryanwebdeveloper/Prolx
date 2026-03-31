import { getCareerJobs } from "@/app/careers-actions";
import CareersClient from "./careers-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | Prolx Digital Agency",
  description: "Join our team of passionate builders, designers, and marketers.",
};

export default async function CareersPage() {
  const { data: jobs } = await getCareerJobs("Open");

  return <CareersClient jobs={jobs || []} />;
}
