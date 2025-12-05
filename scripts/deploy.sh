#!/bin/bash

# Скрипт развертывания платформы онлайн-курсов
# Использование: ./deploy.sh [swarm|compose]

set -e

MODE=${1:-compose}

echo "=== Развертывание платформы онлайн-курсов ==="
echo "Режим: $MODE"

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "Ошибка: Docker не установлен"
    exit 1
fi

# Создание .env файла если не существует
if [ ! -f src/backend/.env ]; then
    echo "Создание .env файла..."
    cp src/backend/.env.example src/backend/.env
    echo "⚠️  ВАЖНО: Отредактируйте src/backend/.env перед запуском в production!"
fi

if [ "$MODE" = "swarm" ]; then
    echo "Развертывание в Docker Swarm..."
    
    # Проверка инициализации Swarm
    if ! docker info | grep -q "Swarm: active"; then
        echo "Инициализация Docker Swarm..."
        docker swarm init
    fi
    
    # Создание секретов
    echo "Создание секретов..."
    if ! docker secret ls | grep -q db_password; then
        echo "secure_password_123" | docker secret create db_password -
    fi
    if ! docker secret ls | grep -q jwt_secret; then
        echo "jwt_secret_key_123" | docker secret create jwt_secret -
    fi
    
    # Развертывание стека
    echo "Развертывание стека..."
    docker stack deploy -c docker-compose.yml online-courses
    
    echo "Ожидание запуска сервисов..."
    sleep 10
    
    echo "Статус сервисов:"
    docker service ls
    
elif [ "$MODE" = "compose" ]; then
    echo "Развертывание с Docker Compose..."
    
    # Сборка и запуск
    docker-compose up -d --build
    
    echo "Ожидание запуска сервисов..."
    sleep 10
    
    echo "Статус контейнеров:"
    docker-compose ps
    
else
    echo "Неизвестный режим: $MODE"
    echo "Использование: ./deploy.sh [swarm|compose]"
    exit 1
fi

echo ""
echo "=== Развертывание завершено! ==="
echo ""
echo "Доступ к приложению:"
echo "  Frontend:    http://localhost"
echo "  API:         http://localhost/api"
echo "  Grafana:     http://localhost:3001"
echo "  Prometheus:  http://localhost:9090"
echo ""
echo "Для просмотра логов:"
if [ "$MODE" = "swarm" ]; then
    echo "  docker service logs -f online-courses_backend"
else
    echo "  docker-compose logs -f"
fi
