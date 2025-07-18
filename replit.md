# replit.md

## Overview

This is an AI-powered blog application for the Centre of Entrepreneurship. The system allows admins to create and manage blog posts with AI-generated content, while providing public access for viewing blogs, commenting, and accessing staff information. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data storage and OpenAI for content generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy using session-based auth
- **Session Storage**: PostgreSQL-based session store
- **File Uploads**: Multer middleware for handling image and video uploads
- **API Design**: RESTful endpoints with structured error handling

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Pooled connections using @neondatabase/serverless

## Key Components

### Database Schema
- **Users**: Admin authentication with username/password
- **Staff**: Team member profiles with bio, image, and social links
- **Blog Posts**: Articles with AI-generated content, images, videos, and author attribution
- **Comments**: User feedback on blog posts with moderation capabilities

### Authentication System
- Session-based authentication using Passport.js
- Secure password hashing with Node.js crypto (scrypt)
- Protected routes for admin functionality
- Automatic session management with PostgreSQL store

### AI Content Generation
- OpenAI GPT-4o integration for blog content creation
- Image analysis capabilities for context-aware content generation
- Structured output format (content + excerpt)
- Error handling and fallback mechanisms

### File Management
- Local file storage in uploads directory
- Support for images and videos with type validation
- File size limits (50MB) and security filtering
- Unique filename generation to prevent conflicts

## Data Flow

### Content Creation Flow
1. Admin provides headline and optional image
2. System sends data to OpenAI API for content generation
3. AI returns structured content (full article + excerpt)
4. Admin reviews and can modify before publishing
5. Content saved with metadata (author, timestamps, AI flag)

### Public Access Flow
1. Users browse published blog posts on public pages
2. Individual posts display with full content, images, videos
3. Comment system allows public interaction
4. Staff page shows team information
5. All content served through React router with SSR considerations

### Admin Dashboard Flow
1. Authentication required for access
2. CRUD operations for blog posts and staff
3. Content management with publish/draft states
4. Real-time preview capabilities
5. File upload integration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **OpenAI**: AI content generation service
- **Passport.js**: Authentication middleware
- **Multer**: File upload handling
- **TanStack Query**: Client-side data fetching and caching

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **Wouter**: Lightweight routing library

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Drizzle Kit**: Database schema management
- **ESBuild**: Production bundling

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Automatic TypeScript compilation
- Environment variable management for API keys
- Local PostgreSQL or Neon development database

### Production Build
1. Vite builds React frontend to `dist/public`
2. ESBuild bundles Express server to `dist/index.js`
3. Static files served from Express in production
4. Environment-specific configuration handling

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `OPENAI_API_KEY`: OpenAI API authentication
- `NODE_ENV`: Environment specification

### File System Considerations
- Uploads directory must be writable
- Static assets served from build output
- Session store requires database connectivity
- File paths configured for deployment environment

The application is designed for easy deployment on platforms like Replit, with automatic environment detection and appropriate middleware configuration for both development and production scenarios.

## Recent Changes

### January 18, 2025 - Migration & UI Improvements
- Successfully migrated project from Replit Agent to standard Replit environment
- Created PostgreSQL database and applied all schema migrations  
- Updated home page with University of Abuja branding and imagery
- Improved text contrast and readability on hero section with dark overlay and backdrop blur
- Enhanced user experience with better navigation and university-focused content
- Set up fallback session secret for development environment
- Configured custom content generator as OpenAI alternative
- Enhanced footer with University of Abuja identification
- Updated statistics and metrics to reflect university context

### January 18, 2025 - Cloudinary Media Storage Integration
- Integrated Cloudinary for all media storage (images, videos, files)
- Replaced local file storage with cloud-based CDN delivery
- Added automatic image and video optimization
- Organized media in structured folders (blog-posts, staff-images, uploads)
- Created dedicated upload endpoints for images and videos
- Updated all file upload workflows to use Cloudinary
- Enhanced deployment readiness with production-grade media storage

### January 18, 2025 - APP_DOMAIN Configuration & Migration Completion
- Added comprehensive APP_DOMAIN configuration for production and local environments
- Created centralized configuration system in `server/config.ts`
- Implemented automatic domain detection for Replit deployments
- Added proper CORS configuration for cross-origin requests
- Updated client-side API requests to use shared constants
- Created environment configuration files (.env.example, .env.production)
- Enhanced session security with environment-specific cookie settings
- Successfully completed migration from Replit Agent to standard Replit environment

### January 18, 2025 - Database Setup & Storage System
- Implemented flexible storage system with database fallback to in-memory storage
- Created comprehensive MemStorage class for development and testing
- Added automatic database detection and fallback mechanism
- Enhanced application resilience with graceful database connectivity handling
- Application now runs successfully with both database and memory storage options
- Admin user automatically created with credentials: admin/admin123
- Ready for PostgreSQL database integration when DATABASE_URL is provided