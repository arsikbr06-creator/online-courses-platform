import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await axios.get(`/api/courses/${id}`, config);
      setCourse(response.data);
    } catch (err) {
      setError('Не удалось загрузить информацию о курсе');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Перенаправляем на страницу логина
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await axios.post(`/api/courses/${id}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Вы успешно записаны на курс!');
      loadCourse(); // Перезагрузить данные курса
    } catch (err) {
      if (err.response?.status === 400) {
        alert('Вы уже записаны на этот курс');
      } else {
        alert('Ошибка при записи на курс');
      }
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Курс не найден'}
      </Alert>
    );
  }

  return (
    <div>
      <Typography variant="h3" component="h1" gutterBottom>
        {course.title}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          {course.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, my: 2 }}>
          <Typography variant="body2">
            <strong>Продолжительность:</strong> {course.duration}
          </Typography>
          <Typography variant="body2">
            <strong>Уровень:</strong> {course.level}
          </Typography>
        </Box>
        
        {course.enrolled ? (
          <Button variant="outlined" size="large" sx={{ mt: 2 }} disabled>
            Вы уже записаны на курс
          </Button>
        ) : (
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mt: 2 }}
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? 'Записываем...' : 'Записаться на курс'}
          </Button>
        )}
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Программа курса
      </Typography>
      
      {course.modules && course.modules.length > 0 ? (
        <List>
          {course.modules.map((module, index) => (
            <Paper key={module.id} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      Модуль {index + 1}: {module.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {module.description}
                    </Typography>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Программа курса скоро будет добавлена
          </Typography>
        </Paper>
      )}
    </div>
  );
}

export default CourseDetailPage;
