import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Функция для генерации уникального ID (24 символа, как MongoDB ObjectId)
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomBytes = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
  ).join('');
  return (timestamp + randomBytes).slice(0, 24);
}

const SYSTEM_PROMPT = `
Ты — опытный HR-специалист с многолетним стажем проведения собеседований. Твоя задача — создать или дополнить структуру интервью на основе запроса пользователя.

ВАЖНЫЕ ПРАВИЛА:
1. Отвечай ТОЛЬКО в формате JSON — никаких комментариев, пояснений или дополнительного текста
2. НЕ ПЕРЕЗАПИСЫВАЙ существующие данные — только дополняй пустые поля
3. Если поле уже заполнено — оставь его без изменений
4. Создавай реалистичные, профессиональные вопросы для живого собеседования

ФОРМАТ ОТВЕТА:
{
  "slug": "строка-через-дефис",
  "name": "Название позиции/интервью", 
  "category": "Разработка" | "Data и AI" | "Инфраструктура" | "Тестирование" | "Продукт" | "Дизайн" | "Бизнес" | "Маркетинг" | "Контент" | "Финансы" | "Юридическое" | "Инженерия" | "Наука" | "Другие",
  "description": "Краткое описание (до 200 символов)",
  "thumbnail": "#ECEFF5" | "#D5F6ED" | "#E2DBF9" | "#E0F3FF" | "#C2C2C2" | "#FBE2F3" | "#D5F6ED" | "#E0F3FF" | "#E2DBF9" | "#ECEFF5" | "#FFE1CB" | "#D5F6ED" | "#FBE2F3" | "#ECEFF5" | ,
  "duration": "число_минут по умолчанию 20",
  "difficulty": "Легкое" | "Среднее" | "Сложное",
  "data": [массив_вопросов_и_сообщений]
}

СТРУКТУРА data:
- Каждый элемент имеет: {"id": "24_символа", "type": "question"|"message", "text": "текст"}
- Начинай с приветственного message
- Добавляй логичное количество question (примерно 1 вопрос на 3-4 минуты интервью)
- Заканчивай благодарственным message
- Вопросы должны быть разнообразными: технические, поведенческие, ситуационные
- Используй профессиональный, но дружелюбный тон

ЛОГИКА ЗАПОЛНЕНИЯ:
- slug: генерируй только если пустой (на основе name, через дефисы)
- name: заполняй только если пустой (на основе запроса пользователя)
- category: заполняй только если пустой (выбрать из списка)
- thumbnail: заполняй только если пустой (выбрать из списка, порядок списка соответствует категориям например если category = "Инфраструктура" она 3-я в списке, то thumbnail будет #E2DBF9 тоже 3-й из списка)
- description: заполняй только если пустой (краткое описание позиции)
- duration: заполняй только если пустой (по умолчанию "20")
- difficulty: определяй на основе сложности позиции и вопросов
- data: ДОПОЛНЯЙ существующие элементы, не заменяй их

Создавай качественные, релевантные вопросы, которые реально задают на собеседованиях.
`.trim();

export async function POST(req) {
  try {
    const { prompt, existingInterview } = await req.json();

    if (!prompt) {
      return Response.json({ message: 'Запрос пользователя не передан' }, { status: 400 });
    }

    const fullPrompt = `
${SYSTEM_PROMPT}

СУЩЕСТВУЮЩИЕ ДАННЫЕ ИНТЕРВЬЮ:
${JSON.stringify(existingInterview || {}, null, 2)}

ЗАПРОС ПОЛЬЗОВАТЕЛЯ:
${prompt.trim()}

Дополни или создай структуру интервью, сохранив все существующие данные.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Ты — профессиональный HR-специалист. Отвечай только валидным JSON без дополнительного текста.',
        },
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';

    let parsed;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanContent);

      // Генерируем ID для новых элементов data, если они отсутствуют
      if (parsed.data && Array.isArray(parsed.data)) {
        parsed.data = parsed.data.map(item => ({
          ...item,
          id: item.id || generateObjectId(),
        }));
      }
    } catch (err) {
      console.error('[generate-interview] JSON parse error:', err);
      console.error('Raw content:', content);
      return Response.json(
        {
          message: 'Не удалось разобрать JSON из ответа ИИ. Попробуйте переформулировать запрос.',
          raw: content,
        },
        { status: 500 }
      );
    }

    return Response.json(parsed);
  } catch (err) {
    console.error('[generate-interview] GPT error:', err);
    return Response.json(
      {
        message: 'При генерации интервью произошла ошибка. Попробуйте повторить позже.',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
