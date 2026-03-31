import { getTeamMembers } from "@/app/team-actions";
import TeamClient from "./team-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team | Prolx Digital Agency",
  description: "Meet the experts behind Prolx Digital Agency.",
};

export default async function TeamPage() {
  const { data: members } = await getTeamMembers(true);
  
  const deptSet = new Set((members || []).map(m => m.department).filter(Boolean));
  const departments = ["All", ...Array.from(deptSet)];

  return <TeamClient members={members || []} departments={departments as string[]} />;
}
