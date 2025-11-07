const router = require('express').Router();
const { Product } = require('../models');
const { Op } = require('sequelize');

// Получить все товары
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let whereClause = {};

        if (category && category !== '0' && category !== 'Все') {
            whereClause.category = {
                [Op.iLike]: category
            };
        }

        if (search) {
            whereClause.title = {
                [Op.iLike]: `%${search}%` // Поиск без учета регистра
            };
        }

        const products = await Product.findAll({
            where: whereClause,
            order: [['title', 'ASC']]
        });
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить товар по ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Добавить новый товар
router.post('/', async (req, res) => {
    try {
        const { title, price, imageUrl, category, size, unit, rating, reviews, article, brand, inStock } = req.body;
        const product = await Product.create({
            title,
            price,
            imageUrl,
            category: category || '',
            size,
            unit,
            rating,
            reviews,
            article,
            brand,
            inStock
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Обновить товар
router.put('/:id', async (req, res) => {
    try {
        const { title, price, imageUrl, category, size, unit, type, inStock } = req.body;
        
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        await product.update({
            title,
            price,
            imageUrl,
            category: category || product.category,
            size,
            unit,
            type,
            inStock
        });

        res.json(product);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Удалить товар
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        await product.destroy();
        res.json({ message: 'Товар удален' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать тестовые продукты
router.post('/seed', async (req, res) => {
    try {
        const testProducts = [
            {
                title: 'Вода питьевая ЗДОРОВАЯ ВОДА Акварояль негазированная',
                price: 24.99,
                imageUrl: 'https://cdn.lentochka.lenta.com/resample/webp/900x900/photo/720109/0c4c3e54-44aa-4645-b067-e304f2d1d5cf.png',
                category: categories.indexOf('Вода'),
                size: 500,
                unit: 'мл',
                rating: 5.0,
                reviews: 1,
                article: '720109',
                brand: 'ЗДОРОВАЯ ВОДА',
                inStock: 513
            },
            {
                title: 'Лапша DOSHIRAK со вкусом говядины',
                price: 59.99,
                imageUrl: 'https://cdn.lentochka.lenta.com/resample/webp/900x900/photo/51625/081b3dd6-9b60-47ec-a0a2-4db40842b853.png',
                category: categories.indexOf('Быстрое приготовление'),
                size: 90,
                unit: 'г',
                rating: 4.9,
                reviews: 185,
                article: '051625',
                brand: 'DOSHIRAK',
                inStock: 100
            },
            {
                title: 'Напиток энергетический BURN сильногазированный',
                price: 109.99,
                imageUrl: 'https://cdn.lentochka.lenta.com/resample/webp/900x900/photo/534125/6e159272-e186-46cf-9dd3-3b7781a04e3e.png',
                category: categories.indexOf('Энергетики'),
                size: 449,
                unit: 'мл',
                rating: 4.8,
                reviews: 95,
                article: '534125',
                brand: 'BURN',
                inStock: 100
            }
        ];

        const products = await Product.bulkCreate(testProducts);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
