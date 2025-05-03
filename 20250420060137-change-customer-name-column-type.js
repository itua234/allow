'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = [
      { name: 'name', options: { type: Sequelize.STRING(255), allowNull: false } },
      { name: 'email', options: { type: Sequelize.STRING(255), allowNull: false, unique: true } },
      { name: 'phone', options: { type: Sequelize.STRING(255), allowNull: true, unique: true } },
      { name: 'dob', options: { type: Sequelize.STRING(255), allowNull: true } },
    ];

    for (const column of columns) {
      await queryInterface.changeColumn('customers', column.name, column.options);
    }
  },

  async down(queryInterface, Sequelize) {
    const columns = [
      { name: 'name', options: { type: Sequelize.STRING, allowNull: false } },
      { name: 'email', options: { type: Sequelize.STRING, allowNull: false, unique: true } },
      { name: 'phone', options: { type: Sequelize.STRING, allowNull: true, unique: true } },
      { name: 'dob', options: { type: Sequelize.STRING, allowNull: true } },
    ];

    for (const column of columns) {
      await queryInterface.changeColumn('customers', column.name, column.options);
    }
  },
};