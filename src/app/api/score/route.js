import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { question, answer, questionIndex } = await request.json();

    if (!question || !answer) {
      return NextResponse.json({ error: 'Некорректные данные вопроса' }, { status: 400 });
    }

    console.log(`Получен вопрос ${questionIndex + 1} для оценки:`, question);

    const prompt = `
Ты эксперт по проведению интервью. Твоя задача - оценить один ответ кандидата.

Верни JSON объект с полями:
- score: оценка от 0.0 до 5.0 (где 5.0 - отличный ответ, 0.0 - плохой)
- feedback: конструктивная обратная связь на русском языке (до 100 слов)

Критерии оценки: полнота ответа, релевантность, четкость, профессионализм.

ВАЖНО: Технические фразы типа "Следующий вопрос", "Повторите вопрос", "Можно следующий" и подобные НЕ ДОЛЖНЫ влиять на оценку. Оценивай только содержательную часть ответа.

ВОПРОС: ${question}
ОТВЕТ: ${answer}

ВАЖНО: Верни ТОЛЬКО чистый JSON объект без markdown разметки, без \`\`\`json и без дополнительного текста.
Формат: {"score": 4.2, "feedback": "Ваш отзыв здесь"}
`.trim();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты HR-эксперт. Отвечай только валидным JSON объектом без дополнительного текста.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    console.log(`Ответ от OpenAI для вопроса ${questionIndex + 1}:`, content);

    // Убираем markdown разметку если она есть
    content = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Парсим JSON ответ
    let evaluation;
    try {
      evaluation = JSON.parse(content);
    } catch (parseError) {
      console.error('Ошибка парсинга JSON:', parseError);
      console.error('Контент для парсинга:', content);

      // Fallback оценка
      evaluation = {
        score: 3.0,
        feedback: 'Оценка временно недоступна. Попробуйте позже.',
      };
    }

    // Валидация результата
    if (typeof evaluation.score !== 'number' || evaluation.score < 0 || evaluation.score > 5) {
      evaluation.score = 3.0;
    }

    if (typeof evaluation.feedback !== 'string') {
      evaluation.feedback = 'Обратная связь временно недоступна.';
    }

    console.log(`Обработанный результат для вопроса ${questionIndex + 1}:`, evaluation);

    return NextResponse.json({
      success: true,
      questionIndex,
      data: evaluation,
    });
  } catch (error) {
    console.error('Ошибка при оценке вопроса:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при обработке запроса',
        questionIndex: await request
          .json()
          .then(body => body.questionIndex)
          .catch(() => null),
        data: {
          score: 3.0,
          feedback: 'Сервис оценки временно недоступен. Попробуйте позже.',
        },
        details: error.message,
      },
      { status: 500 }
    );
  }
}
