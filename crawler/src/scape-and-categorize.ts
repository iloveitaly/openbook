// loop through database named `venture_capital_firms` and connect via a mySQL database connection
import "better-node-inspect"
import { expandUrl } from "follow-redirect-url"
import invariant from "tiny-invariant"

import { addProtocolIfMissing } from "./follow_url_redirect_protocols.js"
import categorize from "./lc/categorize.js"
import crawl from "./main.js"
import mysql, { RowDataPacket } from "mysql2/promise"

let connection: mysql.Connection
const mysqlUrl = process.env.MYSQL_DATABASE_URL ?? null
invariant(mysqlUrl, "MYSQL_DATABASE_URL is not defined")

async function processVCRow(row: RowDataPacket) {
  const url = row.url
  const normalizeUrl = addProtocolIfMissing(url)

  // TODO this does not fail on a 404, `expandUrl` needs to be rewritten
  const [success, expandedUrl] = await expandUrl(normalizeUrl)

  let scrapeCategorization

  if (!success) {
    console.log(`failed to expand ${normalizeUrl}`)

    scrapeCategorization = {
      error: true,
    }
  } else {
    const urlList = await crawl(expandedUrl)

    if (urlList.length <= 1) {
      scrapeCategorization = {
        companyPages: [],
        teamPages: [],
        singleURL: urlList[0].url,
      }
    } else {
      const categorizedUrls = await categorize(urlList as any)
      scrapeCategorization = categorizedUrls
    }
  }

  await connection.query(
    "UPDATE venture_capital_firms SET scrape_categorization = ? WHERE url = ?",
    [JSON.stringify(scrapeCategorization), row.url]
  )
}

const run = async () => {
  // mysql2 can take the FQDN, nice!
  connection = await mysql.createConnection(mysqlUrl)

  console.log("Connected!")

  // const sqlQuery = "SELECT * FROM venture_capital_firms"
  const sqlQuery =
    "SELECT * FROM venture_capital_firms WHERE scrape_categorization IS NULL ORDER BY RAND() LIMIT 1"
  const [rows] = await connection.execute<RowDataPacket[]>(sqlQuery)

  for (const row of rows) {
    await processVCRow(row)
  }

  await connection.end()
}

run()
