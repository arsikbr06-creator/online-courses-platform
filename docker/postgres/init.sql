-- Инициализация базы данных для платформы онлайн-курсов

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица курсов
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    duration VARCHAR(50),
    level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица модулей курса
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_num INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица уроков
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    order_num INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица записей пользователей на курсы
CREATE TABLE IF NOT EXISTS user_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Таблица прогресса по урокам
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_user ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course ON user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Демо данные
INSERT INTO courses (title, description, image_url, duration, level) VALUES
('Основы программирования на Python', 'Полный курс Python для начинающих. Научитесь писать чистый код, работать с функциями, классами и модулями. Изучите структуры данных, обработку исключений и основы ООП. Практические проекты включают создание калькулятора, игры и веб-скрейпера.', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400', '8 недель', 'Начальный'),
('Web-разработка с React', 'Создавайте современные одностраничные приложения с React 18. Изучите компоненты, хуки, роутинг и управление состоянием с Redux. Освойте Material-UI для красивого дизайна. Практика: разработка интернет-магазина и социальной сети.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', '10 недель', 'Средний'),
('Docker и контейнеризация', 'Освойте Docker с нуля до продакшн-деплоя. Научитесь создавать Dockerfile, работать с Docker Compose, управлять volumes и networks. Изучите best practices для оптимизации образов и безопасности. Практика: контейнеризация full-stack приложения.', 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400', '6 недель', 'Средний'),
('Kubernetes для начинающих', 'Полное руководство по оркестрации контейнеров в Kubernetes. Изучите pods, deployments, services, ingress и persistent volumes. Настройте мониторинг с Prometheus и логирование. Практика: развертывание микросервисной архитектуры в production.', 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400', '8 недель', 'Продвинутый'),
('DevOps практики', 'Комплексный курс по современным DevOps практикам. Освойте CI/CD с GitHub Actions и Jenkins, Infrastructure as Code с Terraform, мониторинг с Grafana и Prometheus. Автоматизация тестирования, деплоя и отката изменений. Реальные проекты из индустрии.', 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400', '12 недель', 'Продвинутый'),
('Базы данных PostgreSQL', 'Углубленное изучение PostgreSQL от основ до продвинутых техник. Проектирование схем, индексы, транзакции и ACID. Оптимизация запросов, репликация и шардирование. Работа с JSON, полнотекстовый поиск. Практика: проектирование highload системы.', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400', '6 недель', 'Средний');

COMMIT;
