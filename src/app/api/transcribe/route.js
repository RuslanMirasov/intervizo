import { NextResponse } from 'next/server';

// Константы конфигурации
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (лимит OpenAI)
const ALLOWED_MIME_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
const REQUEST_TIMEOUT = 30000; // 30 секунд

function validateFile(file) {
  if (!file || !file.size) {
    return 'Файл отсутствует или пустой';
  }

  if (file.size > MAX_FILE_SIZE) {
    return `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `Неподдерживаемый тип файла: ${file.type}`;
  }

  return null;
}

function createOpenAIFormData(buffer, mimeType) {
  const formData = new FormData();

  const extension = mimeType.split('/')[1] || 'webm';
  const filename = `audio.${extension}`;

  formData.append('file', new Blob([buffer], { type: mimeType }), filename);
  formData.append('language', 'ru');
  formData.append('model', 'whisper-1');
  formData.append(
    'prompt',
    'Это фрагмент интервью на русском языке с профессионалом. В речи могут использоваться иностранные слова, названия программ, брендов, терминов и инструментов, характерных для сфер: разработка, Data и AI, инфраструктура, тестирование, продукт, дизайн, бизнес, маркетинг, контент, финансы, юридическое, инженерия и наука. Пожалуйста, добавьте правильную пунктуацию, заглавные буквы, технические названия и сохраняйте структуру естественной речи. Пожалуйста, добавьте правильную пунктуацию и заглавные буквы.'
  );
  formData.append('temperature', '0');

  return formData;
}

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY не настроен');
      return NextResponse.json({ error: 'Сервис временно недоступен' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('audio');

    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const openaiFormData = createOpenAIFormData(buffer, file.type);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    let openaiRes;
    try {
      openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: openaiFormData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!openaiRes.ok) {
      let errorMessage = 'Ошибка сервиса транскрибации';

      try {
        const errorData = await openaiRes.json();
        errorMessage = errorData?.error?.message || errorMessage;

        console.error('OpenAI API Error:', {
          status: openaiRes.status,
          statusText: openaiRes.statusText,
          error: errorData,
        });
      } catch (parseError) {
        console.error('Не удалось распарсить ошибку от OpenAI:', parseError);
      }

      const statusCode = openaiRes.status >= 500 ? 502 : 400;
      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    const result = await openaiRes.json();

    if (!result || typeof result.text !== 'string') {
      console.error('Некорректный ответ от OpenAI:', result);
      return NextResponse.json({ error: 'Некорректный ответ от сервиса транскрибации' }, { status: 502 });
    }

    console.log(`Транскрибация выполнена успешно. Длина текста: ${result.text.length} символов`);

    return NextResponse.json({
      text: result.text,

      metadata: {
        duration: result.duration,
        language: result.language,
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Таймаут запроса к OpenAI API');
      return NextResponse.json({ error: 'Превышено время ожидания обработки' }, { status: 408 });
    }

    console.error('Transcribe error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });

    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
