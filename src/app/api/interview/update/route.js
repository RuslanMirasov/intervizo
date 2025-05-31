import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Interview, validateInterview } from '@/models/Interview';

export async function PATCH(request) {
  try {
    await dbConnect();

    const interviewData = await request.json();
    const { _id, data, ...rest } = interviewData;

    if (!_id) {
      return NextResponse.json({ success: false, message: 'Не передан _id' }, { status: 400 });
    }

    // Отфильтровываем поля, которые нужно провести через генерацию аудио
    const updateFields = { ...rest };
    const audioToGenerate = [];

    if (Array.isArray(data)) {
      const existingInterview = await Interview.findById(_id).lean();

      if (!existingInterview) {
        return NextResponse.json({ success: false, message: 'Интервью для обновления не найдено' }, { status: 404 });
      }

      const newIds = new Set(data.map(item => item.id));

      // 1. Удалённые элементы с audio → помечаем на удаление
      for (const oldItem of existingInterview.data) {
        if (!newIds.has(oldItem.id) && oldItem.audio) {
          audioToGenerate.push({ ...oldItem, todo: 'delete' });
        }
      }

      // 2. Новые или изменённые элементы → помечаем на генерацию
      for (const newItem of data) {
        const oldItem = existingInterview.data.find(item => item.id === newItem.id);
        const isNew = !newItem.audio;
        const isChanged = oldItem?.audio && oldItem.text !== newItem.text;

        if (isNew || isChanged) {
          audioToGenerate.push({ ...newItem, todo: 'generate' });
        }
      }

      updateFields.data = data;
    }

    // Обновляем все поля, включая data
    const updated = await Interview.findByIdAndUpdate(_id, { $set: updateFields }, { new: true, runValidators: true })
      .select('-__v -createdAt -updatedAt')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Интервью успешно обновлено',
      updatedinterview: {
        _id: updated._id,
        company: updated.company,
        data: audioToGenerate,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка при обновлении интервью:', error);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера: ' + error.message }, { status: 500 });
  }
}
