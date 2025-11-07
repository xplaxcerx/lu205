const router = require('express').Router();
const { Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Логируем все запросы
router.use((req, res, next) => {
    console.log('Admin route request:', {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Middleware для проверки прав админа
const adminMiddleware = async (req, res, next) => {
    try {
        console.log('adminMiddleware: Checking authorization');
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('adminMiddleware: No token found');
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('adminMiddleware: Token decoded:', decoded);

        const user = await User.findByPk(decoded.id);
        if (!user || user.role !== 'admin') {
            console.log('adminMiddleware: User not found or not admin');
            return res.status(403).json({ message: 'Нет прав администратора' });
        }

        req.user = user;
        console.log('adminMiddleware: Authorization successful');
        next();
    } catch (error) {
        console.error('adminMiddleware error:', error);
        res.status(401).json({ message: 'Неверный токен' });
    }
};

// Добавление нового товара
router.post('/products', adminMiddleware, async (req, res) => {
    try {
        const { title, price, imageUrl, category, size, unit, type, inStock } = req.body;

        // Проверяем обязательные поля
        if (!title || !price || !imageUrl || !category || !size || !unit || !inStock) {
            return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
        }

        // Проверяем, что inStock это число
        if (isNaN(inStock) || inStock < 0) {
            return res.status(400).json({ message: 'Количество товара должно быть положительным числом' });
        }

        // Проверяем, существует ли товар с таким названием (без учёта регистра)
        const existingProduct = await Product.findOne({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('title')), 
                sequelize.fn('LOWER', title.trim())
            )
        });

        if (existingProduct) {
            return res.status(400).json({ message: 'Товар с таким названием уже существует' });
        }

        const product = await Product.create({
            title: title.trim(), // убираем лишние пробелы
            price,
            imageUrl,
            category,
            size,
            unit,
            type,
            inStock: parseInt(inStock)
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Изменить количество товара
router.patch('/products/:id/stock', adminMiddleware, async (req, res) => {
    try {
        console.log('PATCH /products/:id/stock');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        
        const { id } = req.params;
        const { amount } = req.body;

        if (typeof amount !== 'number') {
            return res.status(400).json({ message: 'amount должен быть числом' });
        }

        if (amount < 0) {
            return res.status(400).json({ message: 'Количество товара не может быть отрицательным' });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        console.log('Current inStock:', product.inStock);
        console.log('New amount:', amount);

        await product.update({ inStock: amount });
        res.json({ message: 'Количество товара обновлено', inStock: amount });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: error.message });
    }
});

// Удалить товар
router.delete('/products/:id', adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        await product.destroy();
        res.json({ message: 'Товар удален' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
});

// Получение списка всех товаров для админ-панели
router.get('/products', adminMiddleware, async (req, res) => {
    try {
        const { category, search = '' } = req.query;

        // Формируем условия поиска
        const whereConditions = {
            [Op.and]: []
        };

        // Добавляем условие категории, если указана
        if (category && category !== '0' && category !== 'Все') {
            whereConditions.category = {
                [Op.iLike]: category
            };
        }

        // Добавляем условие поиска, если не пустое
        if (search.trim()) {
            whereConditions[Op.and].push(
                sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('title')),
                    { [Op.like]: `%${search.toLowerCase().trim()}%` }
                )
            );
        }

        const products = await Product.findAll({
            where: whereConditions[Op.and].length ? whereConditions : {},
            order: [['title', 'ASC']] // Сортировка по названию
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Полное редактирование товара
router.put('/products/:id', adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Request body:', req.body);
        console.log('Request params:', req.params);
        
        const { title, price, imageUrl, category, size, unit, type, inStock } = req.body;
        console.log('Destructured data:', { title, price, imageUrl, category, size, unit, type, inStock });

        // Проверяем обязательные поля
        if (!title || !price || !imageUrl || !category || !size || !unit || !inStock) {
            return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
        }

        // Проверяем, что inStock это число
        if (isNaN(inStock) || inStock < 0) {
            return res.status(400).json({ message: 'Количество товара должно быть положительным числом' });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Проверяем, существует ли другой товар с таким же названием
        const existingProduct = await Product.findOne({
            where: {
                title: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('title')), 
                    sequelize.fn('LOWER', title.trim())
                ),
                id: { [Op.ne]: id } // используем Op напрямую из sequelize
            }
        });

        if (existingProduct) {
            return res.status(400).json({ message: 'Товар с таким названием уже существует' });
        }

        console.log('About to update product with data:', {
            title: title.trim(),
            price,
            imageUrl,
            category,
            size,
            unit,
            type,
            inStock: parseInt(inStock)
        });

        // Обновляем все поля товара
        await product.update({
            title: title.trim(),
            price,
            imageUrl,
            category,
            size,
            unit,
            type,
            inStock: parseInt(inStock)
        });

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
