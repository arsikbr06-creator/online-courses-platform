import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      
      // Загрузка курсов с API
      const response = await axios.get('/api/courses');
      
      // Если авторизован, проверяем записан ли на курсы
      if (isAuth && token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const enrolledResponse = await axios.get('/api/courses/my/enrolled', config);
        const enrolledIds = enrolledResponse.data.map(c => c.id);
        
        const coursesWithEnrollment = response.data.map(course => ({
          ...course,
          enrolled: enrolledIds.includes(course.id)
        }));
        setCourses(coursesWithEnrollment);
      } else {
        setCourses(response.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
      setCourses([]);
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem('authToken');
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuth || !token) {
      alert('Пожалуйста, войдите в систему для записи на курс');
      navigate('/login');
      return;
    }
    
    setEnrolling(courseId);
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`/api/courses/${courseId}/enroll`, {}, config);
      
      alert('Вы успешно записались на курс!');
      
      // Обновляем список курсов
      loadCourses();
    } catch (error) {
      console.error('Ошибка записи на курс:', error);
      alert(error.response?.data?.error || 'Ошибка при записи на курс');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h3" component="h1" gutterBottom>
        Каталог курсов
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Выберите курс для изучения
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {courses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={course.image_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400'}
                alt={course.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {course.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Typography variant="caption">
                    📅 {course.duration}
                  </Typography>
                  <Typography variant="caption">
                    📊 {course.level}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/courses/${course.id}`)}>
                  Подробнее
                </Button>
                <Button 
                  size="small" 
                  variant="contained"
                  disabled={course.enrolled || enrolling === course.id}
                  onClick={() => handleEnroll(course.id)}
                  sx={{
                    backgroundColor: course.enrolled ? 'grey.400' : 'primary.main',
                    '&:hover': {
                      backgroundColor: course.enrolled ? 'grey.400' : 'primary.dark',
                    }
                  }}
                >
                  {course.enrolled ? 'Записаны' : (enrolling === course.id ? 'Записываем...' : 'Записаться')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default CoursesPage;
