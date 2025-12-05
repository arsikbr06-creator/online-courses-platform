const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware для проверки токена
const authMiddleware = require('../middleware/auth');

// Получение профиля пользователя
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, first_name, last_name, created_at
      FROM users
      WHERE id = $1
    `, [req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение курсов пользователя
router.get('/my-courses', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.title, c.description, uc.progress, uc.enrolled_at
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = $1
      ORDER BY uc.enrolled_at DESC
    `, [req.userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения курсов пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
