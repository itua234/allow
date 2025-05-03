import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import csrf from 'csurf';
dotenv.config(); // Load environment variables
import 'module-alias/register';
// import './app/services/queues';
//const client = require("@util/client");
// client.connect()
//   .then(() => console.log('Client connected successfully'))
//   .catch((err: Error) => console.error('Failed to connect client:', err));

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

// Security middleware
app.use(helmet());

app.use(csrf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Rate limiting
const limiter = rateLimit({
  max: 5, // limit each IP to 5 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many verification attempts, please try again later'
});

const { PORT, NODE_ENV } = process.env;

// Error handling for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error: Error) => {
  console.error('FATAL ERROR 💥', error);
});
process.on('unhandledRejection', (error: Error) => {
  console.error('UNHANDLED REJECTION 💥', error);
});
// Add this for graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED.');
});

// Start the server
async function startServer() {
  try {   
    // Always authenticate first
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    // Only authenticate on first start, not on every reload
    if (!db.sequelize.connectionManager.hasOwnProperty('getConnection')) {
      if (process.env.FORCE_DB_SYNC === 'true') {
        const syncOptions = NODE_ENV == "development" ? {} : { alter: false };
        await db.sequelize.sync(syncOptions);
        console.log('Connection has been established successfully.');
      }
    }

    app.listen(PORT, () => {
      console.log(`[START] Server running on Port: ${PORT}`);
    });
    useRoutes();
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
}

// Routes configuration
function useRoutes(): void {
  // Apply rate limiter to API routes
  app.use('/api', limiter);

  // app.use((req, res, next) => {
  //   res.setHeader("Content-Security-Policy", "script-src 'self' http://127.0.0.1:8080");
  //   next();
  // });
  app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "script-src 'self' http://127.0.0.1:8080 'unsafe-inline'"
    );
    next();
});
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  // Route to render test page
  app.get('/', async (req: Request, res: Response) => {
    //await client.set("foo", "bar");
    const user = {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstname": "John",
      "lastname": "Doe",
      "email": "johndoe@example.com",
      "phone": "+1234567890",
      "dob": "1990-05-15",
      "verified": true,
      "verified_at": "2024-04-01T10:00:00Z",
      "status": "VERIFIED",
      "photo": "https://example.com/photo.jpg",
      "address": "123 Main Street, Apt 4B",
      "country": "USA",
      "state": "California",
      "city": "Los Angeles",
      "zip_code": "90001",
      "verification_documents": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "BVN",
          "text": "12345678901",
          "image": "https://example.com/bvn.jpg",
          "verified": true,
          "verified_at": "2024-04-01T10:00:00Z",
          "expired_at": "2034-04-01T10:00:00Z"
        },
        {
          "id": "234e5678-e89b-12d3-a456-426614174001",
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "NIN",
          "text": "98765432109",
          "image": "https://example.com/nin.jpg",
          "verified": true,
          "verified_at": "2024-04-01T10:00:00Z",
          "expired_at": "2030-04-01T10:00:00Z"
        },
        {
          "id": "345e6789-e89b-12d3-a456-426614174002",
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "PASSPORT",
          "text": "A12345678",
          "image": "https://example.com/passport.jpg",
          "verified": true,
          "verified_at": "2024-04-01T10:00:00Z",
          "expired_at": "2034-04-01T10:00:00Z"
        },
        {
          "id": "456e7890-e89b-12d3-a456-426614174003",
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "DRIVERS_LICENSE",
          "text": "D12345678",
          "image": "https://example.com/drivers_license.jpg",
          "verified": false,
          "verified_at": null,
          "expired_at": "2028-04-01T10:00:00Z"
        },
        {
          "id": "567e8901-e89b-12d3-a456-426614174004",
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "VOTERS_CARD",
          "text": "VC12345678",
          "image": "https://example.com/voters_card.jpg",
          "verified": false,
          "verified_at": "2024-04-01T10:00:00Z",
          "expired_at": "2032-04-01T10:00:00Z"
        }
      ]
    }
    
    res.render('allow', {
      user: user,
    });
  });
  app.get('/test-modal', async (req: Request, res: Response) => {
    res.render('main');
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

startServer();
export default app;