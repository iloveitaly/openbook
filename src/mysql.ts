import invariant from "tiny-invariant"

import mysql from "mysql2/promise"

let connection: mysql.Connection
const mysqlUrl = process.env.MYSQL_DATABASE_URL ?? null
invariant(mysqlUrl, "MYSQL_DATABASE_URL is not defined")

export async function getClient() {
  if (connection) {
    return connection
  }

  // mysql2 can take the FQDN, nice!
  connection = await mysql.createConnection(mysqlUrl ?? "")
  console.log("Connected to mysql!")
  return connection
}
