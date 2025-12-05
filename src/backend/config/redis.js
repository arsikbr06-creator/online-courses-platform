const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD,
});

client.on('connect', () => {
  console.log('Подключено к Redis');
});

client.on('error', (err) => {
  console.error('Ошибка Redis:', err);
});

// Подключение
client.connect().catch(console.error);

// Вспомогательные функции для работы с кэшем
const cache = {
  client,
  
  async get(key) {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Ошибка получения из кэша:', error);
      return null;
    }
  },

  async set(key, value, expiration = 3600) {
    try {
      await client.setEx(key, expiration, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения в кэш:', error);
      return false;
    }
  },

  async del(key) {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Ошибка удаления из кэша:', error);
      return false;
    }
  },

  async quit() {
    await client.quit();
  }
};

module.exports = cache;
