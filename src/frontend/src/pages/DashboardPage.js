import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

function DashboardPage() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('userName') || 'Пользователь';

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/courses/my/enrolled', config);
      setMyCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
      setLoading(false);
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
        Привет, {userName}!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Мои курсы
            </Typography>
            <Typography variant="h3" color="primary">
              {myCourses.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Средний прогресс
            </Typography>
            <Typography variant="h3" color="primary">
              {myCourses.length > 0 
                ? Math.round(myCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / myCourses.length)
                : 0}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Завершено
            </Typography>
            <Typography variant="h3" color="primary">
              {myCourses.filter(c => c.progress === 100).length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Мои курсы
      </Typography>

      {myCourses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Вы еще не записаны ни на один курс
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Перейдите в каталог курсов и запишитесь на интересующий вас курс
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {myCourses.map(course => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={course.image_url || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400'}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Прогресс: {course.progress || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress || 0}
                      sx={{ height: 8, borderRadius: 5, mt: 0.5 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    📅 {course.duration} • 📊 {course.level}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}

export default DashboardPage;
