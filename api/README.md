# GeoCars API - Laravel Backend

A robust Laravel 12 API backend for the GeoCars car rental management system, featuring clean architecture, comprehensive authentication, and automated API documentation.

## 🎯 Overview

This Laravel API provides a complete backend solution for the GeoCars platform, implementing RESTful endpoints with OAuth2 authentication, comprehensive data management, and automated OpenAPI documentation generation.

## 🛠️ Tech Stack

-   **Laravel 12** - Latest Laravel framework
-   **Laravel Passport** - OAuth2 authentication
-   **MySQL 8.0** - Primary database
-   **Swagger/OpenAPI** - Automated API documentation
-   **Repository Pattern** - Clean architecture implementation
-   **Service Layer** - Business logic separation
-   **Eloquent ORM** - Database abstraction
-   **PHP 8.2+** - Modern PHP features

## 🚀 Quick Start

### Prerequisites

-   PHP 8.2+
-   Composer
-   MySQL 8.0+
-   Node.js (for asset compilation)

### Installation

1. **Install dependencies**

    ```bash
    composer install
    ```

2. **Environment setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

3. **Database setup**

    ```bash
    php artisan migrate
    php artisan db:seed
    ```

4. **Passport setup**

    ```bash
    php artisan passport:install
    ```

5. **Start development server**
    ```bash
    php artisan serve
    ```

### Available Commands

-   `php artisan serve` - Start development server
-   `php artisan migrate` - Run database migrations
-   `php artisan db:seed` - Seed database with sample data
-   `php artisan test` - Run tests
-   `composer dev` - Start all development services

## 📁 Project Structure

```
app/
├── Console/              # Artisan commands
├── Enum/                 # PHP enums
├── Http/
│   ├── Controllers/      # API controllers
│   └── Middleware/       # Custom middleware
├── Interface/            # Contract interfaces
│   ├── Repository/       # Repository contracts
│   └── Service/          # Service contracts
├── Models/               # Eloquent models
├── OpenApi/              # OpenAPI configuration
├── Providers/            # Service providers
├── Repository/           # Repository implementations
├── Service/              # Business logic services
└── Exceptions/           # Custom exceptions

database/
├── factories/            # Model factories
├── migrations/           # Database migrations
└── seeders/              # Database seeders

routes/
└── api.php              # API routes

config/
├── auth.php             # Authentication config
├── passport.php         # Passport config
└── database.php         # Database config
```

## 🔐 Authentication & Authorization

### OAuth2 with Laravel Passport

-   **JWT Tokens** - Secure token-based authentication
-   **Personal Access Tokens** - Long-lived tokens
-   **Password Grant** - Username/password authentication
-   **Token Refresh** - Automatic token renewal

### User Roles

-   **Admin** - Full system access
-   **User** - Limited access based on subscription plan

### Authentication Flow

1. User submits credentials via `/api/Auth/login`
2. System validates credentials and returns JWT token
3. Client includes token in Authorization header
4. API validates token for protected routes

## 📊 API Endpoints

### Authentication

-   `POST /api/Auth/login` - User authentication

### User Management

-   `GET /api/User` - List users (paginated)
-   `GET /api/User/{id}` - Get user details
-   `POST /api/User` - Create new user
-   `PUT /api/User/{id}` - Update user
-   `DELETE /api/User/{id}` - Delete user

### Plan Management

-   `GET /api/Plan` - List plans (paginated)
-   `GET /api/Plan/{id}` - Get plan details
-   `POST /api/Plan` - Create new plan
-   `PUT /api/Plan/{id}` - Update plan
-   `DELETE /api/Plan/{id}` - Delete plan

### Feature Management

-   `GET /api/PlanFeature` - List features (paginated)
-   `GET /api/PlanFeature/{id}` - Get feature details
-   `POST /api/PlanFeature` - Create new feature
-   `PUT /api/PlanFeature/{id}` - Update feature
-   `DELETE /api/PlanFeature/{id}` - Delete feature

### Company Management

-   `GET /api/UserCompany` - List companies (paginated)
-   `GET /api/UserCompany/{id}` - Get company details
-   `POST /api/UserCompany` - Create new company
-   `PUT /api/UserCompany/{id}` - Update company
-   `DELETE /api/UserCompany/{id}` - Delete company

## 🏗️ Architecture

### Repository Pattern

```php
// Interface
interface IUserRepo extends IGenericRepo
{
    public function getByEmail(string $email): ?Model;
}

// Implementation
class UserRepo extends GenericRepo implements IUserRepo
{
    public function getByEmail(string $email): ?Model
    {
        return $this->model::where('email', $email)->first();
    }
}
```

### Service Layer

