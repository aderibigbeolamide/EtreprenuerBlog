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

### January 19, 2025 - Migration Completion & Authentication Enhancement
- Successfully completed migration from Replit Agent to standard Replit environment
- Fixed critical authentication issue in admin user creation process
- Admin user now properly created with role 'admin' and isApproved: true
- Authentication system fully functional with session-based login working
- All required packages installed and configured correctly
- Application running cleanly on port 5000 with proper security practices
- Client/server separation maintained with robust API structure
- Login credentials confirmed working: admin/admin123
- **Enhanced whitespace handling in authentication:**
  - Frontend: Automatic trimming of username/password fields before submission
  - Backend: Server-side trimming for login and registration endpoints
  - Form validation: Buttons disabled when inputs are empty after trimming
  - Password confirmation: Trimmed comparison for accurate matching
  - Input validation: Prevents submission of whitespace-only credentials

### January 20, 2025 - User Registration & Dashboard Implementation
- **Successfully completed migration from Replit Agent to standard Replit environment**
- **Implemented comprehensive user registration approval workflow:**
  - New users register and receive approval message
  - Admin approval required before users can access features
  - Role-based authentication redirects (admin → admin dashboard, user → user dashboard)
  - Enhanced login page with home navigation button
- **Created complete user dashboard for approved users:**
  - Staff profile creation and management (name, role, bio, email, LinkedIn)
  - Personal blog post creation, editing, and deletion
  - View published and draft posts with proper status indicators
  - User can only edit their own content (security enforced)
- **Fixed database schema and authentication issues:**
  - Added user_id column to staff table for user-staff relationship
  - Enhanced authentication with detailed error logging
  - Proper session management and CORS configuration
- **Enhanced security and user experience:**
  - Users can only access their own staff profiles and blog posts
  - Comprehensive form validation and error handling
  - Toast notifications for user feedback
  - Responsive design for all dashboard components

### January 20, 2025 - Authentication API Fix & Complete Whitespace Resolution
- **Fixed critical authentication API issue:**
  - Corrected apiRequest function signature in queryClient.ts from (method, url, data) to (url, options)
  - Updated all authentication mutations in use-auth.tsx to use new signature
  - Fixed user approval system that was failing due to incorrect API call format
  - All API endpoints now properly communicate between frontend and backend
- **Comprehensive whitespace handling verification:**
  - Tested login with padded whitespace: "  testuser  " and "  testpass  " successfully authenticates
  - Backend properly trims credentials before authentication check
  - Frontend validation prevents empty or whitespace-only submissions
  - User approval system working correctly for approved accounts
  - Session management fully functional with proper cookie handling

### January 20, 2025 - Enhanced User Dashboard & Blog Management
- **Fixed database schema issue:**
  - Successfully added missing user_id column to staff table
  - Users can now create and manage their own staff profiles
- **Enhanced user dashboard with complete functionality:**
  - Added profile image upload capability with Cloudinary integration
  - Users can edit their profiles with image upload functionality
  - Created "All Staff" tab for viewing other staff members (read-only)
  - Added visual indicators showing user's own profile
  - Profile creation form with image upload using camera icon interface
- **Fixed user blog deletion functionality:**
  - Added user delete route `/api/blog-posts/:id` for regular users
  - Users can now delete their own blog posts with proper security
  - Only blog authors can delete their own posts (admins can delete any)
  - Security enforced at backend level with author verification
- **Branding and SEO improvements:**
  - Set University of Abuja logo as website favicon
  - Added comprehensive meta tags for SEO and social media sharing
  - Enhanced page title and description for better search visibility
  - Added Open Graph tags for improved social media link previews

### January 19, 2025 - Enhanced Video System & Migration Completion
- **Fixed staff image display issues:**
  - Improved circular image containers to properly show faces without cropping
  - Increased image size from 20x20/24x24 to 24x24/28x28 for better visibility
  - Added proper image positioning (center 25%) to focus on face area
  - Applied consistent fixes across staff cards and blog author images
  - Added subtle ring border for visual enhancement
- **Updated footer content:**
  - Changed copyright year from "© 2024" to "© 2025"
  - Replaced "All rights reserved" with university motto: "changing the world through innovations"
- **Updated About page image:**
  - Replaced Senate Building image with new uploaded image (AboutImage_1752952602352.jpeg)
  - Updated alt text to reflect Centre of Entrepreneurship branding
- **Enhanced Video System for Better Quality & Flexibility:**
  - Increased video upload limit from 50MB to 100MB for higher quality content
  - Implemented advanced video player with custom controls and quality selection
  - Added adaptive video streaming with multiple quality options (1080p, 720p, 480p, 360p)
  - Enhanced video upload processing with H.264 codec and AAC audio for better compatibility
  - Created video preview component with metadata display and compression options
  - Improved video resolution detection and quality badges
  - Added download functionality and fullscreen support to video player
  - Implemented progressive loading and better video optimization through Cloudinary

### January 18, 2025 - Database Setup & Storage System
- Implemented flexible storage system with database fallback to in-memory storage
- Created comprehensive MemStorage class for development and testing
- Added automatic database detection and fallback mechanism
- Enhanced application resilience with graceful database connectivity handling
- Application now runs successfully with both database and memory storage options
- Admin user automatically created with credentials: admin/admin123
- Ready for PostgreSQL database integration when DATABASE_URL is provided
- Fixed TypeScript errors in storage implementation
- Created comprehensive local setup documentation (LOCAL_SETUP.md)
- Added troubleshooting guide for common development issues