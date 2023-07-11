// loop through database named `venture_capital_firms` and connect via a mySQL database connection
import "better-node-inspect"

import extractTeamMemberInformation from "./src/lc/team.js"
import { log } from "./src/logging.js"
import { getClient } from "./src/mysql.js"
import { RowDataPacket } from "mysql2/promise"

async function processCategorizedRow(row: RowDataPacket) {
  const categorization = row.scrape_categorization

  let teamMemberInformation: any = []

  for (const teamMemberUrl of categorization.teamPages) {
    log.info(`scraping ${teamMemberUrl}`)

    teamMemberInformation = [
      ...(await extractTeamMemberInformation(teamMemberUrl)),
      ...teamMemberInformation,
    ]
  }

  log.info("updating team member information")

  await (
    await getClient()
  ).query("UPDATE venture_capital_firms SET team_members = ? WHERE url = ?", [
    JSON.stringify(teamMemberInformation),
    row.url,
  ])
}

const run = async () => {
  const sqlQuery =
    "SELECT * FROM venture_capital_firms WHERE scrape_categorization IS NOT NULL AND team_members IS NULL ORDER BY RAND() LIMIT 1"
  const [rows] = await (await getClient()).execute<RowDataPacket[]>(sqlQuery)

  for (const row of rows) {
    await processCategorizedRow(row)
  }
}

run()
