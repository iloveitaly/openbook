// loop through database named `venture_capital_firms` and connect via a mySQL database connection

import mysql, { RowDataPacket } from "mysql2/promise"
// import url from 'url'
import invariant from 'tiny-invariant'

const mysqlUrl = process.env.MYSQL_DATABASE_URL ?? null
invariant(mysqlUrl, 'MYSQL_DATABASE_URL is not defined');

const dbUrl = new URL(mysqlUrl);
// const username = dbUrl.username;
// const password = dbUrl.password;
const username = 'root';
const password = '';

const run = async () => {
  // const connection = await mysql.createConnection({
  //   host: dbUrl.hostname,
  //   port: dbUrl.port,
  //   user: username,
  //   password: password,
  //   database: dbUrl.pathname.substr(1), // remove leading '/'
  // });
  const connection = await mysql.createConnection(mysqlUrl)

  console.log('Connected!');

  // const sqlQuery = "SELECT * FROM venture_capital_firms"
  const sqlQuery = "SELECT * FROM venture_capital_firms LIMIT 1"
  const [rows] = await connection.execute<RowDataPacket[]>(sqlQuery);

  rows.forEach(row => {
    console.log(row);
  });

  await connection.end();
};

run();
