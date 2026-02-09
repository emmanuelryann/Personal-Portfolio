import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const corsHeaders = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.WEBSITE_URL]
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.cdnfonts.com",
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
        "https://fonts.cdnfonts.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
      ],
      connectSrc: [
        "'self'",
        process.env.NODE_ENV === 'development' 
          ? "http://localhost:*" 
          : process.env.WEBSITE_URL
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
});

const checkEnvVars = () => {
  const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_VERSION;
  
  const requiredEnvVars = [
    'JWT_SECRET',
    'NODEMAILER_USER',
    'NODEMAILER_PASS',
    'WEBSITE_URL'
  ];

  // Only require PORT if running as a persistent server (not serverless)
  if (!isServerless) {
    requiredEnvVars.push('PORT');
  }

  const missing = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `❌ Missing required environment variables: ${missing.join(', ')}`;
    console.error(errorMsg);
    
    // In serverless, we log but don't crash, as some features might be optional
    // or the environment might be partially configured.
    if (!isServerless) {
      console.error('FATAL: Exiting due to missing configuration.');
      process.exit(1);
    } else {
      console.warn('⚠️  Running in Serverless mode: Proceeding despite missing configuration. Some features may not work.');
    }
  } else {
    console.log('✅ All required environment variables are set');
  }
};

const gracefulShutdown = (server) => {
  const shutdown = async () => {
    console.log('\n📛 Received shutdown signal, closing server gracefully...');
    
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.error('❌ Forcing shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    shutdown();
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown();
  });
};

const requestLogger = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
      console.warn('⚠️ Security event:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ip: req.ip,
      });
    }
  });
  next();
};

// Security headers middleware for static files
const secureStaticFiles = (res, filePath) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (filePath.endsWith('.pdf')) {
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
  }
};

export {
  corsHeaders,
  securityHeaders,
  checkEnvVars,
  gracefulShutdown,
  requestLogger,
  secureStaticFiles,
};