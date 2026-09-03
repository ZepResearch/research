export function isAdminUser(user) {
  if (!user) return false;
  return (
    user.admin === true &&
    user.verified === true &&
    typeof user.email === 'string' &&
    user.email.toLowerCase().endsWith('@zepresearch.com')
  );
}
