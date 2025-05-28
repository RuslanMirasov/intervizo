import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Interview } from '@/models/Interview';

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const s = searchParams.get('s');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '16');
    const count = parseInt(searchParams.get('count') || '0');

    const query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (s) query.name = { $regex: s, $options: 'i' };

    const interviews = await Interview.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(count || limit);

    const total = await Interview.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: interviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Ошибка при получении интервью:', error);
    return NextResponse.json({ success: false, error: 'Ошибка сервера' }, { status: 500 });
  }
}
