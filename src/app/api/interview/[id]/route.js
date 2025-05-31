import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Interview } from '@/models/Interview';
import { isValidObjectId } from 'mongoose';

export async function GET(req, { params }) {
  const { id } = await params;

  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ success: false, error: 'Некорректный ID' }, { status: 400 });
  }

  try {
    await dbConnect();

    const interview = await Interview.findById(id).lean();

    if (!interview) {
      return NextResponse.json({ success: false, error: 'Интервью не найдено' }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      interview,
    });

    // Только Cache-Control без ETag
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Ошибка при получении интервью:', error);
    return NextResponse.json({ success: false, error: 'Ошибка сервера' }, { status: 500 });
  }
}
