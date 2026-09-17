export function generateReference(prefix = 'TBB') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}${month}${day}-${random}`;
}

export function generateSKU(
  reference: string,
  pointure: number | string,
  couleur: string
) {
  const slug = couleur
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8);
  return `${reference}-${pointure}-${slug}`;
}

export function generateCodeBarre() {
  return String(Math.floor(Math.random() * 1_000_000_000_000)).padStart(
    13,
    '0'
  );
}