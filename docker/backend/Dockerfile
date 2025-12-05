# Backend приложение
FROM node:20-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY src/backend/package*.json ./

# Установка зависимостей
RUN npm install --omit=dev

# Создание непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копирование исходного кода
COPY --chown=nodejs:nodejs src/backend/ .

# Переключение на непривилегированного пользователя
USER nodejs

# Экспонирование порта
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запуск приложения
CMD ["node", "server.js"]
