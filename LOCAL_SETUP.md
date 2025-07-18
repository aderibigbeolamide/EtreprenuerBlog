# Local Development Setup

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or remote)
- Git

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required Variables
DATABASE_URL=postgresql://username:password@localhost:5432/entrepreneurship_blog
SESSION_SECRET=your-super-secure-session-secret-at-least-32-characters-long
NODE_ENV=development
PORT=5000

# Optional Variables
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Getting Environment Variables:

1. **DATABASE_URL**: 
   - Local PostgreSQL: `postgresql://username:password@localhost:5432/database_name`
   - Or use a cloud provider like Neon, Supabase, or Railway

2. **SESSION_SECRET**: 
   - Generate a secure random string (32+ characters)
   - You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **OPENAI_API_KEY** (Optional):
   - Get from https://platform.openai.com/api-keys
   - Application works without this using custom content generation

## Local Development Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo-url>
   cd entrepreneurship-blog
   npm install
   ```

2. **Set up Database**
   ```bash
   # Create your PostgreSQL database
   createdb entrepreneurship_blog
   
   # Run database migrations
   npm run db:push
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5000
   - Admin Panel: http://localhost:5000/auth
   - Default Admin: username `admin`, password `admin123`

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure DATABASE_URL (cloud database recommended)
- Generate strong SESSION_SECRET
- Set proper PORT (usually provided by hosting platform)

### Deployment Platforms

#### Replit
- Environment variables are automatically configured
- Just click "Deploy" button in Replit

#### Railway/Render/Vercel
1. Connect your GitHub repository
2. Set environment variables in platform dashboard
3. Platform will automatically build and deploy

#### VPS/Docker
1. Set up PostgreSQL database
2. Configure environment variables
3. Run `npm run build && npm start`

## Troubleshooting

### Common Issues:
1. **Database Connection Error**: Check DATABASE_URL format and database is running
2. **Session Issues**: Verify SESSION_SECRET is set and at least 32 characters
3. **Port Issues**: Ensure PORT environment variable is set correctly
4. **Build Errors**: Run `npm run check` to verify TypeScript compilation

### Logs:
- Application logs are displayed in console
- Database operations are logged with Drizzle ORM
- API requests are logged with response times