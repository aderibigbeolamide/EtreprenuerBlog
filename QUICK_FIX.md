# Quick Fix for Drizzle-Kit Error

## The Issue
You're getting "Cannot find module 'drizzle-kit'" when running `npx drizzle-kit push`.

## Solution 1: Install drizzle-kit locally
```bash
npm install drizzle-kit
```

Then run:
```bash
npx drizzle-kit push
```

## Solution 2: Use the npm script (Recommended)
The project already has a script configured. Just run:
```bash
npm run db:push
```

## Solution 3: If you need to install globally
```bash
npm install -g drizzle-kit
drizzle-kit push
```

## Database Setup Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your DATABASE_URL** in `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/centre_blog
   ```

3. **Create the database** (if using local PostgreSQL):
   ```bash
   createdb centre_blog
   ```

4. **Push the schema**:
   ```bash
   npm run db:push
   ```

5. **Start the application**:
   ```bash
   npm run dev
   ```

## If PostgreSQL is not installed locally

I recommend using a cloud database like Neon (free tier available):

1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string to your `.env` file
5. Run `npm run db:push`

This is actually easier and more reliable than setting up PostgreSQL locally.