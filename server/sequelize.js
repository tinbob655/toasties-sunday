
const { Sequelize } = require('sequelize');

let sequelize;
if (true) {
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/data.sqlite',
    logging: false,
  });
}

module.exports = sequelize;
