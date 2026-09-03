import { verifyCertificate } from "@/app/academy-actions";
import { getCertStatus } from "@/lib/certificates";
import CertificateResultPage from "@/components/certificate-result-page";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Certificate ${id} Verification | Prolx Digital Agency`,
    description: `Verify official certificate ${id} issued by Prolx Digital Agency & Academy.`,
  };
}

export default async function LegacyCertificateVerificationPage({ params }: Props) {
  const { id } = await params;
  const cleanId = (id || "").trim().toUpperCase();
  const { found, certificate } = await verifyCertificate(cleanId);

  if (!found || !certificate) {
    return (
      <CertificateResultPage
        certId={cleanId}
        cert={null}
        status="not_found"
      />
    );
  }

  const cert = {
    id: certificate.certificate_id || cleanId,
    title: certificate.course_title || certificate.title || "Certificate of Completion",
    description: certificate.description || undefined,
    recipient_name: certificate.recipient_name || certificate.student_name || "Student Name",
    recipient_email: certificate.recipient_email || undefined,
    issue_date: certificate.issue_date || certificate.issued_at || new Date().toISOString().split("T")[0],
    expiry_date: certificate.valid_until || certificate.expiry_date || undefined,
    status: certificate.status || "issued",
    issued_by: certificate.issued_by || "Prolx Digital Agency & Prolx Academy",
    category: certificate.certificate_type ? certificate.certificate_type.replace(/_/g, " ").toUpperCase() : "COURSE COMPLETION",
    certificate_type: certificate.certificate_type || "course_completion",
    internship_field: certificate.internship_field || (certificate.course ? certificate.course.title : undefined),
    revoked_at: certificate.revoked_at,
    revoked_reason: certificate.revoked_reason,
    is_uploaded: certificate.is_uploaded || false,
    file_url: certificate.file_url || null,
    qr_code_url: certificate.qr_code_url || null,
    start_date: certificate.start_date,
    completion_date: certificate.completion_date || certificate.issue_date,
    course_duration: certificate.course_duration,
  };

  const computedStatus = getCertStatus(cert.status, cert.expiry_date);

  return (
    <CertificateResultPage
      certId={cert.id}
      cert={cert}
      status={computedStatus}
    />
  );
}
