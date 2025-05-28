import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import dbConnect from '@/lib/mongodb';
import { Interview } from '@/models/Interview';

export async function POST(req) {
  try {
    const body = await req.json();
    const { _id, company, index, item } = body;

    if (!_id || !company || typeof index === 'undefined' || !item?.text) {
      return new Response(JSON.stringify({ error: 'Неверные данные запроса' }), { status: 400 });
    }

    // Генерация аудио через ElevenLabs
    const elevenLabsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/ycbyWsnf4hqZgdpKHqiU', {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: item.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!elevenLabsRes.ok) {
      const errorText = await elevenLabsRes.text();
      console.error('Ошибка генерации аудио:', errorText);
      return new Response(JSON.stringify({ error: 'Ошибка генерации аудио' }), { status: 500 });
    }

    const audioBuffer = await elevenLabsRes.arrayBuffer();

    // Путь в Firebase Storage
    const fileRef = ref(storage, `InterVizo/${company}/${_id}/${index}.mp3`);

    // Загрузка в Firebase
    await uploadBytes(fileRef, new Uint8Array(audioBuffer), {
      contentType: 'audio/mpeg',
    });

    const audioURL = await getDownloadURL(fileRef);

    await dbConnect();

    await Interview.updateOne({ _id, 'data.id': item.id }, { $set: { 'data.$.audio': audioURL } });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка в api/firebase:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
