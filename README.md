# Автоактив: цифровой бизнес без вашего участия

Этот репозиторий является частью проекта "Автоактив: цифровой бизнес без вашего участия" от телеграм-канала [ModelerPRO](https://t.me/modelerPRO).

Проект демонстрирует создание полностью автоматизированного цифрового бизнеса с использованием современных технологий.

## Важно: Настройка под ваш проект

1. Замена домена:
   - Выполните поиск по всем файлам проекта и замените `example.com` на ваш домен
   - Проверьте следующие файлы особенно внимательно:
     - `.env`
     - `.env.example`
     - `frontend/src/pages/**/*.tsx`
     - `frontend/public/robots.txt`
     - `docker-compose.yml`
     - `docker-compose.prod.yml`

2. Настройка тематики:
   - Проект изначально настроен под тематику анекдотов и шуток
   - Необходимо выполнить поиск по всем файлам со словами "Анекдот", "анекдоты", "шутки" и заменить на вашу тематику
   - Основные файлы для изменения:
     - `backend/src/models/Section.ts` (SEO-шаблоны)
     - `frontend/src/components/Footer.tsx` (описания)
     - `frontend/src/pages/**/*.tsx` (заголовки и мета-теги)
     - `default-content.json` (шаблоны текстов)
   - Обязательно обновите:
     - Мета-теги
     - SEO-описания
     - Заголовки страниц
     - Тексты интерфейса

---

# Проект на Next.js и Express

Этот проект представляет собой веб-приложение, построенное на Next.js (фронтенд) и Express (бэкенд) с использованием MongoDB в качестве базы данных.

## Требования

- Docker и Docker Compose
- Node.js 16+ (для локальной разработки)
- MongoDB 4+ (устанавливается автоматически через Docker)

## Быстрый старт

1. Клонируйте репозиторий:
```bash
git clone [ваш-репозиторий]
cd [папка-проекта]
```

2. Создайте файл переменных окружения:
```bash
cp .env.example .env
```

3. Отредактируйте `.env` файл, заполнив все необходимые переменные:
- Замените `your-domain.com` на ваш домен
- Установите безопасные пароли для базы данных и админ-панели
- Настройте остальные переменные под ваши требования

4. Запустите проект через Docker Compose:
```bash
# Для разработки
docker-compose up -d

# Для продакшена
docker-compose -f docker-compose.prod.yml up -d
```

5. Приложение будет доступно:
- Фронтенд: http://localhost:3000
- API: http://localhost:4000
- MongoDB: localhost:27017

## Структура проекта

```
.
├── frontend/                # Next.js фронтенд
├── backend/                 # Express бэкенд
├── docker-compose.yml      # Конфигурация Docker для разработки
├── docker-compose.prod.yml # Конфигурация Docker для продакшена
└── .env                    # Переменные окружения
```

## Настройка для продакшена

1. Настройте ваш домен в `.env`:
```env
DOMAIN=your-domain.com
FRONTEND_URL=https://${DOMAIN}
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
```

2. Настройте безопасные пароли:
```env
MONGO_PASSWORD=ваш_сложный_пароль
ADMIN_PASSWORD=ваш_сложный_пароль_админа
JWT_SECRET=ваш_сложный_секретный_ключ
```

3. Настройте контент:
- Измените заголовки и описания в `.env`
- Обновите тексты в компонентах
- Настройте SEO-параметры

4. Запустите продакшен версию:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Безопасность

### Основные принципы
- Все пароли и секретные ключи должны быть надежными (минимум 16 символов, включая спецсимволы)
- Файл `.env` и другие конфигурационные файлы не должны попадать в репозиторий
- Используйте HTTPS в продакшене
- Регулярно обновляйте зависимости

## Разработка

1. Установите зависимости локально:
```bash
cd frontend && npm install
cd ../backend && npm install
```

2. Запустите в режиме разработки:
```bash
# В папке frontend
npm run dev

# В папке backend
npm run dev
```

## Обновление контента

Для изменения текстов и настроек сайта:

1. Отредактируйте переменные в `.env`:
```env
SITE_TITLE=Ваш заголовок
SITE_DESCRIPTION=Ваше описание
SITE_KEYWORDS=ваши,ключевые,слова
```

2. Перезапустите контейнеры:
```bash
docker-compose restart
```

## Поддержка

При возникновении проблем:
1. Проверьте логи контейнеров
2. Убедитесь, что все переменные окружения заполнены
3. Проверьте подключение к базе данных

## Лицензия

MIT 

## Настройка сервера и SSL

### 1. Подготовка сервера
```bash
# Обновление системы
apt update && apt upgrade -y

# Установка необходимых пакетов
apt install nginx certbot python3-certbot-nginx -y
```

### 2. Настройка DNS
После покупки домена, добавьте A-запись в DNS-настройках:
- Тип: A
- Имя: @ (или ваш домен)
- Значение: IP-адрес вашего сервера
- TTL: 3600 (или по умолчанию)

Добавьте также запись для www:
- Тип: A
- Имя: www
- Значение: тот же IP-адрес
- TTL: 3600

### 3. Получение SSL-сертификата
```bash
# Получение сертификата
certbot --nginx -d example.com -d www.example.com

# Проверка автообновления
certbot renew --dry-run
```

Certbot автоматически настроит обновление сертификата через systemd timer.
Проверить статус можно командой:
```bash
systemctl status certbot.timer
```

### 4. Настройка NGINX

Создайте файл конфигурации:
```bash
nano /etc/nginx/sites-available/example.com
```

Вставьте следующую конфигурацию (замените example.com на ваш домен):
```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

# Main server configuration
server {
    server_name example.com www.example.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
        proxy_buffering off;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://example.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://example.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # SSL Configuration
    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

Активируйте конфигурацию:
```bash
ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # удаляем дефолтную конфигурацию
nginx -t  # проверяем конфигурацию
systemctl restart nginx  # перезапускаем NGINX
```

### 5. Проверка
- Откройте ваш домен в браузере
- Убедитесь, что работает HTTPS
- Проверьте редирект с HTTP на HTTPS
- Проверьте работу API через /api/
- Проверьте WebSocket соединения