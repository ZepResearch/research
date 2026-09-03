import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/pocketbase/server';
import { generateCertificateNo, generateVerificationCode } from '@/lib/certificates/ids';

export async function POST(request) {
  try {
    const pb = await createServerClient(request);
    const user = pb.authStore.record || pb.authStore.model;

    if (!pb.authStore.isValid || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { registrationId, certificateType = 'participation' } = body;

    if (!registrationId) {
      return NextResponse.json({ error: 'registrationId is required' }, { status: 400 });
    }

    let registration;
    try {
      registration = await pb.collection('conf_registration').getOne(registrationId);
    } catch (err) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.user && registration.user !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Registration belongs to another user' }, { status: 403 });
    }

    if (registration.conf_date && new Date(registration.conf_date) > new Date()) {
      return NextResponse.json(
        { error: 'Certificates are available once the conference has concluded.' },
        { status: 400 }
      );
    }

    // Check existing certificate
    const existing = await pb.collection('conf_certificates').getFullList({
      filter: pb.filter('registration = {:reg} && certificate_type = {:type} && status != "rejected"', {
        reg: registrationId,
        type: certificateType,
      }),
    }).catch(() => []);

    if (existing.length > 0) {
      return NextResponse.json({ certificate: existing[0] });
    }

    const certData = {
      user: user.id,
      registration: registrationId,
      certificate_type: certificateType,
      certificate_no: generateCertificateNo(),
      verification_code: generateVerificationCode(),
      status: 'requested',
    };

    const certificate = await pb.collection('conf_certificates').create(certData);

    return NextResponse.json({ certificate });
  } catch (err) {
    console.error('Error in /api/certificates/request:', err);
    return NextResponse.json(
      {
        error: err.message || 'Failed to request certificate',
        details: err.data || null,
      },
      { status: err.status || 500 }
    );
  }
}
