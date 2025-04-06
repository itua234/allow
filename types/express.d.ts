import 'express';

declare module 'express' {
    export interface Request {
        value?: Record<string, any>;
        //value?: { [key: string]: any }
    }
}