
const { Sequelize } = require('sequelize');

let sequelize;
if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/account.sqlite',
    logging: false,
  });
}

module.exports = sequelize;
