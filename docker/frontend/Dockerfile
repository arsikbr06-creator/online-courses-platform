# Многоэтапная сборка для оптимизации размера образа

# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копирование файлов зависимостей
COPY src/frontend/package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY src/frontend/ .

# Сборка приложения
RUN npm run build

# Этап 2: Production образ
FROM nginx:alpine

# Копирование собранного приложения из builder
COPY --from=builder /app/build /usr/share/nginx/html

# Копирование конфигурации nginx для SPA
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Экспонирование порта
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
