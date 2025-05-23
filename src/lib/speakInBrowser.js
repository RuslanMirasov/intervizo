export const speakInBrowser = async text => {
  if (!text) throw new Error('Текст для озвучки отсутствует');

  if (typeof window === 'undefined' || !window.speechSynthesis) {
    throw new Error('speechSynthesis не поддерживается в этом окружении');
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = 1;
  utterance.pitch = 1;

  // Ждём загрузки голосов, если нужно
  const voices = await new Promise(resolve => {
    const loadedVoices = window.speechSynthesis.getVoices();
    if (loadedVoices.length) {
      resolve(loadedVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });

  // Выбираем русский голос
  const ruVoice = voices.find(v => v.lang === 'ru-RU') || voices[0];
  if (ruVoice) utterance.voice = ruVoice;

  return new Promise((resolve, reject) => {
    utterance.onend = resolve;
    utterance.onerror = reject;
    window.speechSynthesis.speak(utterance);
  });
};
