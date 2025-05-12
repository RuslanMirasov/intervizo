export function isBadText(text) {
  if (!text || text.trim().length < 3) return true;

  const hasCyrillic = /[а-яА-ЯёЁ]/.test(text);
  return !hasCyrillic;
}
