const mysql = require("mysql2");

// Database connection creation the below credentials taken from the .env file

const dbConnection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
});

module.exports = dbConnection.promise();
