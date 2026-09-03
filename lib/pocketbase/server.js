import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

// Per-request client authenticated as whoever's cookie or token is on the request.
export async function createServerClient(req) {
  const pb = new PocketBase('https://admin.zepresearch.com');

  // 1. Try reading cookie
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('pb_auth');
    if (authCookie && authCookie.value && authCookie.value !== 'null') {
      pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
    }
  } catch {
    // Ignore cookie errors if not in a request context
  }

  // 2. If valid auth hasn't been loaded from cookie, check Authorization header or request headers
  if (!pb.authStore.isValid && req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      pb.authStore.save(token, null);
    }
  }

  // 3. Validate / refresh auth store
  try {
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
  } catch {
    pb.authStore.clear();
  }

  return pb;
}
