export function generateId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return (timestamp + random).padEnd(24, '0');
}
