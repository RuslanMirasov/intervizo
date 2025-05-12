import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { progress } = await req.json();

  if (!progress) {
    return Response.json(
      { message: 'Данные для обработки не были переданы. Либо переданы не корректно.' },
      { status: 400 }
    );
  }

  const prompt = `
Ты — опытный технический интервьюер. Вот список вопросов и ответов кандидата. Для каждого:
1. Оцени ответ по шкале от 0.0 до 5.0
2. Напиши краткий и полезный feedback, если ответ неполный, поверхностный или неточный.
3. Верни результат в формате того же массива, но с заполненными полями "score" и "feedback".
4. Также укажи общий средний балл интервью отдельным полем "totalScore".

Пример входа:
[
  {
    "id": 1,
    "question": "...",
    "answer": "...",
    "feedback": null,
    "score": 0
  }
]

Ответ: верни **ТОЛЬКО** валидный JSON внутри тройных кавычек НИКАКИХ ОБЬЯСНЕНИЙ ИЛИ ТЕКСТА:
{
  "progress": [ ...с заполненными feedback и score... ],
  "totalScore": от 0.0 до 5.0
}

Вот входные данные:
${JSON.stringify(progress)}
`;

  console.log(progress);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    console.log(response);

    const content = response.choices[0].message.content;

    const match = content.match(/```json([\s\S]*?)```/i);

    if (!match || !match[1]) {
      throw new Error('Ответ от OpenAI не содержит корректного JSON');
    }

    const json = match[1].trim();
    const parsed = JSON.parse(json);
    return Response.json(parsed);
  } catch (err) {
    console.error('Ошибка при оценке:', err);
    return Response.json({ error: 'Ошибка оценки интервью' }, { status: 500 });
  }
}
