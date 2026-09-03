import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/pocketbase/server';
import { isAdminUser } from '@/lib/auth/isAdmin';

export async function POST(request, { params }) {
  try {
    const pb = await createServerClient(request);
    const admin = pb.authStore.record || pb.authStore.model;

    if (!pb.authStore.isValid || !isAdminUser(admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // PocketBase conf_certificates status schema allows: "requested", "generated", "rejected"
    const updated = await pb.collection('conf_certificates').update(id, {
      status: 'generated',
    });

    return NextResponse.json({ certificate: updated, message: 'Certificate sent/delivered successfully' });
  } catch (err) {
    console.error('Error sending certificate:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send certificate', details: err.data || null },
      { status: err.status || 400 }
    );
  }
}
