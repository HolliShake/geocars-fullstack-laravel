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
