// loop through database named `venture_capital_firms` and connect via a mySQL database connection
import { expandUrl } from "follow-redirect-url"

import { addProtocolIfMissing } from "~/follow_url_redirect_protocols"
import categorize from "~/lc/categorize.js"
import crawl from "~/main"
import { getClient } from "~/mysql"

import { RowDataPacket } from "mysql2/promise"
import { log } from "~/logging"

let connection: Awaited<ReturnType<typeof getClient>>

async function processVCRow(row: RowDataPacket) {
  const url = row.url

  // TODO I think this is done by `expandUrl` now
  const urlWithProtocol = addProtocolIfMissing(url)

  // TODO this does not fail on a 404, `expandUrl` needs to be rewritten
  const [success, expandedUrl] = await expandUrl(urlWithProtocol)

  let scrapeCategorization

  if (!success) {
    console.log(`failed to expand ${urlWithProtocol}`)

    scrapeCategorization = {
      error: true,
    }
  } else {
    // save normalized url in the DB
    await connection.query(
      "UPDATE venture_capital_firms SET normalized_url = ? WHERE url = ?",
      [expandedUrl, url]
    )

    const urlList = await crawl(expandedUrl)

    if (urlList.length === 0) {
      scrapeCategorization = {
        companyPages: [],
        teamPages: [],
        singleURL: true,
        urls: [expandedUrl],
      }
    } else if (urlList.length <= 1) {
      scrapeCategorization = {
        companyPages: [],
        teamPages: [],
        singleURL: true,
        urls: [urlList[0], expandedUrl],
      }
    } else {
      log.info("categorizing urls")

      const categorizedUrls = await categorize(urlList as any)
      scrapeCategorization = categorizedUrls
    }
  }

  await connection.query(
    "UPDATE venture_capital_firms SET scrape_categorization_at = NOW(), scrape_categorization = ? WHERE url = ?",
    [JSON.stringify(scrapeCategorization), row.url]
  )
}

export const run = async ({
  url,
  limit,
}: {
  url: string | null
  limit: number | null
}) => {
  connection = await getClient()

  if (limit === null || limit === undefined || limit < 1) {
    limit = 1
  }

  let sqlQuery

  if (url) {
    sqlQuery = `SELECT * FROM venture_capital_firms WHERE url = '${url}'`
  } else {
    sqlQuery = `
    SELECT * FROM venture_capital_firms
    WHERE
    scrape_categorization IS NULL
    ORDER BY RAND()
    LIMIT ${limit}
    `
  }

  const [rows] = await connection.execute<RowDataPacket[]>(sqlQuery)

  for (const row of rows) {
    await processVCRow(row)
  }

  await connection.end()
}

export default run