// loop through database named `venture_capital_firms` and connect via a mySQL database connection
import { log } from "~/logging"
import { getClient } from "~/mysql"

import { RowDataPacket } from "mysql2/promise"
import extractTeamMemberInformationFromUrl, { ScrapedPerson } from "~/lc/team"

let connection: Awaited<ReturnType<typeof getClient>>

function cleanTeamMemberInformation(teamMembers: ScrapedPerson[]) {
  const cleanedTeamMembers: ScrapedPerson[] = []

  for (const teamMember of teamMembers) {
    const teamMemberName = teamMember.name

    const existingTeamMember = cleanedTeamMembers.find(
      (teamMember) => teamMember.name === teamMemberName
    )

    if (!existingTeamMember) {
      cleanedTeamMembers.push(teamMember)
    } else {
      log.log("found duplicate entry", { name: teamMemberName })

      existingTeamMember.linkedin =
        existingTeamMember.linkedin || teamMember.linkedin
      existingTeamMember.twitter =
        existingTeamMember.twitter || teamMember.twitter
      // TODO add additional fields
    }
  }

  return cleanedTeamMembers
}

async function processCategorizedRow(row: RowDataPacket) {
  const categorization = row.scrape_categorization

  let teamMemberInformation: any = []

  for (const teamMemberUrl of categorization.teamPages) {
    log.info("scraping", { url: teamMemberUrl })

    teamMemberInformation = [
      ...(await extractTeamMemberInformationFromUrl(teamMemberUrl)),
      ...teamMemberInformation,
    ]
  }

  const cleanedTeamMemberInformation = cleanTeamMemberInformation(
    teamMemberInformation
  )

  log.info("updating team member information")

  await connection.query(
    "UPDATE venture_capital_firms SET team_members = ?, scrape_team_members_at = NOW() WHERE url = ?",
    [JSON.stringify(cleanedTeamMemberInformation), row.url]
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

  // use a limit default of 1
  if (limit === null || limit < 1) {
    limit = 1
  }

  let sqlQuery

  if (url) {
    sqlQuery = `SELECT * FROM venture_capital_firms WHERE url = '${url}'`
  } else {
    sqlQuery = `
    SELECT * FROM venture_capital_firms
    WHERE
    scrape_categorization IS NOT NULL AND
    team_members IS NULL ORDER BY RAND() LIMIT ${limit}
    `
  }

  const [rows] = await connection.execute<RowDataPacket[]>(sqlQuery)

  for (const row of rows) {
    await processCategorizedRow(row)
  }

  await connection.end()
}

export default run
