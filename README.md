<div align="center">
  <img src="public/logo/logo-dark.png" alt="Daily It Logo" width="200" height="auto">
  <h1>Daily It Admin Dashboard v2</h1>
  <p>A comprehensive admin dashboard for managing an e-commerce platform built with Next.js 15, TypeScript, and modern React patterns.</p>
  <p>This application provides a complete solution for managing products, brands, categories, users, roles, and more.</p>
</div>

## 🚀 Features

### Core Features

- **Product Management**: Complete CRUD operations for products with bulk upload capabilities
- **Brand Management**: Manage product brands with image uploads and status tracking
- **Category Management**: Hierarchical category system with tree structure
- **User Management**: Admin user management with role-based access control
- **Role & Permission System**: Dynamic role creation with granular permissions
- **Deals & Offers**: Create and manage promotional deals and offers
- **Banner Builder**: Custom banner creation for marketing campaigns
- **Product Filters**: Advanced filtering system for product organization
- **Real-time Notifications**: Socket.io integration for live updates
- **Bulk Operations**: CSV/JSON bulk upload and data management

### UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Complete theme switching with next-themes
- **Modern UI Components**: Built with Radix UI and shadcn/ui
- **Data Tables**: Advanced tables with sorting, filtering, and pagination
- **Grid/Table Views**: Toggle between different data visualization modes
- **Loading States**: Comprehensive skeleton loaders and loading indicators
- **Error Handling**: Global error management with user-friendly messages
- **Form Validation**: Client-side validation with Zod and React Hook Form

## 🛠️ Technologies Used

### Frontend Framework

- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript 5** - Type-safe development

### State Management

- **Redux Toolkit** - Predictable state container
- **Redux Persist** - State persistence across sessions
- **RTK Query** - Data fetching and caching

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Form Management

- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation resolvers

### Data Fetching & API

- **Axios** - HTTP client with interceptors
- **RTK Query** - Powerful data fetching and caching
- **Socket.io Client** - Real-time communication

### Utilities & Tools

- **Day.js** - Date manipulation library
- **JWT Decode** - JWT token handling
- **Papa Parse** - CSV parsing
- **React CSV** - CSV export functionality
- **LocalForage** - Offline storage
- **Slugify** - URL-friendly string generation

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Lint-staged** - Pre-commit linting
- **Turbopack** - Fast bundling (Next.js)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── reset-password/
│   │   └── verify-email/
│   ├── (mainLayout)/             # Main application routes
│   │   ├── brand/                # Brand management
│   │   ├── category/             # Category management
│   │   ├── product/              # Product management
│   │   │   ├── all-products/
│   │   │   ├── create-product/
│   │   │   ├── update-product/
│   │   │   └── bulk-upload/
│   │   ├── roles/                # Role management
│   │   ├── users/                # User management
│   │   ├── offers/               # Deals and offers
│   │   └── shop/                 # Shop management
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── common/                  # Common components
│   ├── layouts/                 # Layout components
│   ├── shared/                  # Shared components
│   ├── product/                 # Product-specific components
│   ├── brand/                   # Brand-specific components
│   ├── categories/              # Category-specific components
│   ├── roles/                   # Role-specific components
│   ├── deals/                   # Deal-specific components
│   └── notifications/           # Notification components
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
├── redux/                       # Redux store and API
│   ├── api/                     # RTK Query API slices
│   ├── hooks/                   # Redux hooks
│   └── reducers/                # Redux reducers
├── interface/                   # TypeScript interfaces
├── provider/                    # Context providers
├── utils/                       # Utility functions
└── validations/                 # Form validation schemas
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gadget-grid-admin-v2
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_URL=your_api_base_url
   NEXT_PUBLIC_SK_URL=your_socket_url
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prettier` - Format code with Prettier

## 🎨 UI Components

### Component Library

The project uses a comprehensive component library built on top of Radix UI:

- **Forms**: Input, Select, Checkbox, Radio, DatePicker, Textarea
- **Data Display**: Table, Card, Badge, Avatar, Skeleton
- **Navigation**: Sidebar, Breadcrumb, Pagination, Tabs
- **Feedback**: Alert, Dialog, Toast, Tooltip, Loading
- **Layout**: Container, Grid, Flex, Separator
- **Interactive**: Button, Switch, Dropdown, Popover

### Custom Components

- **GlobalTable**: Advanced data table with sorting, filtering, and column management
- **PageHeader**: Consistent page headers with actions
- **GlobalModal**: Reusable modal component
- **CustomAvatar**: Avatar component with fallback
- **TreeDropdown**: Hierarchical dropdown for categories

## 🔐 Authentication & Authorization

### Authentication Flow

- JWT-based authentication with refresh tokens
- Automatic token refresh on expiration
- Secure cookie management
- Protected routes with middleware

### Role-Based Access Control

- Dynamic role creation and management
- Granular permission system
- Feature-based access control
- User role assignment

## 📊 State Management

### Redux Store Structure

- **Auth Slice**: User authentication and permissions
- **General Slice**: Global application state
- **Products Slice**: Product-related state
- **Table Column Slice**: Table configuration persistence

### API Management

- RTK Query for all API calls
- Automatic caching and background updates
- Optimistic updates
- Error handling and retry logic

## 🎯 Key Features Implementation

### Product Management

- **CRUD Operations**: Complete product lifecycle management
- **Bulk Upload**: CSV/JSON import with field mapping
- **Image Gallery**: Multiple image upload and management
- **Advanced Filtering**: Search, category, brand, date filters
- **Grid/Table Views**: Toggle between visualization modes

### Category Management

- **Hierarchical Structure**: Tree-based category organization
- **Dynamic Tree Rendering**: Expandable/collapsible categories
- **Parent-Child Relationships**: Nested category support
- **Bulk Operations**: Mass category operations

### Real-time Features

- **Socket.io Integration**: Live updates and notifications
- **Real-time Data Sync**: Automatic data refresh
- **Notification System**: Toast notifications and alerts

## 🎨 Theming & Styling

### Design System

- **Color Palette**: Consistent color scheme with CSS variables
- **Typography**: Custom font stack with Be Vietnam Pro
- **Spacing**: Consistent spacing scale
- **Border Radius**: Unified border radius system
- **Shadows**: Layered shadow system

### Dark Mode Support

- Complete dark/light theme implementation
- CSS custom properties for theme switching
- Persistent theme preference
- Smooth theme transitions

## 📱 Responsive Design

### Breakpoints

- Mobile-first approach
- Responsive grid system
- Adaptive component sizing
- Touch-friendly interactions

### Mobile Features

- Collapsible sidebar
- Mobile-optimized tables
- Touch gestures
- Responsive modals

## 🔧 Development Tools

### Code Quality

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks
- **Lint-staged**: Pre-commit linting

### Performance

- **Turbopack**: Fast bundling and hot reload
- **Code Splitting**: Automatic code splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Built-in bundle analyzer

## 🚀 Deployment

### Build Process

```bash
npm run build
npm run start
```

### Environment Variables

- `NEXT_PUBLIC_URL`: API base URL
- `NEXT_PUBLIC_SK_URL`: Socket.io server URL

### Production Considerations

- Image optimization enabled
- Static generation where possible
- API route optimization
- Error boundary implementation

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
