'use strict';

const bcrypt = require('bcrypt'); 
const { v4: uuidv4 } = require('uuid'); 

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    // Hash the password inside the up function
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Reckless@3030", salt);

    return queryInterface.bulkInsert('companies', [
      {
        id: uuidv4(),
        name: 'Tech Innovators Inc.',
        logo: 'https://example.com/logo1.png',
        email: 'contact@techinnovators.com',
        password: hashedPassword,
        domain: 'techinnovators.com',
        webhookUrl: 'https://webhooks.techinnovators.com',
        verified: true,
        notificationsEnabled: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Global Solutions Ltd.',
        logo: 'https://example.com/logo2.png',
        email: 'info@globalsolutions.com',
        password: hashedPassword,
        domain: 'globalsolutions.com',
        webhookUrl: 'https://webhooks.globalsolutions.com',
        verified: false,
        notificationsEnabled: false,
        email_verified_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('companies', null, {});
  },
};