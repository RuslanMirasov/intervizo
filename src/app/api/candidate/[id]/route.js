import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { isValidObjectId } from 'mongoose';

export async function GET(req, { params }) {
  const { id } = await params;

  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: 'Некорректный ID' }, { status: 400 });
  }

  try {
    await dbConnect();

    const candidate = await Candidate.findById(id).lean();

    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Кандедат не найден' }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      candidate,
    });

    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Ошибка при получении данных кандидата:', error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: 'Некорректный ID' }, { status: 400 });
  }

  try {
    await dbConnect();

    const deleted = await Candidate.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Кандидат не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Кандидат удалён' });
  } catch (error) {
    console.error('Ошибка при удалении кандидата:', error);
    return NextResponse.json({ success: false, message: 'Ошибка сервера' }, { status: 500 });
  }
}
