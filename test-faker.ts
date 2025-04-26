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