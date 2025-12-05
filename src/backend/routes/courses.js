const express = require('express');
const router = express.Router();
const db = require('../config/database');
const cache = require('../config/redis');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
};

// Получение всех курсов
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId; // Опционально для проверки записи
    
    // Запрос к БД
    const result = await db.query(`
      SELECT id, title, description, image_url, duration, level, created_at
      FROM courses
      WHERE is_active = true
      ORDER BY created_at DESC
    `);

    let courses = result.rows;

    // Если передан userId, проверяем на какие курсы записан пользователь
    if (userId) {
      const enrolledResult = await db.query(`
        SELECT course_id FROM user_courses WHERE user_id = $1
      `, [userId]);
      
      const enrolledCourseIds = enrolledResult.rows.map(row => row.course_id);
      
      courses = courses.map(course => ({
        ...course,
        enrolled: enrolledCourseIds.includes(course.id)
      }));
    }

    res.json(courses);
  } catch (error) {
    console.error('Ошибка получения курсов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение курса по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверка кэша
    const cachedCourse = await cache.get(`course:${id}`);
    if (cachedCourse) {
      return res.json(cachedCourse);
    }

    const result = await db.query(`
      SELECT c.*, 
             array_agg(json_build_object('id', m.id, 'title', m.title, 'order', m.order_num)) as modules
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      WHERE c.id = $1 AND c.is_active = true
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    // Сохранение в кэш
    await cache.set(`course:${id}`, result.rows[0], 300);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения курса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создание курса (требует аутентификации)
router.post('/', async (req, res) => {
  try {
    const { title, description, duration, level } = req.body;

    const result = await db.query(`
      INSERT INTO courses (title, description, duration, level)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, description, duration, level]);

    // Инвалидация кэша
    await cache.del('courses:all');

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка создания курса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Записаться на курс
router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Проверяем существование курса
    const courseResult = await db.query('SELECT id FROM courses WHERE id = $1', [id]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    // Проверяем, не записан ли уже
    const existingEnrollment = await db.query(
      'SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [userId, id]
    );

    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ error: 'Вы уже записаны на этот курс' });
    }

    // Записываем на курс
    await db.query(
      'INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2)',
      [userId, id]
    );

    res.json({ message: 'Вы успешно записались на курс' });
  } catch (error) {
    console.error('Ошибка записи на курс:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить мои курсы
router.get('/my/enrolled', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await db.query(`
      SELECT c.id, c.title, c.description, c.image_url, c.duration, c.level,
             uc.progress, uc.enrolled_at
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = $1
      ORDER BY uc.enrolled_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения курсов пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
