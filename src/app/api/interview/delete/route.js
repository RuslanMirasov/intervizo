import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Interview, validateInterview } from '@/models/Interview';

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return new Response(JSON.stringify({ error: 'ID не передан' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const deleted = await Interview.findByIdAndDelete(_id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Интервью не найдено' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Интервью удалено' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Ошибка при удалении интервью:', error);
    return new Response(JSON.stringify({ error: 'Ошибка удаления: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
