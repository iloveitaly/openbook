// for improved repl experience
import "better-node-inspect"

import { Command } from "commander"
import scrapeCompanies from "~/commands/scrape-companies"
import scrapeTeam from "~/commands/scrape-team"

const program = new Command()

// Define common options.
const commonOptions = [
  ["-l, --limit <number>", "limit number of pages/sites to scrape"],
  ["-u, --url <string>", "url to scrape"],
]

// Add common options to a command.
const addCommonOptions = (command: Command) => {
  for (const [flags, description] of commonOptions) {
    command.option(flags, description)
  }
}

const commandScrapeCompanies = program
  .command("scrape-companies")
  .description("scrape company sites and categorize pages")
  .action((options) => {
    scrapeCompanies({ limit: options.limit, url: options.url })
  })

const commandScrapeTeam = program
  .command("scrape-team")
  .description("scrape team command")
  .action((options) => {
    scrapeTeam({ limit: options.limit, url: options.url })
  })

addCommonOptions(commandScrapeCompanies)
addCommonOptions(commandScrapeTeam)

program
  .command("denormalize-team")
  .description("denormalize team command")
  .action(() => {
    console.log("Running denormalize team command")
  })

program.parse(process.argv)
