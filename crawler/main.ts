import { Command } from "commander"

import scrapeCompanies from "~/commands/scrape-companies"
import scrapeTeam from "~/commands/scrape-team"

const program = new Command()

program
  .command("scrape-companies")
  .description("scrape company sites and categorize pages")
  .action(scrapeCompanies)

program
  .command("scrape-team")
  .description("scrape team command")
  .action(scrapeTeam)

program
  .command("denormalize-team")
  .description("denormalize team command")
  .action(() => {
    console.log("Running denormalize team command")
  })

program.parse(process.argv)
