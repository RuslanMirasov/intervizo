import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/models/Candidate';

export async function POST(req) {
  try {
    await dbConnect();

    const { email, interviewId } = await req.json();

    if (!email || !interviewId) {
      return NextResponse.json({ message: 'email и interviewId обязательны' }, { status: 400 });
    }

    const exists = await Candidate.exists({ email, interviewId });

    if (exists) {
      return NextResponse.json({ message: 'Кандидат уже проходил это интервью' }, { status: 409 });
    }

    return NextResponse.json({ success: true, exists: false });
  } catch (error) {
    console.error('Ошибка при проверке кандидата:', error);
    return NextResponse.json({ error: 'Ошибка на сервере' }, { status: 500 });
  }
}