```php
// Interface
interface IUserService extends IGenericService
{
    public function login(string $email, string $password): array;
}

// Implementation
class UserService extends GenericService implements IUserService
{
    public function login(string $email, string $password): array
    {
        // Business logic implementation
    }
}
```

### Dependency Injection

```php
// Service Provider
public function register(): void
{
    $this->app->bind(IUserRepo::class, UserRepo::class);
    $this->app->bind(IUserService::class, UserService::class);
}
```

## 📚 API Documentation

### OpenAPI/Swagger Integration

The API documentation is automatically generated using Swagger annotations:

-   **OpenAPI JSON**: `/openapi.json`
-   **OpenAPI YAML**: `/openapi.yaml`
-   **Swagger UI**: Available via generated documentation

### Example Controller Documentation

```php
#[OA\Post(
    path: "/api/Auth/login",
    summary: "Login",
    tags: ["Auth"],
    description: "Login with the provided details",
    operationId: "loginWithCredentials",
)]
#[OA\RequestBody(
    required: true,
    content: new OA\JsonContent(ref: "#/components/schemas/LoginRequest")
)]
#[OA\Response(
    response: 200,
    description: "Auth created successfully",
    content: new OA\JsonContent(ref: "#/components/schemas/AuthResponse200")
)]
public function login(Request $request)
{
    // Implementation
}
```

## 🗄️ Database Schema

### Core Tables

-   **users** - User accounts and authentication
-   **plans** - Subscription plans
-   **plan_features** - Features associated with plans
-   **user_companies** - Company information
-   **oauth\_\*\_tokens** - OAuth2 token management

### Relationships

-   Users belong to companies
-   Plans have many features
-   Features belong to plans
-   Users have roles and plans

## 🔧 Configuration

### Environment Variables

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=geocars
DB_USERNAME=root
DB_PASSWORD=password

PASSPORT_PRIVATE_KEY=
PASSPORT_PUBLIC_KEY=
PASSPORT_PERSONAL_ACCESS_CLIENT_ID=
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET=
```

### Authentication Configuration

```php
// config/auth.php
'guards' => [
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

## 🧪 Testing

### Running Tests

```bash
php artisan test
```

### Test Structure

-   **Feature Tests** - API endpoint testing
-   **Unit Tests** - Service and repository testing
-   **Database Tests** - Migration and seeder testing

### Example Test

```php
public function test_user_can_login_with_valid_credentials()
{
    $user = User::factory()->create();

    $response = $this->postJson('/api/Auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)
             ->assertJsonStructure(['token', 'role']);
}
```

## 📦 Deployment

### Production Setup

1. **Environment Configuration**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

2. **Database Migration**

    ```bash
    php artisan migrate --force
    php artisan db:seed --force
    ```

3. **Passport Installation**

    ```bash
    php artisan passport:install
    ```

4. **Cache Configuration**
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

### Docker Deployment

```bash
docker build -t geocars-api .
docker run -p 8000:8000 geocars-api
```

## 🔍 Development Tools

### Code Quality

-   **Laravel Pint** - PHP code style fixer
-   **PHPUnit** - Testing framework
-   **Laravel Pail** - Log viewer

### Development Commands

```bash
composer dev          # Start all development services
php artisan pail      # View application logs
php artisan tinker    # Interactive PHP shell
```

## 🚀 Performance

### Optimization Features

-   **Route Caching** - Faster route resolution
-   **Config Caching** - Reduced configuration loading
-   **View Caching** - Compiled Blade templates
-   **Database Indexing** - Optimized queries

### Monitoring

-   **Laravel Telescope** - Application debugging
-   **Laravel Horizon** - Queue monitoring
-   **Custom Logging** - Application events

## 🔒 Security

### Security Features

-   **CSRF Protection** - Cross-site request forgery prevention
-   **SQL Injection Prevention** - Eloquent ORM protection
-   **XSS Protection** - Input sanitization
-   **Rate Limiting** - API request throttling
-   **JWT Security** - Secure token handling

### Best Practices

-   Input validation using Form Requests
-   Authorization using Policies
-   Secure password hashing
-   HTTPS enforcement in production

## 🤝 Contributing

1. Follow PSR-12 coding standards
2. Write tests for new features
3. Update API documentation
4. Follow Laravel conventions
5. Add proper error handling

## 📚 Resources

-   [Laravel Documentation](https://laravel.com/docs)
-   [Laravel Passport](https://laravel.com/docs/passport)
-   [OpenAPI Specification](https://swagger.io/specification/)
-   [PHP 8.2 Features](https://www.php.net/manual/en/migration82.php)

---

**Built with Laravel 12 and modern PHP practices for robust API development**
