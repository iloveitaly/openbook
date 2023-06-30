// loop through database named `venture_capital_firms` and connect via a mySQL database connection

// import mysql from 'mysql2/promise';
const mysql = require("mysql2/promise");
const url = require('url');
const invariant = require('tiny-invariant');

const mysqlUrl = process.env.MYSQL_DATABASE_URL
invariant(mysqlUrl, 'MYSQL_DATABASE_URL is not defined');

const dbUrl = new URL(mysqlUrl);
const username = dbUrl.username;
const password = dbUrl.password;

const run = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: dbUrl.port,
      user: username,
      password: password,
      database: dbUrl.pathname.substr(1), // remove leading '/'
    });

    console.log('Connected!');

    const [rows] = await connection.execute('SELECT * FROM venture_capital_firms');

    rows.forEach(row => {
      console.log(row);
    });

    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
};

run();
