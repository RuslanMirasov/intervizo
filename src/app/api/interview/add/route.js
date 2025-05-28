import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Interview, validateInterview } from '@/models/Interview';

export async function POST(request) {
  try {
    await dbConnect();

    const interviewData = await request.json();
    const validation = validateInterview(interviewData);

    if (!validation.success) {
      console.error('Ошибка валидации:', validation.error.errors);
      return NextResponse.json(
        {
          success: false,
          message:
            'Заполните поля: ' + validation.error.errors.map((err, index) => `${index + 1}) ${err.message}; `).join(''),
        },
        { status: 400 }
      );
    }

    const interview = await Interview.create({
      ...validation.data,
    });

    // Возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      message: 'Интервью успешно создано',
      newinterview: {
        _id: interview._id,
        company: interview.company,
        data: interview.data,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка при создании интервью:', error);

    // Обработка ошибок дублирования slug
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: 'Интервью с таким slug уже существует',
        },
        { status: 409 }
      );
    }

    // Обработка ошибок валидации Mongoose
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          message:
            'Ошибка валидации: ' +
            Object.values(error.errors)
              .map(err => err.message)
              .join(', '),
        },
        { status: 400 }
      );
    }

    // Общая ошибка
    return NextResponse.json(
      {
        success: false,
        message: 'Внутренняя ошибка сервера: ' + error.message,
      },
      { status: 500 }
    );
  }
}
