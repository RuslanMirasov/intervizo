import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false, // сделал поле не обязательным как просил пользователь
      trim: true,
      maxlength: [100, 'Имя не может быть длиннее 100 символов'],
    },
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Пожалуйста, введите корректный email'],
    },
    password: {
      type: String,
      required: function () {
        // Пароль обязателен только для credentials авторизации
        return !this.provider || this.provider === 'credentials';
      },
      minlength: [6, 'Пароль должен содержать минимум 6 символов'],
      select: false, // По умолчанию не включать пароль в запросы
    },
    role: {
      type: String,
      enum: ['hr', 'boss'], // только 2 роли как просил пользователь
      default: 'hr', // по умолчанию hr
    },
    image: {
      type: String, // название поля как в NextAuth стандарте
      required: false, // не обязательное поле
      default: null,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    providerId: {
      type: String,
      default: null,
    },
  },
  {}
);

// Индексы для оптимизации
UserSchema.index({ provider: 1, providerId: 1 });

// Хэширование пароля перед сохранением
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для проверки пароля
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  try {
    const result = await bcrypt.compare(candidatePassword, this.password);
    return result;
  } catch (error) {
    return false;
  }
};

UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    image: this.image,
    role: this.role,
    provider: this.provider,
  };
};

// Статический метод для поиска или создания пользователя OAuth
UserSchema.statics.findOrCreateOAuthUser = async function (profile, provider) {
  let user = await this.findOne({
    $or: [{ email: profile.email }, { provider: provider, providerId: profile.id }],
  });

  if (user) {
    user.name = user.name || profile.name;
    user.image = user.image || profile.picture;
    // Добавляем OAuth данные если их не было
    if (!user.provider || user.provider === 'credentials') {
      user.provider = provider;
      user.providerId = profile.id;
    }
    await user.save();
    return user;
  }

  // Создаем нового пользователя
  user = new this({
    name: profile.name,
    email: profile.email,
    image: profile.picture,
    provider: provider,
    providerId: profile.id,
  });

  await user.save();
  return user;
};

// Предотвращаем повторную компиляцию модели
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
