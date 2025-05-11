export async function transcribeVoice(id, blob, setProgress) {
  try {
    const form = new FormData();
    form.append('id', id);
    form.append('audio', blob, 'audio.webm');

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(error || 'Ошибка транскрибации');
    }

    const { text } = await res.json();

    // Обновляем progress через setProgress
    setProgress(prev => prev.map(entry => (entry.id === id ? { ...entry, answer: text } : entry)));
  } catch (err) {
    console.error('Ошибка transcribeVoice:', err);
  }
}
