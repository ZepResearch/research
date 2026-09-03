import PocketBase from 'pocketbase';

// Superuser client, server-only. Used for public verification lookup
let cached = null;

export async function getServiceClient() {
  if (cached?.authStore?.isValid) return cached;

  const pb = new PocketBase('https://admin.zepresearch.com');
  if (process.env.PB_SUPERUSER_EMAIL && process.env.PB_SUPERUSER_PASSWORD) {
    try {
      await pb.collection('_superusers').authWithPassword(
        process.env.PB_SUPERUSER_EMAIL,
        process.env.PB_SUPERUSER_PASSWORD
      );
    } catch {
      try {
        await pb.admins.authWithPassword(
          process.env.PB_SUPERUSER_EMAIL,
          process.env.PB_SUPERUSER_PASSWORD
        );
      } catch (err) {
        console.error('Failed superuser auth:', err);
      }
    }
  }
  cached = pb;
  return pb;
}
