import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Interview } from '@/models/Interview';

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const interview = await Interview.findById(id);

    if (!interview) {
      return NextResponse.json({ success: false, error: 'Интервью не найдено' }, { status: 404 });
    }

    return NextResponse.json({ success: true, interview });
  } catch (error) {
    console.error('Ошибка при получении интервью:', error);
    return NextResponse.json({ success: false, error: 'Ошибка сервера' }, { status: 500 });
  }
}
