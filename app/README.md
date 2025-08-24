# GeoCars Frontend - React TypeScript Application

A modern, responsive React TypeScript frontend for the GeoCars car rental management system.

## 🎯 Overview

This is the frontend application for GeoCars, built with React 19, TypeScript, and modern web technologies. It provides a beautiful, intuitive interface for managing car rental operations, user accounts, subscription plans, and system features.

## 🛠️ Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications
- **Orval** - Auto-generated API client

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── custom/         # Custom components
│   ├── layout/         # Layout components
│   ├── providers/      # Context providers
│   └── ui/            # Radix UI components
├── hooks/              # Custom React hooks
├── layout/             # Layout configurations
├── lib/                # Utility functions
├── navigation/         # Routing and navigation
├── pages/              # Application pages
│   ├── admin/         # Admin dashboard pages
│   └── auth/          # Authentication pages
├── prompts/            # AI prompts for features
├── store/              # Zustand state stores
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## 🎨 UI Components

### Custom Components

- **Menu Component** - Dropdown menus with actions
- **Modal Component** - Reusable modal dialogs
- **Table Component** - Data tables with pagination
- **Theme Switcher** - Dark/light theme toggle

### Layout Components

- **Page Layout** - Consistent page structure
- **Dashboard Layout** - Admin dashboard layout
- **Header & Sidebar** - Navigation components

## 🔐 Authentication

The application uses JWT-based authentication with Laravel Passport:

- **Login Page** - User authentication
- **Auth Provider** - Global authentication state
- **Protected Routes** - Role-based access control
- **Token Management** - Automatic token refresh

### User Roles

- **Admin** - Full system access
- **User** - Limited access based on plan

## 📊 Admin Dashboard

### Plan Management

- Create, edit, and delete subscription plans
- Manage plan features and pricing
- Plan activation/deactivation
- Feature limits configuration

### User Management

- User account management
- Role assignment
- Profile editing
- Bulk operations

### Company Management

- Multi-tenant company support
- User-company relationships
- Company profile management

### Feature Management

- Granular feature control
- Feature assignment to plans
- Feature limits and restrictions

## 🎯 Key Features

### Modern UI/UX

- **Responsive Design** - Works on all devices
- **Dark/Light Themes** - User preference support
- **Accessibility** - WCAG compliant components
- **Loading States** - Smooth user experience

### State Management

- **Zustand** - Global state management
- **React Query** - Server state caching
- **Local Storage** - Persistent user preferences

### Form Handling

- **React Hook Form** - Efficient form management
- **Zod Validation** - Type-safe validation
- **Error Handling** - User-friendly error messages

### API Integration

- **Auto-generated Client** - Type-safe API calls
- **Request/Response Types** - Full TypeScript support
- **Error Handling** - Comprehensive error management

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the app directory:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=GeoCars
VITE_APP_VERSION=1.0.0
```

### API Client Generation

The API client is automatically generated using Orval:

```bash
npm run generate:api
```

This generates TypeScript types and API functions based on the OpenAPI specification.

## 🎨 Theming

The application supports both light and dark themes:

- **Theme Provider** - Global theme context
- **CSS Variables** - Dynamic theme switching
- **Tailwind Integration** - Utility classes for theming

### Customizing Themes

Edit `src/components/theme-provider.tsx` to customize theme colors and styles.

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile** - < 640px
- **Tablet** - 640px - 1024px
- **Desktop** - > 1024px

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Test Structure

- **Unit Tests** - Component testing
- **Integration Tests** - API integration
- **E2E Tests** - User workflow testing

## 📦 Building for Production

### Development Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Docker Build

```bash
docker build -t geocars-frontend .
```

## 🔍 Development Tools

### Code Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

### Development Experience

- **Hot Reload** - Instant code updates
- **Error Overlay** - Runtime error display
- **Source Maps** - Debug production builds

## 🚀 Performance

### Optimization Features

- **Code Splitting** - Lazy-loaded components
- **Tree Shaking** - Unused code elimination
- **Image Optimization** - Compressed assets
- **Caching** - Browser and API caching

### Bundle Analysis

```bash
npm run analyze
```

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include proper error handling
4. Test your changes thoroughly
5. Update documentation as needed

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [React Query](https://tanstack.com/query/latest)

---

**Built with modern React and TypeScript for optimal developer experience**
