import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const id = formData.get('id');
    const file = formData.get('audio');

    if (!id || !file) {
      return NextResponse.json({ error: 'Missing id or audio file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: (() => {
        const data = new FormData();
        data.append('file', new Blob([buffer], { type: file.type }), 'audio.webm');
        data.append('model', 'whisper-1');
        return data;
      })(),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      return NextResponse.json({ error: err?.error?.message || 'Whisper API failed' }, { status: 500 });
    }

    const result = await openaiRes.json();

    return NextResponse.json({
      id,
      text: result.text,
    });
  } catch (err) {
    console.error('Transcribe error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
