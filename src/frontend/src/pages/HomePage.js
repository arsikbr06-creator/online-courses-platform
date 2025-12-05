import React from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Container from '@mui/material/Container';

function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Широкий выбор курсов',
      description: 'Более 1000 курсов по различным направлениям: программирование, дизайн, маркетинг и многое другое.',
    },
    {
      title: 'Обучение в любое время',
      description: 'Доступ к материалам 24/7. Учитесь в удобном для вас темпе.',
    },
    {
      title: 'Сертификаты',
      description: 'Получайте сертификаты о прохождении курсов для вашего портфолио.',
    },
    {
      title: 'Экспертные преподаватели',
      description: 'Учитесь у профессионалов с многолетним опытом работы в индустрии.',
    },
  ];

  return (
    <Container>
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Добро пожаловать на платформу онлайн-курсов
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Развивайте свои навыки с помощью наших курсов
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/courses')}
            sx={{ mr: 2 }}
          >
            Посмотреть курсы
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/register')}>
            Начать обучение
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography>{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ my: 8, textAlign: 'center', bgcolor: 'primary.main', color: 'white', p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Начните обучение сегодня
        </Typography>
        <Typography variant="h6" paragraph>
          Присоединяйтесь к тысячам студентов, которые уже развивают свои навыки
        </Typography>
        <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/register')}>
          Зарегистрироваться бесплатно
        </Button>
      </Box>
    </Container>
  );
}

export default HomePage;
