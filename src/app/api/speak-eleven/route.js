export const runtime = 'edge';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'No valid text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ElevenLabs API endpoint
    const elevenLabsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/ycbyWsnf4hqZgdpKHqiU', {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elevenLabsRes.ok || !elevenLabsRes.body) {
      const error = await elevenLabsRes.text();
      console.error('ElevenLabs API error:', error);
      return new Response(JSON.stringify({ error: 'ElevenLabs API error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(elevenLabsRes.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('TTS error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
