const { body, param, query, validationResult } = require('express-validator');

// Middleware для обработки ошибок валидации
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Ошибка валидации',
            errors: errors.array(),
        });
    }
    next();
};

// Валидация регистрации
const validateRegister = [
    body('login')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Логин должен быть от 3 до 50 символов')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Логин может содержать только буквы, цифры и подчеркивания'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Пароль должен быть не менее 8 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Пароль должен содержать заглавные и строчные буквы, а также цифры'),
    body('telegram')
        .trim()
        .notEmpty()
        .withMessage('Телеграмм обязателен для заполнения')
        .matches(/^@?[a-zA-Z0-9_]+$/)
        .withMessage('Неверный формат телеграмма'),
    body('room')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Номер комнаты не должен превышать 50 символов'),
    handleValidationErrors,
];

// Валидация входа
const validateLogin = [
    body('login')
        .trim()
        .notEmpty()
        .withMessage('Логин обязателен'),
    body('password')
        .notEmpty()
        .withMessage('Пароль обязателен'),
    handleValidationErrors,
];

// Валидация ID параметра
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID должен быть положительным числом'),
    handleValidationErrors,
];

// Валидация товара
const validateProduct = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Название товара должно быть от 1 до 200 символов'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Цена должна быть положительным числом'),
    body('imageUrl')
        .isURL()
        .withMessage('Неверный формат URL изображения'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Категория обязательна'),
    body('size')
        .trim()
        .notEmpty()
        .withMessage('Размер обязателен'),
    body('unit')
        .trim()
        .notEmpty()
        .withMessage('Единица измерения обязательна'),
    body('inStock')
        .isInt({ min: 0 })
        .withMessage('Количество товара должно быть неотрицательным целым числом'),
    body('type')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Тип не должен превышать 100 символов'),
    handleValidationErrors,
];

// Валидация обновления количества товара
const validateStockUpdate = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID должен быть положительным числом'),
    body('amount')
        .isInt({ min: 0 })
        .withMessage('Количество должно быть неотрицательным целым числом'),
    handleValidationErrors,
];

// Валидация обновления комнаты
const validateRoomUpdate = [
    body('room')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Номер комнаты не должен превышать 50 символов'),
    handleValidationErrors,
];

// Валидация обновления телеграмма
const validateTelegramUpdate = [
    body('telegram')
        .optional()
        .trim()
        .matches(/^@?[a-zA-Z0-9_]+$/)
        .withMessage('Неверный формат телеграмма'),
    handleValidationErrors,
];

// Валидация поискового запроса
const validateSearch = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Поисковый запрос не должен превышать 100 символов'),
    query('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Категория не должна превышать 100 символов'),
    handleValidationErrors,
];

module.exports = {
    validateRegister,
    validateLogin,
    validateId,
    validateProduct,
    validateStockUpdate,
    validateRoomUpdate,
    validateTelegramUpdate,
    validateSearch,
    handleValidationErrors,
};


