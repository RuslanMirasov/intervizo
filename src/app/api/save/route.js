export const runtime = 'edge';

export async function POST(req) {
  try {
    const { text, filename, voice = 'onyx' } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'No valid text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        input: text,
        response_format: 'mp3',
      }),
    });

    if (!openaiRes.ok || !openaiRes.body) {
      const error = await openaiRes.text();
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Используем переданное имя файла или генерируем автоматически
    const audioFilename = filename || `audio_${Date.now()}.mp3`;

    return new Response(openaiRes.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${audioFilename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
