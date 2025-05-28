import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Interview } from '@/models/Interview';

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('s')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const difficulty = searchParams.get('difficulty')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')) || 16));

    const query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    }

    const [interviews, totalCount] = await Promise.all([
      Interview.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('company owners category name description difficulty thumbnail duration')
        .lean(),

      Interview.countDocuments(query),
    ]);

    const response = NextResponse.json({
      success: true,
      interviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });

    // Кэшируем на 4 минуты с возможностью stale-while-revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=240, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error('Ошибка при получении интервью:', error);
    return NextResponse.json({ success: false, error: 'Ошибка при получении данных' }, { status: 500 });
  }
}
