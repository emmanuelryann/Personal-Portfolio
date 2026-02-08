import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cookieParser from 'cookie-parser';
import contactRouter from './routes/contact.js';
import contentRouter from './routes/content.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import downloadRouter from './routes/download.js';
import { verifyTransporter } from './config/email.js';
import { corsHeaders, securityHeaders, checkEnvVars, gracefulShutdown, requestLogger, secureStaticFiles } from './middleware/security.js';

checkEnvVars();

const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('trust proxy', 1);

app.use(requestLogger);
app.use(corsHeaders);
app.use(securityHeaders);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  setHeaders: secureStaticFiles,
}));

app.use('/api/contact', contactRouter);
app.use('/api/content', contentRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/download-cv', downloadRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'ok', 
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  console.warn('⚠️  404 Not Found:', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  
  const message = NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  const statusCode = err.status || 500;
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.toString(),
    }),
  });
});

const startServer = async () => {
  try {
    await verifyTransporter();
    
    const server = app.listen(PORT, () => {
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
    });
  
    gracefulShutdown(server);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();