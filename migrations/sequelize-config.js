// Sequelize CLI config — reads DATABASE_URL from the environment
// Usage: npx sequelize-cli db:migrate
require('dotenv').config();

module.exports = {
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
  },
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
  },
};