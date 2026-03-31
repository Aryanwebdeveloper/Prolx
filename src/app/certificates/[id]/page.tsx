import { verifyCertificate } from "@/app/certificate-actions";
import { getCertStatus } from "@/lib/certificates";
import CertificateResultPage from "@/components/certificate-result-page";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Certificate ${id} | Prolx Digital Agency`,
    description: `Verify certificate ${id} issued by Prolx Digital Agency.`,
  };
}

export default async function CertificateVerificationPage({ params }: Props) {
  const { id } = await params;
  const { data, error } = await verifyCertificate(id);

  if (error || !data) {
    return (
      <CertificateResultPage
        certId={id}
        cert={null}
        status="not_found"
      />
    );
  }

  // Normalize profiles: Supabase may return array for joined tables
  const profilesRaw = data.profiles;
  const profileObj = Array.isArray(profilesRaw) ? profilesRaw[0] ?? null : profilesRaw ?? null;

  const cert = {
    id: data.id as string,
    title: data.title as string,
    description: data.description as string | undefined,
    recipient_name: data.recipient_name as string,
    recipient_email: data.recipient_email as string | undefined,
    issue_date: data.issue_date as string,
    expiry_date: data.expiry_date as string | undefined,
    status: data.status as string,
    issued_by: data.issued_by as string,
    category: data.category as string,
    profiles: profileObj ? { full_name: profileObj.full_name as string } : null,
  };

  const computedStatus = getCertStatus(cert.status, cert.expiry_date);

  return (
    <CertificateResultPage
      certId={id}
      cert={cert}
      status={computedStatus}
    />
  );
}
