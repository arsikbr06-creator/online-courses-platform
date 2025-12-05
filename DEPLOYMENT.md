# Инструкция по развертыванию платформы онлайн-курсов

## Требования

### Минимальные системные требования:
- **OS**: Linux (Ubuntu 20.04+ / CentOS 8+)
- **CPU**: 4 ядра
- **RAM**: 8 GB
- **Диск**: 50 GB SSD
- **Docker**: 24.0+
- **Docker Compose**: 2.0+

### Рекомендуемые требования для production:
- **OS**: Linux (Ubuntu 22.04 LTS)
- **CPU**: 16+ ядер
- **RAM**: 32 GB+
- **Диск**: 500 GB SSD
- **Кластер**: 3+ узла

## Быстрый старт (Development)

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-org/online-courses-platform.git
cd online-courses-platform
```

### 2. Настройка переменных окружения

```bash
# Скопировать примеры конфигурации
cp src/backend/.env.example src/backend/.env

# Отредактировать .env файлы
nano src/backend/.env
```

### 3. Запуск через Docker Compose

```bash
# Сборка и запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### 4. Доступ к приложению

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## Production развертывание

### Вариант 1: Docker Swarm

#### Инициализация Swarm

```bash
# На manager узле
docker swarm init --advertise-addr <MANAGER-IP>

# Получить токен для worker узлов
docker swarm join-token worker

# На worker узлах
docker swarm join --token <TOKEN> <MANAGER-IP>:2377
```

#### Создание secrets

```bash
# Создание секретов для паролей
echo "your_db_password" | docker secret create db_password -
echo "your_jwt_secret" | docker secret create jwt_secret -
echo "your_grafana_password" | docker secret create grafana_password -
```

#### Развертывание стека

```bash
# Деплой стека
docker stack deploy -c docker-compose.yml online-courses

# Проверка сервисов
docker service ls

# Масштабирование сервиса
docker service scale online-courses_backend=5

# Просмотр логов сервиса
docker service logs -f online-courses_backend
```

#### Обновление сервиса

```bash
# Rolling update с новым образом
docker service update --image online-courses-backend:v2 online-courses_backend

# Откат к предыдущей версии
docker service rollback online-courses_backend
```

### Вариант 2: Kubernetes

#### Подготовка кластера

```bash
# Установка kubectl (если еще не установлен)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Проверка подключения к кластеру
kubectl cluster-info
```

#### Создание namespace и secrets

```bash
# Создание namespace
kubectl create namespace online-courses

# Создание secrets
kubectl create secret generic app-secrets \
  --from-literal=DB_PASSWORD=your_password \
  --from-literal=JWT_SECRET=your_jwt_secret \
  --from-literal=GRAFANA_PASSWORD=your_grafana_password \
  -n online-courses
```

#### Применение манифестов

```bash
# Применить все манифесты
kubectl apply -f kubernetes/

# Проверка статуса pods
kubectl get pods -n online-courses

# Проверка сервисов
kubectl get services -n online-courses

# Проверка ingress
kubectl get ingress -n online-courses
```

#### Масштабирование

```bash
# Ручное масштабирование
kubectl scale deployment backend --replicas=5 -n online-courses

# HPA автоматически масштабирует на основе CPU/Memory
kubectl get hpa -n online-courses
```

## Мониторинг и обслуживание

### Проверка здоровья системы

```bash
# Docker Swarm
docker service ps online-courses_backend
docker service logs online-courses_backend

# Kubernetes
kubectl get pods -n online-courses
kubectl logs -f deployment/backend -n online-courses
kubectl describe pod <pod-name> -n online-courses
```

### Резервное копирование

#### PostgreSQL

```bash
# Docker Swarm
docker exec <postgres-container> pg_dump -U postgres online_courses > backup.sql

# Kubernetes
kubectl exec -it <postgres-pod> -n online-courses -- pg_dump -U postgres online_courses > backup.sql
```

#### Восстановление

```bash
# Docker Swarm
docker exec -i <postgres-container> psql -U postgres online_courses < backup.sql

# Kubernetes
kubectl exec -i <postgres-pod> -n online-courses -- psql -U postgres online_courses < backup.sql
```

### Мониторинг метрик

1. Откройте Grafana: http://your-server:3001
2. Войдите (admin/admin при первом входе)
3. Настроенные дашборды:
   - Infrastructure Overview
   - Application Metrics
   - Database Performance
   - Business Metrics

### Алерты

Prometheus настроен для отправки алертов при:
- Высокой загрузке CPU (>85%)
- Высоком использовании RAM (>90%)
- Низком свободном месте на диске (<10%)
- Высоком количестве ошибок (>1%)
- Недоступности сервиса

## Устранение проблем

### Сервис не запускается

```bash
# Проверить логи
docker service logs <service-name>
kubectl logs <pod-name> -n online-courses

# Проверить события
docker service ps <service-name>
kubectl describe pod <pod-name> -n online-courses

# Проверить health checks
docker service inspect <service-name>
kubectl get pods -n online-courses
```

### Проблемы с базой данных

```bash
# Проверить соединения
docker exec <postgres-container> psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Проверить медленные запросы
docker exec <postgres-container> psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### Высокая нагрузка

```bash
# Увеличить количество реплик
docker service scale online-courses_backend=10

# Или использовать autoscaling в Kubernetes
kubectl autoscale deployment backend --cpu-percent=50 --min=3 --max=10 -n online-courses
```

## Обновление системы

### Rolling update без простоя

```bash
# Docker Swarm
docker service update --image online-courses-backend:new-version \
  --update-parallelism 1 \
  --update-delay 10s \
  online-courses_backend

# Kubernetes
kubectl set image deployment/backend backend=online-courses-backend:new-version -n online-courses
kubectl rollout status deployment/backend -n online-courses
```

### Откат при проблемах

```bash
# Docker Swarm
docker service rollback online-courses_backend

# Kubernetes
kubectl rollout undo deployment/backend -n online-courses
```

## Безопасность

### Рекомендации:

1. **Изменить пароли по умолчанию** в production
2. **Использовать SSL/TLS** для всех соединений
3. **Настроить firewall** на серверах
4. **Регулярно обновлять** образы контейнеров
5. **Использовать secrets** для конфиденциальных данных
6. **Ограничить доступ** к базам данных и Redis
7. **Настроить backup** критичных данных

## Поддержка

При возникновении проблем:
1. Проверьте логи сервисов
2. Убедитесь в достаточности ресурсов
3. Проверьте сетевое взаимодействие
4. Обратитесь к документации компонентов
