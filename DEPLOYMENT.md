# Deployment Guide

## Quick Deployment Summary

### Required Environment Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure random string (32+ chars)
- `NODE_ENV=production`
- `PORT` - Usually set by hosting platform

### Optional Environment Variables:
- `OPENAI_API_KEY` - For AI content generation (app works without it)

## Platform-Specific Deployment

### 1. Replit Deployment (Recommended)
```bash
# Environment variables are already configured
# Just click the "Deploy" button in Replit interface
```

### 2. Railway
```bash
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard:
# - DATABASE_URL (Railway will provide PostgreSQL)
# - SESSION_SECRET
# - NODE_ENV=production
```

### 3. Render
```bash
# Connect GitHub repo to Render
# Set environment variables:
# - DATABASE_URL
# - SESSION_SECRET  
# - NODE_ENV=production
# Build Command: npm run build
# Start Command: npm start
```

### 4. Vercel
```bash
# Install Vercel CLI: npm i -g vercel
vercel --prod
# Set environment variables in Vercel dashboard
# Note: Will need serverless-compatible database
```

### 5. Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set SESSION_SECRET=your-secret-here
heroku config:set NODE_ENV=production
git push heroku main
```

## Production Checklist

### Before Deployment:
- [ ] Environment variables configured
- [ ] Database URL points to production database
- [ ] SESSION_SECRET is secure and unique
- [ ] Build process tested locally
- [ ] Admin credentials secured

### After Deployment:
- [ ] Database migrations applied
- [ ] Admin user can login
- [ ] File uploads working
- [ ] Static assets loading
- [ ] API endpoints responding
- [ ] Frontend/backend communication working

## Architecture Verification

The application is structured for production with:

1. **Unified Server**: Single Express server serves both API and static files
2. **Port Configuration**: Uses PORT environment variable (required for most platforms)
3. **Static File Serving**: Production build serves from `dist/public`
4. **Database Connection**: PostgreSQL with connection pooling
5. **Session Management**: PostgreSQL-based session store
6. **File Uploads**: Local file system storage in `uploads/` directory
7. **Environment Detection**: Automatically adapts to development/production

## Monitoring and Maintenance

### Health Checks:
- GET `/api/blog-posts` - Should return blog posts array
- GET `/api/staff` - Should return staff members array
- POST `/api/auth/login` - Should authenticate admin user

### Log Monitoring:
- Application startup logs show port and environment
- Database connection logs from Drizzle ORM
- Request/response timing logs for API endpoints
- Error logs for debugging issues

### Database Maintenance:
- Regular backups recommended
- Monitor connection pool usage
- Session cleanup (handled automatically)