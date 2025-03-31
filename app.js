const express = require('express');
const app = express();
require('dotenv').config();
require('module-alias/register');
//require('./app/services/queues'); 

const db = require('@models');
const api = require('./routes/api');
const web = require('./routes/web');
//const jwt = require('jsonwebtoken');

const AppError = require('@util/appError');
const globalErrorHandler = require('@util/errorHandler');

//app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

const cors = require('cors');
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',')
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
// Security middleware
const helmet = require('helmet');
app.use(helmet());
// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});

const { PORT, NODE_ENV } = process.env; 

process.on('uncaughtException', (error) => {
    console.error('FATAL ERROR 💥', error);
});
process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED REJECTION 💥', error);
});
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED.');
});

const syncOptions = NODE_ENV == "development" ? {} : { alter: false };
db.sequelize.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
    return db.sequelize.sync(syncOptions);
}).then(() => {
    console.log('Database synchronized');
    app.listen(PORT, () => {
        console.log(`[START] Server running on Port: ${PORT}`);
    });
    useRoutes();
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

function useRoutes() {
    app.use('/api', limiter);
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString()
        });
    });

    // Route to render your test page
    app.get('/', (req, res) => {
        res.render('test-modal', {
        companyId: 'dev_company_123', // Your test company ID
        apiKey: 'test_api_key_123'    // Your test API key
        });
    });

    //app.use('/', web);
    app.use('/api/v1', api);
    //Handling unhandles routes for all http methods
    app.all("*", (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });
    app.use(globalErrorHandler);
}

module.exports = app;