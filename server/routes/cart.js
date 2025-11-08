const router = require('express').Router();
const { Cart, Product, CartItem } = require('../models');
const authMiddleware = require('../middleware/auth');

// Получить корзину
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await Cart.findOne({
            where: { userId },
            include: [{
                model: Product,
                through: {
                    model: CartItem,
                    attributes: ['quantity']
                }
            }]
        });

        if (!cart) {
            cart = await Cart.create({ userId });
        }

        const totalPrice = cart.Products?.reduce((sum, item) => sum + (item.CartItem.quantity * item.price), 0) || 0;
        const totalCount = cart.Products?.reduce((sum, item) => sum + item.CartItem.quantity, 0) || 0;

        res.json({
            Products: cart.Products || [],
            totalPrice,
            totalCount
        });
    } catch (error) {
        res.status(500).json({ 
            message: process.env.NODE_ENV === 'production' 
                ? 'Ошибка получения корзины' 
                : error.message 
        });
    }
});

// Добавить товар в корзину
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const { productId, quantity = 1 } = req.body;

        // Проверяем существование продукта
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        // Находим или создаем корзину для пользователя
        let [cart] = await Cart.findOrCreate({
            where: { userId },
            defaults: { userId }
        });

        // Находим или создаем элемент корзины
        let [cartItem] = await CartItem.findOrCreate({
            where: { CartId: cart.id, ProductId: productId },
            defaults: { quantity }
        });

        // Если элемент уже существовал, обновляем количество
        if (cartItem) {
            cartItem.quantity = quantity;
            await cartItem.save();
        }

        // Получаем обновленную корзину с продуктами
        const updatedCart = await Cart.findOne({
            where: { userId },
            include: [{
                model: Product,
                through: {
                    model: CartItem,
                    attributes: ['quantity']
                }
            }]
        });

        const totalPrice = updatedCart.Products?.reduce((sum, item) => sum + (item.CartItem.quantity * item.price), 0) || 0;
        const totalCount = updatedCart.Products?.reduce((sum, item) => sum + item.CartItem.quantity, 0) || 0;

        res.json({
            Products: updatedCart.Products || [],
            totalPrice,
            totalCount
        });
    } catch (error) {
        res.status(500).json({ 
            message: process.env.NODE_ENV === 'production' 
                ? 'Ошибка добавления товара в корзину' 
                : error.message 
        });
    }
});

// Удалить товар из корзины
router.delete('/remove/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const productId = req.params.id;

        const cart = await Cart.findOne({ where: { userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Корзина не найдена' });
        }

        await CartItem.destroy({
            where: {
                CartId: cart.id,
                ProductId: productId
            }
        });

        const updatedCart = await Cart.findOne({
            where: { userId },
            include: [{
                model: Product,
                through: {
                    model: CartItem,
                    attributes: ['quantity']
                }
            }]
        });

        const totalPrice = updatedCart.Products?.reduce((sum, item) => sum + (item.CartItem.quantity * item.price), 0) || 0;
        const totalCount = updatedCart.Products?.reduce((sum, item) => sum + item.CartItem.quantity, 0) || 0;

        res.json({
            Products: updatedCart.Products || [],
            totalPrice,
            totalCount
        });
    } catch (error) {
        res.status(500).json({ 
            message: process.env.NODE_ENV === 'production' 
                ? 'Ошибка удаления товара из корзины' 
                : error.message 
        });
    }
});

// Обновить количество товара
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const productId = req.params.id;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ where: { userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Корзина не найдена' });
        }

        await CartItem.update(
            { quantity },
            {
                where: {
                    CartId: cart.id,
                    ProductId: productId
                }
            }
        );

        const updatedCart = await Cart.findOne({
            where: { userId },
            include: [{
                model: Product,
                through: {
                    model: CartItem,
                    attributes: ['quantity']
                }
            }]
        });

        const totalPrice = updatedCart.Products?.reduce((sum, item) => sum + (item.CartItem.quantity * item.price), 0) || 0;
        const totalCount = updatedCart.Products?.reduce((sum, item) => sum + item.CartItem.quantity, 0) || 0;

        res.json({
            Products: updatedCart.Products || [],
            totalPrice,
            totalCount
        });
    } catch (error) {
        res.status(500).json({ 
            message: process.env.NODE_ENV === 'production' 
                ? 'Ошибка обновления корзины' 
                : error.message 
        });
    }
});

// Очистить корзину
router.delete('/clear', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ where: { userId } });
        
        if (!cart) {
            return res.status(404).json({ message: 'Корзина не найдена' });
        }

        await CartItem.destroy({
            where: { CartId: cart.id }
        });

        res.json({ message: 'Корзина очищена' });
    } catch (error) {
        res.status(500).json({ 
            message: process.env.NODE_ENV === 'production' 
                ? 'Ошибка очистки корзины' 
                : error.message 
        });
    }
});

module.exports = router;
