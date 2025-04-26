'use strict';
// const faker = require("faker");
// const User = require("../models").User;
//const { encrypt } = require('../app/util/helper');
const crypto = require("crypto");
const {faker} = require("@faker-js/faker");
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
    const customers = Array.from({ length: 5 }, () => ({
      //id: uuidv4(),
      id: faker.string.uuid(),
      name: encrypt(faker.person.fullName()),
      email: encrypt(faker.internet.email()),
      phone: encrypt(faker.phone.number()),
      phone_verified_at: null,
      dob: encrypt(faker.date.birthdate().toISOString()),
      verified: faker.datatype.boolean(),
      verified_at: new Date(),
      status: faker.helpers.arrayElement(['VERIFIED', 'PENDING']),
      address: encrypt(faker.location.streetAddress()),
      is_blacklisted: faker.datatype.boolean(),
      created_at: new Date(),
      updated_at: new Date(),
      // searchable_name: encryptDeterministic(faker.person.fullName()),
      // searchable_email: encryptDeterministic(faker.internet.email()),
      // searchable_phone: encryptDeterministic(faker.phone.number()),
      // searchable_address: encryptDeterministic(faker.location.streetAddress()),
    }));
    return queryInterface.bulkInsert('customers', customers);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('customers', null, {});
  },
};

