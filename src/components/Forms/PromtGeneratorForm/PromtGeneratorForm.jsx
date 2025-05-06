'use client';

import { useState } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';
import useRequest from '@/hooks/useRequest';
import { Button } from '@/components';
import css from './PromtGeneratorForm.module.scss';

const systemPrompt = `
Ты выступаешь в роли HR-специалиста. Твоя задача — сгенерировать структуру интервью на основе запроса пользователя на русском языке.  
Ответ должен быть в формате JSON — **без комментариев, пояснений или текста до или после**. Только чистый JSON-объект.

Вот формат, в котором ты должен вернуть результат:

{
  "slug": "<Заполнить только если поле пустое! (используя значение из 'name')>",
  "name": "<Заполнить только если поле пустое! (на основе запроса пользователя)>",
  "category": "<Не трогать, оставить как есть!>",
  "description": "<Заполни только если поле пустое! кратко, до 200 символов, по теме запроса пользователя>",
  "thumbnail": "<Не трогать, оставить как есть!>",
  "duration": <Заполни только если поле пустое. Это примерная продолжительность интервью в минутах. Эту продолжительность возьми из запроса пользователя, по умолчанию 20>,
  "difficulty": "<Заполни только если поле пустое. Возможные значения: 'Легкое', 'Среднее', 'Сложное'. Определи сложность самостоятельно на основе запроса пользователя и сгенерированных вопросов>",
  "data": [
    // Это основное содержимое интервью. Ты генерируешь его полностью самостоятельно.
    {
      "id": "<Уникальный идентификатор длиной 24 символа (как в MongoDB)>",
      "type": "question" | "message",
      "text": "<Текст вопроса или сообщения>"
    },
    ...
  ]
}

🔸 Структура "data" обязательна — даже если она частично заполнена. Создай новую структуру, при необходимости используя имеющиеся данные как дополнительную информацию.  
🔸 В массиве "data" сначала добавь один приветственный "message".  
🔸 Далее сгенерируй логичное количество "question", соответствующее предполагаемой продолжительности интервью.  
Если пользователь указал длительность — ориентируйся на неё. Если нет — рассчитай приблизительно (интервью на 20 минут обычно включает 5-7 вопросов).  
🔸 Вопросы должны быть реалистичными, релевантными и максимально приближёнными к настоящему живому собеседованию.  
🔸 Заверши интервью финальным "message", в котором благодарим участника за прохождение.
`.trim();

const PromtGeneratorForm = () => {
  const [prompt, setPrompt] = useState('');
  const { interview, setInterview } = useInterview();
  const { openPopup, closePopup } = usePopup();

  const { trigger, isMutating } = useRequest({ url: '/api/generate-interview', method: 'POST' });

  const handleSubmit = async e => {
    e.preventDefault();

    openPopup({
      type: 'loading',
      locked: true,
      subtitle: 'ИИ-ассистент составляет интервью по вашему запросу. Это займёт некоторое время.',
    });

    const fullPrompt = `
      ${systemPrompt}
      Вот стартовые данные:
      ${JSON.stringify(interview, null, 2)}
      Вот запрос пользователя:
      ${prompt}
    `.trim();

    const generated = await trigger({ prompt: fullPrompt });

    if (generated) {
      closePopup();
      setInterview(generated);
    }
  };

  return (
    <form className={css.PromtGeneratorForm} onSubmit={handleSubmit} noValidate>
      <span>
        Вы можете воспользоваться ИИ-ассистентом — он добавит необходимые вопросы. <br />
        Также вы сможете редактировать их далее.
      </span>
      <label>
        <input
          type="text"
          name="prompt"
          placeholder="Для какой должности хотели бы провести интервью?"
          onChange={e => setPrompt(e.target.value)}
          required
        />
      </label>
      <Button type="submit" disabled={isMutating}>
        Создать
      </Button>
    </form>
  );
};

export default PromtGeneratorForm;
