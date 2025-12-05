const client = require('prom-client');

// Создание реестра метрик
const register = new client.Registry();

// Дефолтные метрики (CPU, память и т.д.)
client.collectDefaultMetrics({ register });

// Кастомные метрики
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Длительность HTTP запросов в секундах',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Общее количество HTTP запросов',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Количество активных пользователей',
  registers: [register]
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Длительность запросов к БД в секундах',
  labelNames: ['query_type'],
  registers: [register]
});

module.exports = {
  register,
  httpRequestDuration,
  httpRequestTotal,
  activeUsers,
  dbQueryDuration
};
