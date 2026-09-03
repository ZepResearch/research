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
    const { reason } = await request.json().catch(() => ({}));

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const updated = await pb.collection('conf_certificates').update(id, {
      status: 'rejected',
      rejection_reason: reason,
    });

    return NextResponse.json({ certificate: updated });
  } catch (err) {
    console.error('Error rejecting certificate:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to reject certificate', details: err.data || null },
      { status: err.status || 500 }
    );
  }
}
