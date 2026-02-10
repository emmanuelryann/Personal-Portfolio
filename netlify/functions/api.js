import dotenv from 'dotenv';
import path from 'path';
import serverless from 'serverless-http';

// In ESM, __dirname is not available by default. 
// However, when Netlify bundles with esbuild, it may attempt to convert to CJS.
// We'll use a safer approach for both environments.
const __dirname = path.resolve();

// Only use dotenv in development. In Netlify/Production, variables are set in the UI.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, 'server/.env') });
}

import express from 'express';
import cookieParser from 'cookie-parser';
import contactRouter from '../../server/routes/contact.js';
import contentRouter from '../../server/routes/content.js';
import authRouter from '../../server/routes/auth.js';
import uploadRouter from '../../server/routes/upload.js';
import downloadRouter from '../../server/routes/download.js';
import { verifyTransporter } from '../../server/config/email.js';
import { corsHeaders, securityHeaders, checkEnvVars, gracefulShutdown, requestLogger, secureStaticFiles } from '../../server/middleware/security.js';

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

// app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
//   maxAge: '1d',
//   etag: true,
//   setHeaders: secureStaticFiles,
// }));

app.use('/contact', contactRouter);
app.use('/content', contentRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);
app.use('/download-cv', downloadRouter);

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'ok', 
    message: 'Serverless function running',
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

// const startServer = async () => {
//   try {
//     await verifyTransporter();
    
//     const server = app.listen(PORT, () => {
//       console.log(`🌐 Server running on: http://localhost:${PORT}`);
//     });
  
//     gracefulShutdown(server);
    
//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   }
// };

// const handler = serverless(app);

export const handler = async (event, context) => {
  try {
    await verifyTransporter(); 
    const serverlessHandler = serverless(app);
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('❌ Serverless Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: 'Internal Server Error' 
      }),
    };
  }
};

// startServer();