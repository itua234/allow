import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
//import { appGuard, authGuard } from "@middleware/auth.middleware";
import multer, { MulterError, StorageEngine } from 'multer';
import customerValidator from '@validators/auth.validator';

// const authRoutes = require('./authRoutes');
// const auth = require('@controllers/auth.controller');
// const user = require('@controllers/user.controller');

// Configure multer for file uploads
const storage: StorageEngine = multer.memoryStorage();;
const upload = multer({ storage: storage });

// Middleware to handle multer errors
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof MulterError && err.code === "LIMIT_FILE_COUNT"){
        console.log("Too many files. Max allowed: 5 files");
        return res.status(422).json({
            message: "failed to create new event",
            error: {
                images: "Too many files. Max allowed: 3 files"
            }
        });
    }else if (err) {
        return res.status(500).json({
            message: "Failed to upload files",
            error: err.message
        });
    }
    next();
}

router.get('/', function (req: Request, res: Response) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
        status: 'ok',
        app: 'allow!! API...',
        version: '1.1.0'
    });
});

router.post('/allow/initiate', function (req: Request, res: Response) {
    res.json({
        message: 'Customer payload is valid!',
        data: req.body,
    });
});
router.get('/allow/customers', function (req: Request, res: Response) {
    res.json({
        status: 'ok',
        app: 'allow!! API...',
        version: '1.1.0'
    });
});
router.route('/allow/customers/:reference') 
.get(function (req: Request, res: Response) {
    res.json({
        status: 'ok',
        app: 'allow!! API...',
        version: '1.1.0'
    });
}).delete(function (req: Request, res: Response) {
    res.json({
        status: 'ok',
        app: 'allow!! API...',
        version: '1.1.0'
    });
});

router.post('/allow/customers/blacklist', function (req: Request, res: Response) {
    res.json({
        status: 'ok',
        app: 'allow!! API...',
        version: '1.1.0'
    });
});
router.post('/allow/customers/whitelist', function (req: Request, res: Response) {
    res.json({
        status: 'ok',
        app: 'allow!! API...',
        version: '1.1.0'
    });
});
// router.get('/user', [authGuard], user.get_user)

export default router;