#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Verifies all required environment variables and build artifacts
 */

import fs from 'fs';
import path from 'path';

const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET'
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'NODE_ENV',
  'PORT'
];

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  
  const missing = [];
  const warnings = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName} is set`);
    }
  });
  
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    } else {
      console.log(`✅ ${varName} is set`);
    }
  });
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  Optional environment variables not set: ${warnings.join(', ')}`);
  }
  
  return true;
}

function checkBuildArtifacts() {
  console.log('\n🔍 Checking build artifacts...');
  
  const distPath = path.resolve('dist');
  const publicPath = path.resolve('dist/public');
  const serverPath = path.resolve('dist/index.js');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist directory not found. Run: npm run build');
    return false;
  }
  
  if (!fs.existsSync(publicPath)) {
    console.error('❌ dist/public directory not found. Run: npm run build');
    return false;
  }
  
  if (!fs.existsSync(serverPath)) {
    console.error('❌ dist/index.js not found. Run: npm run build');
    return false;
  }
  
  const indexHtml = path.resolve('dist/public/index.html');
  if (!fs.existsSync(indexHtml)) {
    console.error('❌ dist/public/index.html not found. Run: npm run build');
    return false;
  }
  
  console.log('✅ All build artifacts present');
  return true;
}

function checkDatabaseConnection() {
  console.log('\n🔍 Checking database configuration...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    return false;
  }
  
  try {
    const url = new URL(dbUrl);
    if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
      console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
      return false;
    }
    console.log('✅ DATABASE_URL format is valid');
    return true;
  } catch (error) {
    console.error('❌ DATABASE_URL format is invalid:', error.message);
    return false;
  }
}

function checkSessionSecret() {
  console.log('\n🔍 Checking session security...');
  
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.error('❌ SESSION_SECRET not set');
    return false;
  }
  
  if (secret.length < 32) {
    console.error('❌ SESSION_SECRET should be at least 32 characters long');
    return false;
  }
  
  console.log('✅ SESSION_SECRET is properly configured');
  return true;
}

function main() {
  console.log('🚀 Pre-deployment checks\n');
  
  const checks = [
    checkEnvironmentVariables,
    checkBuildArtifacts,
    checkDatabaseConnection,
    checkSessionSecret
  ];
  
  const results = checks.map(check => check());
  const allPassed = results.every(result => result);
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('✅ All checks passed! Ready for deployment');
    process.exit(0);
  } else {
    console.error('❌ Some checks failed. Please fix the issues above');
    process.exit(1);
  }
}

main();