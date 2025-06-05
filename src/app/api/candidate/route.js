import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/models/Candidate';
import { ProgressSchema } from '@/models/Candidate';

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const filters = {};

    // === ФИЛЬТРЫ ===
    const interviewId = searchParams.get('interviewId');
    const company = searchParams.get('company');
    const position = searchParams.get('position');
    const owners = searchParams.getAll('owners');
    const search = searchParams.get('s');

    if (interviewId) filters.interviewId = interviewId;
    if (company) filters.company = company;
    if (position) filters.position = position;
    if (owners.length) filters.owners = { $in: owners };
    if (search) filters.position = { $regex: search, $options: 'i' };

    // === ПАГИНАЦИЯ ===
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const totalCount = await Candidate.countDocuments(filters);
    const totalPages = Math.ceil(totalCount / limit);

    const candidates = await Candidate.find(filters)
      .sort({ totalScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id company position interviewId name totalScore createdAt');

    return NextResponse.json({
      success: true,
      candidates,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении данных кондидата:', error);
    return NextResponse.json({ success: false, candidates: [], error: 'Ошибка при получении данных' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const result = ProgressSchema.safeParse(body);
    if (!result.success) {
      const errorMessages = result.error.errors.map((e, index) => `${index + 1}) ${e.message}`).join('; ');
      return NextResponse.json({ message: errorMessages }, { status: 400 });
    }

    const data = result.data;

    const candidate = await Candidate.create(data);

    return NextResponse.json({ success: true, candidate }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании кандидата:', error);
    return NextResponse.json({ success: false, error: 'Ошибка при создании кандидата' }, { status: 500 });
  }
}
