
const { Sequelize } = require('sequelize');

const poolConfig = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000, //release idle connections after 10 seconds
};

let sequelize;
if (process.env.MYSQL_URL) {
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false,
    pool: poolConfig,
  });
}
else if (process.env.NODE_ENV === 'production') {
  throw new Error('MYSQL_URL environment variable is not set! Cannot start in production without a database.');
}
else {

  //local development fallback to SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/data.sqlite',
    logging: false,
    pool: poolConfig,
  });
}

module.exports = sequelize;