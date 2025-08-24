# GeoCars - Car Rental Management System

A comprehensive full-stack car rental management and tracking system built with Laravel API and React TypeScript frontend.

## 🚗 Overview

GeoCars is a modern car rental management platform that provides:

- **User Management**: Multi-role authentication (Admin, User)
- **Plan Management**: Subscription-based feature access
- **Company Management**: Multi-tenant company support
- **Feature Management**: Granular feature control per plan
- **Real-time Tracking**: Vehicle tracking and analytics
- **Modern UI**: Beautiful, responsive interface with dark/light themes

## 🏗️ Architecture

```
geocars-agent/
├── api/                 # Laravel 12 API Backend
│   ├── app/
│   │   ├── Controllers/ # REST API Controllers
│   │   ├── Models/      # Eloquent Models
│   │   ├── Services/    # Business Logic Layer
│   │   └── Repository/  # Data Access Layer
│   ├── database/        # Migrations & Seeders
│   └── routes/          # API Routes
├── app/                 # React TypeScript Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI Components
│   │   ├── pages/       # Application Pages
│   │   ├── navigation/  # Routing & Navigation
│   │   └── store/       # State Management
│   └── rest/            # Auto-generated API Client
└── docker/              # Docker Configuration
```

## 🛠️ Tech Stack

### Backend (API)

- **Laravel 12** - PHP Framework
- **Laravel Passport** - OAuth2 Authentication
- **MySQL 8.0** - Database
- **Swagger/OpenAPI** - API Documentation
- **Repository Pattern** - Clean Architecture

### Frontend (App)

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component Library
- **React Router** - Navigation
- **Zustand** - State Management
- **React Query** - Data Fetching
- **React Hook Form** - Form Management

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- PHP 8.2+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd geocars-agent
   ```

2. **Start the application**

   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - phpMyAdmin: http://localhost:8080

### Local Development

1. **Backend Setup**

   ```bash
   cd api
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```

2. **Frontend Setup**
   ```bash
   cd app
   npm install
   npm run dev
   ```

## 📊 Features

### Authentication & Authorization

- JWT-based authentication with Laravel Passport
- Role-based access control (Admin, User)
- Secure password hashing
- Session management

### Plan Management

- Create and manage subscription plans
- Feature-based access control
- Plan activation/deactivation
- Pricing management

### Feature Management

- Granular feature control
- Feature limits per plan
- Real-time feature validation
- Analytics and tracking features

### User & Company Management

- Multi-tenant company support
- User-company relationships
- Profile management
- Bulk operations

### Admin Dashboard

- Comprehensive admin interface
- Real-time data visualization
- User and plan management
- System analytics

## 🔧 Configuration

### Environment Variables

#### API (.env)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=geocars
DB_USERNAME=root
DB_PASSWORD=password

PASSPORT_PRIVATE_KEY=
PASSPORT_PUBLIC_KEY=
```

#### App (.env)

```env
VITE_API_URL=http://localhost:8000
```

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI:

- **OpenAPI JSON**: http://localhost:8000/openapi.json
- **OpenAPI YAML**: http://localhost:8000/openapi.yaml

### Available Endpoints

- `POST /api/Auth/login` - User authentication
- `GET /api/User` - User management
- `GET /api/Plan` - Plan management
- `GET /api/PlanFeature` - Feature management
- `GET /api/UserCompany` - Company management

## 🧪 Testing

### Backend Tests

```bash
cd api
php artisan test
```

### Frontend Tests

```bash
cd app
npm test
```

## 📦 Deployment

### Production Build

1. **Build Frontend**

   ```bash
   cd app
   npm run build
   ```

2. **Deploy Backend**
   ```bash
   cd api
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Laravel and React**
