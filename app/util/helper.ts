import { Response } from 'express';
import crypto from 'crypto';

//const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key'; // Must be 32 bytes
//const IV_LENGTH = 16; // Initialization vector length

// function encrypt(text: string): string {
//     const iv = crypto.randomBytes(IV_LENGTH);
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
//     let encrypted = cipher.update(text);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return iv.toString('hex') + ':' + encrypted.toString('hex');
// }

// function decrypt(text: string): string {
//     const [iv, encryptedText] = text.split(':');
//     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex'));
//     let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     return decrypted.toString();
// }
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'b0d7b616b2c218f739706ef5fd13aac1f111ce2871172dc669bba2e2ccf2008d', 'hex');
const IV_LENGTH = 16;

function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
    const [iv, encryptedText] = text.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const returnValidationError = (errors: any, res: Response, message: string) => {
    Object.keys(errors).forEach((key, index) => {
        errors[key] = errors[key]["message"];
    });

    return res.status(422).json({
        message: message,
        error: errors
    });
}

module.exports = {encrypt, decrypt, returnValidationError};