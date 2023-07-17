// loop through database named `venture_capital_firms` and connect via a mySQL database connection
import extractTeamMemberInformation from "~/lc/team"
import { log } from "~/logging"
import { getClient } from "~/mysql"

import { RowDataPacket } from "mysql2/promise"

let connection: Awaited<ReturnType<typeof getClient>>

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

  await connection.query(
    "UPDATE venture_capital_firms SET team_members = ? WHERE url = ?",
    [JSON.stringify(teamMemberInformation), row.url]
  )
}

export const run = async () => {
  connection = await getClient()

  const sqlQuery =
    " SELECT * FROM venture_capital_firms WHERE url = 'earlybird.com'"
  // const sqlQuery =
  //   "SELECT * FROM venture_capital_firms WHERE scrape_categorization IS NOT NULL AND team_members IS NULL ORDER BY RAND() LIMIT 1"
  const [rows] = await connection.execute<RowDataPacket[]>(sqlQuery)

  for (const row of rows) {
    await processCategorizedRow(row)
  }

  await connection.end()
}

export default run
