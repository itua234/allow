const { faker } = require('@faker-js/faker');

// Log available categories
console.log('Available Faker Categories:', Object.keys(faker));

// Example: Explore person methods
console.log('\nPerson Methods:', Object.keys(faker.person));

// Example: Explore internet methods
console.log('\nInternet Methods:', Object.keys(faker.internet));

// Example: Explore date methods
console.log('\nDate Methods:', Object.keys(faker.company));

// - faker.person - names, gender, etc.
// - faker.internet - emails, usernames, passwords
// - faker.date - past, future, between dates
// - faker.location - addresses, cities, countries
// - faker.company - company names, catchPhrases
// - faker.image - avatar, urls for various types of images
// - faker.finance - account numbers, transactions
// - faker.vehicle - vehicle information
// - faker.phone - phone numbers
// - faker.string - random strings, uuids
// Each category has multiple methods you can use to generate specific types of data.


// const { createClient } = require("redis");

// let client = null;
// const redisHost = process.env.REDIS_HOST || 'YOUR-REDIS-HOST';
// const redisPort = process.env.REDIS_PORT || 6379;
// const redisPassword = process.env.REDIS_PASSWORD || 'YOUR-REDIS-PASSWORD';
// const redisUser = process.env.REDIS_USER || '';
// const redisTls = process.env.REDIS_TLS === 'true';

// //if (!client) { 
//   client = createClient({
//     url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
//     socket: {
//       connectTimeout: 10000, // Set timeout to 10 seconds
//     },
//   });
//   client.on("error", (error) => {
//     console.error("Redis client error:", error);
//   });
//   client.on("connect", () => {
//     console.log('Redis URL:', `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
//     console.log("Connected to Redis");
//   });
//   (async () => {
//     try {
//       await client.connect();
//     } catch (error) {
//       console.error("Error connecting to Redis:", error);
//     }
//   })();
// //}

// module.exports = client;