const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendOrderNotification(order, user) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram settings not configured');
        return;
    }

    try {
        if (!order || !order.OrderItems || !user) {
            console.error('Invalid order or user data');
            return;
        }

        const orderItems = order.OrderItems.map(item => {
            if (!item || !item.Product) return '';
            return `• ${item.Product.title} - ${item.quantity} ${item.Product.unit} × ${item.price} ₽`;
        }).filter(item => item).join('\n');

        const escapeMarkdown = (text) => {
            if (!text) return '';
            return String(text).replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
        };

        const telegramInfo = user.telegram ? `\n📱 *Telegram:* ${escapeMarkdown(user.telegram)}` : '';
        
        const message = `
🛒 *НОВЫЙ ЗАКАЗ №${order.id}*

👤 *Клиент:* ${escapeMarkdown(user.login || 'Неизвестно')}${telegramInfo}
📍 *Комната доставки:* ${escapeMarkdown(order.deliveryRoom || 'Не указана')}

📦 *Товары:*
${orderItems}

💰 *Итого:* ${order.totalPrice} ₽

🕐 *Время заказа:* ${new Date(order.createdAt).toLocaleString('ru-RU')}
        `.trim();

        const chatIds = TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id);

        if (chatIds.length === 0) {
            console.error('No valid chat IDs found');
            return;
        }

        const sendPromises = chatIds.map(chatId => 
            axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            }).catch(err => {
                console.error(`Error sending to chat ${chatId}:`, err.response?.data || err.message);
                throw err;
            })
        );

        await Promise.all(sendPromises);
        console.log(`Telegram notification sent successfully to ${chatIds.length} recipient(s)`);
    } catch (error) {
        console.error('Error sending Telegram notification:', error.message);
    }
}

module.exports = { sendOrderNotification };

