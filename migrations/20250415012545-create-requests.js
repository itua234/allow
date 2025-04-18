'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('requests', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      company_id: { type:Sequelize.UUID, allowNull: false },
      customer_id: { type:Sequelize.UUID, allowNull: true },
      reference: { type: Sequelize.STRING, allowNull: false, unique: true },
      redirect_url: { type: Sequelize.STRING, allowNull: false },
      kyc_level: { type: Sequelize.ENUM('basic', 'advanced'), allowNull: false },
      bank_accounts: { type: Sequelize.BOOLEAN, allowNull: false },
      allow_url: {type: Sequelize.STRING, allowNull: true},
      kyc_token: {type: Sequelize.STRING, allowNull: false},
      token_expires_at: { type: Sequelize.DATE, allowNull: false},
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }, 
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
    // Add index on reference for faster lookups
    await queryInterface.addIndex('requests', ['reference']);
    // Add index on customer_id for faster lookups when searching by identity document
    await queryInterface.addIndex('requests', ['customer_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('requests');
  }
};