import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

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
        "'unsafe-inline'",
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
          : process.env.FRONTEND_URL
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

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many contact form submissions. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many upload attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const contentUpdateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many content updates. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateToken = () => '';

const checkEnvVars = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'NODEMAILER_USER',
    'NODEMAILER_PASS',
    'WEBSITE_URL',
    'PORT'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ FATAL: Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  console.log('✅ All required environment variables are set');
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
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      duration: `${duration}ms`,
    };

    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('⚠️  Unauthorized access attempt:', logData);
    } else if (res.statusCode === 429) {
      console.warn('⚠️  Rate limit exceeded:', logData);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('📝', logData);
    }
  });

  next();
};

// Security headers middleware for static files
const secureStaticFiles = (res, filePath) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  
  // Add Content-Security-Policy for specific file types
  if (filePath.endsWith('.pdf')) {
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
  }
};

export {
  corsHeaders,
  securityHeaders,
  generalRateLimit,
  authRateLimit,
  contactRateLimit,
  uploadRateLimit,
  contentUpdateRateLimit,
  generateToken,
  checkEnvVars,
  gracefulShutdown,
  requestLogger,
  secureStaticFiles,
};