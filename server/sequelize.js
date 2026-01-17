
const { Sequelize } = require('sequelize');

let sequelize;
if (process.env.MYSQL_URL) {
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false,
  });
}
else if (process.env.NODE_ENV === 'production') {
  throw new Error('MYSQL_URL environment variable is not set! Cannot start in production without a database.');
}
else {
  // Local development fallback to SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/data.sqlite',
    logging: false,
  });
}

module.exports = sequelize;