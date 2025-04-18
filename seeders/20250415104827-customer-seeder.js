'use strict';
// const faker = require("faker");
// const User = require("../models").User;
//const { encrypt } = require('../app/util/helper');
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid'); // Add this for UUID generation
//const ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex'); // 32 bytes (64 characters in hex)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
  : crypto.randomBytes(32); // Fallback to a secure random key if the environment variable is missing
console.log('Your Encryption Key:', ENCRYPTION_KEY);
const IV_LENGTH = 16; // Initialization vector length

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv); // AES-256 requires a 32-byte key
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex'); // Combine IV with encrypted text
}
// Deterministic encryption (for searchable fields)
function encryptDeterministic(text) {
  if (!text) return null;
  // Use a fixed IV for deterministic encryption - ONLY for search fields
  const fixedIv = Buffer.from('0000000000000000', 'hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, fixedIv);
  let encrypted = cipher.update(text.toString().toLowerCase());
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
}
// Decryption function
function decryptDeterministic(encryptedText) {
  if (!encryptedText) return null;
  
  const fixedIv = Buffer.from('0000000000000000', 'hex');
  const encryptedBuffer = Buffer.from(encryptedText, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, fixedIv);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('customers', [
      {
        id: uuidv4(),
        name: encrypt('John Doe'), // Encrypting the name
        email: encrypt('johndoe@example.com'), // Encrypting the email
        phone: encrypt('1234567890'), // Encrypting the phone
        phone_verified_at: null,
        dob: encrypt('1990-01-01'), // Encrypting the date of birth
        verified: true,
        verified_at: new Date(),
        status: 'VERIFIED',
        address: '123 Main Street, Lagos',
        is_blacklisted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: encrypt('Jane Smith'),
        email: encrypt('janesmith@example.com'),
        phone: encrypt('0987654321'),
        phone_verified_at: new Date(),
        dob: encrypt('1985-05-15'),
        verified: false,
        verified_at: null,
        status: 'PENDING',
        address: '456 Elm Street, Abuja',
        is_blacklisted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('customers', null, {});
  },
};

