import { getDocumentByToken } from "@/app/business-docs-actions";
import { notFound } from "next/navigation";
import DocumentPublicView from "./document-public-view";

interface PublicDocPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicDocPage({ params }: PublicDocPageProps) {
  const resolvedParams = await params;
  const { data: doc, error } = await getDocumentByToken(resolvedParams.token);

  if (error || !doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-[#0D9488]/30 selection:text-[#2DD4BF]">
      <DocumentPublicView initialDoc={doc} token={resolvedParams.token} />
    </div>
  );
}
