const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Настройка Helmet для защиты заголовков
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
});

// Rate limiting для API
// В development режиме более мягкие лимиты или отключен через DISABLE_RATE_LIMIT
const apiLimiter = process.env.DISABLE_RATE_LIMIT === 'true' 
    ? (req, res, next) => next() // Отключаем rate limiting
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 минут
        max: process.env.NODE_ENV === 'production' ? 100 : 1000, // в development больше лимит
        message: 'Слишком много запросов с этого IP, попробуйте позже',
        standardHeaders: true,
        legacyHeaders: false,
    });

// Строгий rate limiting для авторизации
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // максимум 5 попыток входа
    message: 'Слишком много попыток входа, попробуйте позже',
    skipSuccessfulRequests: true,
});

// Rate limiting для админ-панели
const adminLimiter = process.env.DISABLE_RATE_LIMIT === 'true'
    ? (req, res, next) => next() // Отключаем rate limiting
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: process.env.NODE_ENV === 'production' ? 50 : 500, // в development больше лимит
        message: 'Слишком много запросов к админ-панели',
    });

// Защита от NoSQL injection
const sanitizeInput = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Попытка NoSQL injection обнаружена: ${key}`);
    },
});

// Защита от HTTP Parameter Pollution
const hppProtection = hpp();

module.exports = {
    helmetConfig,
    apiLimiter,
    authLimiter,
    adminLimiter,
    sanitizeInput,
    hppProtection,
};


