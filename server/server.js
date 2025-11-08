const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const {
    helmetConfig,
    apiLimiter,
    sanitizeInput,
    hppProtection,
} = require('./middleware/security');

const app = express();

// Security middleware (должны быть первыми)
app.use(helmetConfig);
app.use(sanitizeInput);
app.use(hppProtection);

// CORS с ограничениями
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Ограничение размера тела запроса
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting для всех API
app.use('/api/', apiLimiter);

// Routes
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const cartRouter = require('./routes/cart');
const favoritesRouter = require('./routes/favorites');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const ordersRouter = require('./routes/orders');

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/orders', ordersRouter);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' 
            ? 'Внутренняя ошибка сервера' 
            : err.message,
    });
});

// Sync database
sequelize.sync({ force: false }).then(() => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Database synced');
    }
}).catch(err => {
    console.error('Error syncing database:', err);
    process.exit(1);
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Проверка обязательных переменных окружения
if (!process.env.JWT_SECRET) {
    console.error('ОШИБКА: JWT_SECRET не установлен в переменных окружения!');
    process.exit(1);
}

app.listen(PORT, HOST, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Server is running on ${HOST}:${PORT}`);
    }
});
