# Развертывание на локальном ПК

## Требования

1. **Node.js** (версия 18 или выше) - [скачать](https://nodejs.org/)
2. **PostgreSQL** (версия 12 или выше) - [скачать](https://www.postgresql.org/download/)
3. **Git** (для клонирования репозитория, если нужно)

## Шаг 1: Установка PostgreSQL

1. Скачайте и установите PostgreSQL
2. Во время установки запомните пароль для пользователя `postgres`
3. После установки создайте базу данных:
   ```sql
   CREATE DATABASE universam205inc;
   ```

## Шаг 2: Настройка переменных окружения

### Backend (папка `server`)

Создайте файл `server/.env` со следующим содержимым:

```env
# База данных
DB_NAME=universam205inc
DB_USER=postgres
DB_PASSWORD=ваш_пароль_postgres
DB_HOST=localhost
DB_PORT=5432

# JWT токен
JWT_SECRET=your-secret-key-измените-на-случайную-строку

# Telegram уведомления (опционально)
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id

# Порт сервера (опционально, по умолчанию 3001)
PORT=3001

# Окружение
NODE_ENV=development
```

### Frontend

Создайте файл `.env` в корне проекта:

```env
# URL бэкенда для разработки
VITE_API_URL=http://localhost:3001

# URL бэкенда для продакшена (если нужно)
VITE_PRODUCTION_API_URL=http://localhost:3001
```

## Шаг 3: Установка зависимостей

Откройте терминал в корне проекта и выполните:

```bash
# Установка зависимостей фронтенда
npm install

# Установка зависимостей бэкенда
cd server
npm install
cd ..
```

## Шаг 4: Применение миграций базы данных

Выполните миграции для создания таблиц:

```bash
cd server
npx sequelize-cli db:migrate
```

Или если используете другой способ миграций, выполните SQL из файлов миграций вручную.

## Шаг 5: Запуск приложения

### Вариант 1: Раздельный запуск (рекомендуется для разработки)

**Терминал 1 - Backend:**
```bash
cd server
npm run dev
```
Сервер запустится на `http://localhost:3001`

**Терминал 2 - Frontend:**
```bash
npm run dev
```
Фронтенд запустится на `http://localhost:5173`

**Для Windows PowerShell или CMD:**
```powershell
# Терминал 1
cd server
npm run dev

# Терминал 2 (новое окно)
npm run dev
```

### Вариант 2: Раздача фронтенда через Express (для продакшена)

1. Соберите фронтенд:
```bash
npm run build
```

2. Обновите `server/server.js`, добавив раздачу статических файлов:

```javascript
const path = require('path');

// В конце файла, после всех роутов, перед app.listen:
// Раздача статических файлов фронтенда
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}
```

3. Запустите только backend:

**Windows (PowerShell):**
```powershell
cd server
$env:NODE_ENV="production"
npm start
```

**Windows (CMD):**
```cmd
cd server
set NODE_ENV=production
npm start
```

**Linux/Mac:**
```bash
cd server
NODE_ENV=production npm start
```

Приложение будет доступно на `http://localhost:3001`

## Шаг 6: Проверка работы

1. Откройте браузер и перейдите на `http://localhost:5173` (вариант 1) или `http://localhost:3001` (вариант 2)
2. Зарегистрируйте пользователя
3. Проверьте, что товары загружаются

## Доступ из внешней сети

Если нужно открыть доступ с других устройств в локальной сети:

1. Узнайте локальный IP вашего ПК:
   - **Windows:** Откройте командную строку и выполните:
     ```cmd
     ipconfig
     ```
     Найдите "IPv4-адрес" (обычно 192.168.x.x)
   - **Linux/Mac:** Выполните:
     ```bash
     ifconfig
     # или
     ip addr
     ```

2. Измените `.env` в корне проекта:
```env
VITE_API_URL=http://ваш_локальный_IP:3001
```

3. Сервер уже настроен на прослушивание всех интерфейсов (0.0.0.0)

4. Используйте в браузере на других устройствах: `http://ваш_локальный_IP:5173` (для фронтенда) или `http://ваш_локальный_IP:3001` (если используете вариант 2)

**Важно:** Убедитесь, что файрвол Windows/антивирус разрешает подключения на портах 3001 и 5173

## Проблемы и решения

### Ошибка подключения к БД
- Проверьте, что PostgreSQL запущен
- Проверьте правильность пароля в `.env`
- Убедитесь, что база данных создана

### CORS ошибки
- Убедитесь, что `VITE_API_URL` указывает на правильный адрес backend
- Проверьте настройки CORS в `server/server.js`

### Порт занят
- Измените `PORT` в `server/.env`
- Или измените порт Vite в `vite.config.ts`

