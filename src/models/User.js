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
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Пожалуйста, введите корректный email'],
    },
    password: {
      type: String,
      required: function () {
        // Пароль обязателен только для credentials авторизации
        return !this.provider || this.provider === 'credentials';
      },
      select: false, // По умолчанию не включать пароль в запросы
    },
    role: {
      type: String,
      enum: ['hr', 'boss', 'admin'], // только 2 роли как просил пользователь
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
  { timestamps: true }
);

// Индексы для оптимизации
// UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ provider: 1, providerId: 1 }, { unique: false });

// Хэширование пароля перед сохранением
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для проверки пароля
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    return false;
  }
};

UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    image: this.image,
    role: this.role,
    provider: this.provider,
  };
};

// Статический метод для поиска или создания пользователя OAuth
UserSchema.statics.findOrCreateOAuthUser = async function (profile, provider) {
  let user =
    (profile.email && (await this.findOne({ email: profile.email }))) ||
    (await this.findOne({ provider, providerId: profile.id }));

  if (user) {
    if (!user.providerId) user.providerId = profile.id;
    if (!user.image && profile.picture) user.image = profile.picture;
    if (!user.name && profile.name) user.name = profile.name;

    await user.save();
    return user;
  }

  // создаём нового
  user = new this({
    name: profile.name || null,
    email: profile.email,
    image: profile.picture || null,
    provider: provider,
    providerId: profile.id,
  });

  await user.save();
  return user;
};

// Предотвращаем повторную компиляцию модели
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
