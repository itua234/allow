import 'express';

declare module 'express' {
    export interface Request {
        value?: Record<string, any>;
        user?: Record<string, any>;
    }
}