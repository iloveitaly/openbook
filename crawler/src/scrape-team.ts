// loop through database named `venture_capital_firms` and connect via a mySQL database connection
import invariant from "tiny-invariant"

import mysql, { RowDataPacket } from "mysql2/promise"

const mysqlUrl = process.env.MYSQL_DATABASE_URL ?? null
invariant(mysqlUrl, "MYSQL_DATABASE_URL is not defined")

const run = async () => {
  // mysql2 can take the FQDN
  const connection = await mysql.createConnection(mysqlUrl)

  console.log("Connected!")

  // const sqlQuery = "SELECT * FROM venture_capital_firms"
  const sqlQuery = "SELECT * FROM venture_capital_firms LIMIT 1"
  const [rows] = await connection.execute<RowDataPacket[]>(sqlQuery)

  rows.forEach((row) => {
    console.log(row)
  })

  await connection.end()
}

run()
