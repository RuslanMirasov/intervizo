import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Interview } from '@/models/Interview';
import Candidate from '@/models/Candidate';

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ message: 'ID не передан' }, { status: 400 });
    }

    await dbConnect();

    const deleted = await Interview.findByIdAndDelete(_id);

    if (!deleted) {
      return NextResponse.json({ message: 'Интервью не найдено' }, { status: 404 });
    }

    await Candidate.deleteMany({ interviewId: _id });

    return NextResponse.json({ success: true, message: 'Интервью и связанные кандидаты удалены' }, { status: 200 });
  } catch (error) {
    console.error('Ошибка при удалении интервью:', error);
    return NextResponse.json({ message: 'Ошибка удаления: ' + error.message }, { status: 500 });
  }
}
