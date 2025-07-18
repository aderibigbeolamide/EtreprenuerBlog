# Local Development Setup

This guide helps you set up the Centre of Entrepreneurship Blog application locally with PostgreSQL database.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed locally
- Git (to clone the repository)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database:
   ```bash
   createdb centre_blog
   ```

3. Set your DATABASE_URL in `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/centre_blog
   ```

#### Option B: Cloud Database (Recommended)
1. Sign up for a free Neon database at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy the connection string to your `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```

### 3. Environment Configuration

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/centre_blog

# App Configuration
APP_DOMAIN=http://localhost:5000
SESSION_SECRET=your-secret-key-here

# Optional: API Keys for full functionality
OPENAI_API_KEY=your-openai-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### 4. Database Schema

Push the database schema:

```bash
npm run db:push
```

If you get a "Cannot find module 'drizzle-kit'" error, install it globally:

```bash
npm install -g drizzle-kit
# or
npx drizzle-kit push
```

### 5. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Default Admin Account

- Username: `admin`
- Password: `admin123`

## Troubleshooting

### Database Connection Issues

1. **PostgreSQL not running**: Start PostgreSQL service
   ```bash
   # On Ubuntu/Debian
   sudo systemctl start postgresql
   
   # On macOS with Homebrew
   brew services start postgresql
   ```

2. **Permission denied**: Create a PostgreSQL user
   ```sql
   CREATE USER your_username WITH PASSWORD 'your_password';
   ALTER USER your_username CREATEDB;
   ```

3. **Database doesn't exist**: Create the database
   ```bash
   createdb centre_blog
   ```

### Module Resolution Issues

If you encounter module import errors:

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Make sure you're using Node.js 18+:
   ```bash
   node --version
   ```

### Port Already in Use

If port 5000 is busy, the app will automatically find an available port. Check the console output for the actual URL.

## Development Features

- **Hot Reload**: Changes to server code automatically restart the server
- **Vite HMR**: Frontend changes update instantly
- **Database Migrations**: Use `npm run db:push` to update schema
- **Type Safety**: Full TypeScript support across frontend and backend

## Production Deployment

For production deployment, see `DEPLOYMENT.md`.