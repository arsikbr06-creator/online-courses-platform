import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

function CourseDetailPage() {
  const { id } = useParams();

  // Демо данные для примера
  const course = {
    id,
    title: 'Docker и контейнеризация',
    description: 'Подробное изучение технологий контейнеризации с использованием Docker',
    fullDescription: 'В этом курсе вы изучите основы контейнеризации, научитесь работать с Docker, создавать Dockerfile, использовать Docker Compose, настраивать сети и volumes. Также рассмотрим вопросы оркестрации с помощью Docker Swarm и Kubernetes.',
    duration: '6 недель',
    level: 'Средний',
    modules: [
      { id: 1, title: 'Введение в контейнеризацию', lessons: 4 },
      { id: 2, title: 'Основы Docker', lessons: 6 },
      { id: 3, title: 'Dockerfile и сборка образов', lessons: 5 },
      { id: 4, title: 'Docker Compose', lessons: 4 },
      { id: 5, title: 'Сети и хранилища', lessons: 5 },
      { id: 6, title: 'Оркестрация контейнеров', lessons: 6 },
    ],
  };

  return (
    <div>
      <Typography variant="h3" component="h1" gutterBottom>
        {course.title}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          {course.fullDescription}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, my: 2 }}>
          <Typography variant="body2">
            <strong>Продолжительность:</strong> {course.duration}
          </Typography>
          <Typography variant="body2">
            <strong>Уровень:</strong> {course.level}
          </Typography>
        </Box>
        
        <Button variant="contained" size="large" sx={{ mt: 2 }}>
          Записаться на курс
        </Button>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Программа курса
      </Typography>
      
      {course.modules.map((module, index) => (
        <Paper key={module.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">
            Модуль {index + 1}: {module.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {module.lessons} уроков
          </Typography>
        </Paper>
      ))}
    </div>
  );
}

export default CourseDetailPage;
