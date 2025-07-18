// Configuration utility for handling environment variables
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // Domain configuration
  APP_DOMAIN: getAppDomain(),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-secret-for-development',
  
  // External APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
} as const;

function getAppDomain(): string {
  // If APP_DOMAIN is explicitly set, use it
  if (process.env.APP_DOMAIN) {
    return process.env.APP_DOMAIN;
  }
  
  // For production on Replit, use the Replit domain
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  
  // For local development, use localhost with the port
  const port = process.env.PORT || '5000';
  return `http://localhost:${port}`;
}

// Helper function to check if we're in production
export const isProduction = () => config.NODE_ENV === 'production';

// Helper function to check if we're in development
export const isDevelopment = () => config.NODE_ENV === 'development';

// Helper function to get the full URL for a path
export const getFullUrl = (path: string = ''): string => {
  const domain = config.APP_DOMAIN.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${domain}${cleanPath}`;
};

// Log configuration on startup (excluding sensitive information)
export const logConfig = () => {
  console.log('🔧 Configuration:');
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Port: ${config.PORT}`);
  console.log(`   App Domain: ${config.APP_DOMAIN}`);
  console.log(`   Database: ${config.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`   OpenAI API: ${config.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Cloudinary: ${config.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Not configured'}`);
};