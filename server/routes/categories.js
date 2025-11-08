const router = require('express').Router();
const { Product } = require('../models');
const { Op } = require('sequelize');
const adminAuthMiddleware = require('../middleware/adminAuth');
const { adminLimiter } = require('../middleware/security');
const { validateSearch } = require('../middleware/validation');

// Получить все категории
router.get('/', validateSearch, async (req, res) => {
    try {
        const categories = await Product.findAll({
            attributes: [
                [Product.sequelize.fn('DISTINCT', Product.sequelize.col('category')), 'category']
            ],
            order: [['category', 'ASC']]
        });

        // Преобразуем результат в массив категорий
        const categoryList = categories.map(item => item.category);
        res.json(categoryList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить товары по категории
router.get('/:category/products', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.findAll({
            where: {
                category: {
                    [Op.iLike]: category // Поиск без учета регистра
                }
            },
            order: [['title', 'ASC']]
        });
        
        if (products.length === 0) {
            return res.status(404).json({ message: 'Товары в данной категории не найдены' });
        }
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать новую категорию (только для админа)
router.post('/', adminLimiter, adminAuthMiddleware, async (req, res) => {
    try {
        const { category } = req.body;
        
        if (!category || !category.trim()) {
            return res.status(400).json({ message: 'Название категории обязательно' });
        }

        // Проверяем, существует ли уже такая категория
        const existingCategory = await Product.findOne({
            where: {
                category: {
                    [Op.iLike]: category.trim()
                }
            }
        });

        if (existingCategory) {
            return res.status(400).json({ message: 'Категория с таким названием уже существует' });
        }

        // Создаем временный продукт-заглушку для создания категории
        // Этот продукт будет автоматически скрыт из списка товаров (фильтруется в админ-панели)
        const tempProduct = await Product.create({
            title: `[Временный] ${category}`,
            price: 0,
            imageUrl: '',
            category: category.trim(),
            size: 0,
            unit: 'шт',
            type: 'food',
            inStock: 0
        });

        res.status(201).json({ 
            message: 'Категория успешно создана',
            category: category.trim(),
            tempProductId: tempProduct.id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить категорию (только для админа)
router.delete('/:category', adminLimiter, adminAuthMiddleware, async (req, res) => {
    try {
        const { category } = req.params;
        
        // Находим все продукты с этой категорией
        const products = await Product.findAll({
            where: {
                category: {
                    [Op.iLike]: category
                }
            }
        });

        if (products.length === 0) {
            return res.status(404).json({ message: 'Категория не найдена' });
        }

        // Удаляем все продукты с этой категорией
        await Product.destroy({
            where: {
                category: {
                    [Op.iLike]: category
                }
            }
        });

        res.json({ 
            message: 'Категория и все связанные товары успешно удалены',
            deletedCount: products.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
