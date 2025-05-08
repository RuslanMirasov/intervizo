import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ message: 'Данные не переданы' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      return Response.json({ message: 'Не удалось разобрать JSON из ответа OpenAI', raw: content }, { status: 500 });
    }

    return Response.json(parsed);
  } catch (err) {
    console.error('[generate-interview] GPT error:', err);
    return Response.json(
      {
        message: 'При попытке сгенерировать интервью произошла ошибка. Попробуйте повторить позже.',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
