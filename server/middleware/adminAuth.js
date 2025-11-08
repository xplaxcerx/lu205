const jwt = require('jsonwebtoken');
const { User } = require('../models');

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Ошибка конфигурации сервера' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Нет прав администратора' });
        }

        req.user = {
            id: user.id,
            login: user.login,
            role: user.role
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Токен истек' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Неверный токен' });
        }
        return res.status(401).json({ message: 'Ошибка аутентификации' });
    }
};

module.exports = adminAuthMiddleware;

