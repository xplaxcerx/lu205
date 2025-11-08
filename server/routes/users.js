const router = require('express').Router();
const { User, Cart, Favorite } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const {
    validateRegister,
    validateLogin,
    validateRoomUpdate,
    validateTelegramUpdate,
} = require('../middleware/validation');

// Регистрация
router.post('/register', authLimiter, validateRegister, async (req, res) => {
    try {
        const { login, password, room, telegram } = req.body;

        if (!login || !password) {
            return res.status(400).json({ message: 'Логин и пароль обязательны' });
        }

        if (!telegram || telegram.trim() === '') {
            return res.status(400).json({ message: 'Телеграмм обязателен для заполнения' });
        }

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ where: { login } });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Обрабатываем telegram - сохраняем только @username
        let telegramValue = telegram.trim();
        telegramValue = telegramValue.replace(/^https?:\/\/(www\.)?t\.me\//, '').replace(/^t\.me\//, '').replace(/^@/, '');
        
        if (!telegramValue || telegramValue.trim() === '') {
            return res.status(400).json({ message: 'Телеграмм обязателен для заполнения' });
        }
        
        telegramValue = `@${telegramValue}`;

        // Создаем пользователя
        const user = await User.create({
            login,
            password: hashedPassword,
            room: room || null,
            telegram: telegramValue,
            role: 'user' // По умолчанию роль user
        });

        // Создаем корзину для пользователя
        await Cart.create({
            userId: user.id
        });

        // Создаем список избранного для пользователя
        await Favorite.create({
            userId: user.id
        });

        // Создаем JWT токен
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Ошибка конфигурации сервера' });
        }
        const token = jwt.sign(
            { 
                id: user.id.toString(), 
                login: user.login,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const userData = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            token,
            user: userData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Авторизация
router.post('/login', authLimiter, validateLogin, async (req, res) => {
    try {
        const { login, password } = req.body;

        // Ищем пользователя и связанные данные через Promise.all
        const [user] = await Promise.all([
            User.findOne({ where: { login } })
        ]);
        
        if (!user) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        // Проверяем пароль
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }

        // Создаем JWT токен
        const tokenPayload = { 
            id: user.id.toString(), 
            login: user.login,
            role: user.role 
        };
        
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Ошибка конфигурации сервера' });
        }
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Получаем полные данные пользователя и корзину параллельно
        const [userData] = await Promise.all([
            User.findByPk(user.id, {
                attributes: { exclude: ['password'] }
            })
        ]);

        res.json({
            token,
            user: userData
        });
    } catch (error) {
        res.status(500).json({ 
            message: process.env.NODE_ENV === 'production' 
                ? 'Ошибка авторизации' 
                : error.message 
        });
    }
});

// Получить информацию о текущем пользователе
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Изменить комнату
router.put('/room', authMiddleware, validateRoomUpdate, async (req, res) => {
    try {
        const { room } = req.body;
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        await user.update({ room });

        res.json({
            id: user.id,
            login: user.login,
            room: user.room
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Изменить Telegram
router.put('/telegram', authMiddleware, validateTelegramUpdate, async (req, res) => {
    try {
        const { telegram } = req.body;
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        let telegramValue = telegram;
        if (telegramValue) {
            telegramValue = telegramValue.replace(/^https?:\/\/(www\.)?t\.me\//, '').replace(/^t\.me\//, '').replace(/^@/, '');
            telegramValue = telegramValue ? `@${telegramValue}` : null;
        }

        await user.update({ telegram: telegramValue || null });

        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
