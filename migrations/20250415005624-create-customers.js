'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customers', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      // name: { type: Sequelize.STRING, allowNull: false },
      // email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: { type: Sequelize.STRING, allowNull: true, unique: true },
      phone_verified_at: {type: Sequelize.DATE, allowNull: true },
      // dob: { type: Sequelize.STRING, allowNull: true },
      verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      verified_at: { type: Sequelize.DATE, allowNull: true },
      status: {
        type: Sequelize.ENUM(
          'PENDING', 
          'VERIFIED', 
          'REJECTED'
        ),
        defaultValue: 'PENDING'
      },
      // address: { type: Sequelize.TEXT, allowNull: true },
      is_blacklisted: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }, 
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
    // Add index on phone for faster lookups when searching by phone
    await queryInterface.addIndex('customers', ['phone']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('customers');
  }
};
