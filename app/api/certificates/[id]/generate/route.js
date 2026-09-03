import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/pocketbase/server';
import { isAdminUser } from '@/lib/auth/isAdmin';
import { generateCertificatePdfBuffer } from '@/lib/certificates/pdf-generator';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request, { params }) {
  try {
    const pb = await createServerClient(request);
    const admin = pb.authStore.record || pb.authStore.model;

    if (!pb.authStore.isValid || !isAdminUser(admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { name: overrideName, issueDate } = body;

    const certificate = await pb.collection('conf_certificates').getOne(id, {
      expand: 'user,registration',
    });

    const resolvedIssueDate = issueDate || new Date().toISOString().slice(0, 10);
    const recipientName = overrideName || certificate.expand?.user?.name || certificate.expand?.registration?.fullname || 'Participant';
    const confTitle = certificate.expand?.registration?.ticket_name || 'ZEP Research Conference';

    // Generate PDF Buffer using pdf-lib
    const pdfBuffer = await generateCertificatePdfBuffer({
      name: recipientName,
      conference: confTitle,
      certificateType: certificate.certificate_type || 'participation',
      certificateNo: certificate.certificate_no,
      verificationCode: certificate.verification_code,
      issueDate: resolvedIssueDate,
    });

    const updateForm = new FormData();
    updateForm.append('status', 'generated');
    updateForm.append('generation_method', 'template');
    updateForm.append('issue_date', resolvedIssueDate);
    updateForm.append(
      'pdf',
      new Blob([pdfBuffer], { type: 'application/pdf' }),
      `${certificate.certificate_no || id}.pdf`
    );

    const updated = await pb.collection('conf_certificates').update(id, updateForm);

    return NextResponse.json({ certificate: updated, message: 'PDF generated successfully' });
  } catch (err) {
    console.error('Error generating certificate PDF:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate certificate', details: err.data || null },
      { status: err.status || 500 }
    );
  }
}
