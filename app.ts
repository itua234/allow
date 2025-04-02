import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import 'module-alias/register';
// import './app/services/queues';

// Load environment variables
dotenv.config();

// Import modules with proper types
import db from './models'
import api from './routes/api';
//import web from './routes/web';
// import jwt from 'jsonwebtoken';
import AppError from '@util/appError';
import globalErrorHandler from '@util/errorHandler';

const app: Application = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});

const { PORT, NODE_ENV } = process.env;

// Error handling for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error: Error) => {
  console.error('FATAL ERROR 💥', error);
});

process.on('unhandledRejection', (error: Error) => {
  console.error('UNHANDLED REJECTION 💥', error);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED.');
});

// Database synchronization options
const syncOptions = NODE_ENV == "development" ? {} : { alter: false };

// Connect to database and start server
db.sequelize.authenticate()
.then(() => {
  console.log('Connection has been established successfully.');
  return db.sequelize.sync(syncOptions);
})
.then(() => {
  console.log('Database synchronized');
  app.listen(PORT, () => {
    console.log(`[START] Server running on Port: ${PORT}`);
  });
  useRoutes();
})
.catch((err: Error) => {
  console.error('Unable to connect to the database:', err);
});

// Routes configuration
function useRoutes(): void {
  // Apply rate limiter to API routes
  app.use('/api', limiter);
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  // Route to render test page
  app.get('/', (req: Request, res: Response) => {
    res.render('index', {
      companyId: 'dev_company_123', // Your test company ID
      apiKey: 'test_api_key_123'    // Your test API key
    });
  });

  // Main routes
  // app.use('/', web);
  app.use('/api/v1', api);

  // Handling unhandled routes for all HTTP methods
  app.all("*", (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  });

  // Global error handler
  app.use(globalErrorHandler);
}

export default app;