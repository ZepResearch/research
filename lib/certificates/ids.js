export function generateCertificateNo() {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const code = Array.from({ length: 12 }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');
  return `CERT-${code}`;
}

export function generateVerificationCode() {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 8 }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');
}
