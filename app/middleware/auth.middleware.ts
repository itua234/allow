import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import { JwtPayload } from 'jsonwebtoken';
const User = require('@models/user');
const { 
    TOKEN_SECRET, 
    APP_TOKEN, 
    REFRESH_TOKEN_SECRET, 
    TOKEN_EXPIRE, 
    REFRESH_TOKEN_EXPIRE 
} = process.env;

module.exports = {
    authGuard: async (req: Request, res: Response, next: NextFunction) => {
        try{
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token == null) return res.status(401).json({ error: true, message: "unauthenticated" });
            console.log(token);

            const decoded = jwt.verify(token, TOKEN_SECRET as string) as JwtPayload;
            const getUser = await User.findOne({
                where: { email: decoded.user.email },
                raw: true,
            });
            if(!getUser) throw 'Invalid Access Token Sent';
            req.user = getUser;
            next();
        }catch (error) {
            return res.status(401).json({ 
                error: true, 
                message: 'Unauthenticated' 
            });
        }
    },

    appGuard: (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];
        const appKey = authHeader && authHeader.split(' ')[1];
        if (appKey === APP_TOKEN) {
            next();
        } else {
            return res.status(403).json({ error: true, message: "Forbidden" });
        }
    },

    createAccessToken: (user: Record<string, any>): string => {
        return jwt.sign({ user }, TOKEN_SECRET || 'default_token_secret', { algorithm: 'RS256', expiresIn: TOKEN_EXPIRE });
    },

    createRefreshToken: (user: Record<string, any>): string => {
        return jwt.sign({ user: user.id }, REFRESH_TOKEN_SECRET || 'default_token_secret', { algorithm: 'RS256', expiresIn: REFRESH_TOKEN_EXPIRE });
    },
}