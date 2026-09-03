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
    const formData = await request.formData();
    const file = formData.get('pdf');

    if (!file) {
      return NextResponse.json({ error: 'pdf file is required' }, { status: 400 });
    }

    const updated = await pb.collection('conf_certificates').update(id, {
      pdf: file,
      status: 'generated',
      generation_method: 'manual_upload',
      issue_date: new Date().toISOString(),
    });

    return NextResponse.json({ certificate: updated });
  } catch (err) {
    console.error('Error uploading certificate PDF:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to upload certificate', details: err.data || null },
      { status: err.status || 500 }
    );
  }
}
