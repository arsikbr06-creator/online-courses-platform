#!/bin/bash

# Скрипт резервного копирования базы данных
# Использование: ./backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "=== Резервное копирование БД ==="

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

# Поиск контейнера PostgreSQL
POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo "Ошибка: Контейнер PostgreSQL не найден"
    exit 1
fi

echo "Контейнер PostgreSQL: $POSTGRES_CONTAINER"
echo "Создание резервной копии..."

# Создание бэкапа
docker exec $POSTGRES_CONTAINER pg_dump -U postgres online_courses > $BACKUP_FILE

# Сжатие
gzip $BACKUP_FILE

echo "Резервная копия создана: ${BACKUP_FILE}.gz"
echo "Размер: $(du -h ${BACKUP_FILE}.gz | cut -f1)"

# Удаление старых бэкапов (хранить последние 30 дней)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Готово!"
