// const env = process.env.NODE_ENV || 'development';
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'mgdb01.sldb.iwinv.net',
    user: 'molg',
    password: 'molg2020@@',
    database: 'molg',
  },
});
module.exports = knex;
