import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { progress } = await request.json();

    if (!progress || !Array.isArray(progress)) {
      return NextResponse.json({ error: 'Некорректные данные прогресса' }, { status: 400 });
    }

    console.log('Получены данные для оценки:', progress);

    const prompt = `
Ты эксперт по проведению интервью. Твоя задача - оценить ответы кандидата.

Верни точно такой же JSON массив, но заполни поля:
- score: оценка от 0.0 до 5.0 (где 5.0 - отличный ответ, 0.0 - плохой)
- feedback: конструктивная обратная связь на русском языке

Критерии оценки: полнота ответа, релевантность, четкость, профессионализм.

ВАЖНО: Технические фразы типа "Следующий вопрос", "Повторите вопрос", "Можно следующий" и подобные НЕ ДОЛЖНЫ влиять на оценку. Это команды управления приложением, а не часть профессионального ответа. Оценивай только содержательную часть ответа.

Массив для оценки:
${JSON.stringify(progress, null, 2)}

ВАЖНО: Верни ТОЛЬКО чистый JSON массив без markdown разметки, без \`\`\`json и без дополнительного текста.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    console.log('Ответ от OpenAI:', content);

    // Убираем markdown разметку если она есть
    content = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    console.log('Очищенный контент:', content);

    // Парсим JSON ответ
    let evaluatedProgress;
    try {
      evaluatedProgress = JSON.parse(content);
    } catch (parseError) {
      console.error('Ошибка парсинга JSON:', parseError);
      console.error('Контент для парсинга:', content);
      throw new Error('Некорректный ответ от OpenAI');
    }

    console.log('Обработанный результат:', evaluatedProgress);

    return NextResponse.json({
      success: true,
      data: evaluatedProgress,
    });
  } catch (error) {
    console.error('Ошибка при оценке интервью:', error);
    return NextResponse.json(
      {
        error: 'Ошибка при обработке запроса',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
