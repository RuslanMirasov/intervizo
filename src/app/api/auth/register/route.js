import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: 'Email и пароль обязательны' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Пароль должен содержать минимум 6 символов' }, { status: 400 });
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Пользователь с таким email уже существует' }, { status: 400 });
    }

    // Create user
    const user = await User.create({
      email,
      password: password,
      provider: 'credentials',
      name: name || email.split('@')[0],
    });

    return NextResponse.json({ message: 'Пользователь успешно зарегистрирован', userId: user._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
