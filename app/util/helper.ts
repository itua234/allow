import { Response } from 'express';
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'b0d7b616b2c218f739706ef5fd13aac1f111ce2871172dc669bba2e2ccf2008d', 'hex');
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-ecb'; // ECB mode allows deterministic encryption (but has security trade-offs)

// function encryptDeterministic(text: string) {
//   const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, null); // No IV
//   const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
//   return encrypted.toString('hex');
// }

// function decryptDeterministic(encryptedText: string) {
//   const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, null);
//   const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
//   return decrypted.toString('utf8');
// }

function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function hash(text: string) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

function decrypt(text: string): string {
    const [iv, encryptedText] = text.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// function encrypt(encryptionKey, payload) {
//     const text = JSON.stringify(payload);
//     const forge = require("node-forge");
//     const cipher = forge.cipher.createCipher(
//         "3DES-ECB",
//         forge.util.createBuffer(encryptionKey)
//     );
//     cipher.start({iv: ""});
//     cipher.update(forge.util.createBuffer(text, "utf-8"));
//     cipher.finish();
//     const encrypted = cipher.output;
//     return forge.util.encode64(encrypted.getBytes());
// }

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