# OpenBook: A Public VC Database

[I'm starting a new company](http://mikebian.co/bye-stripe-on-to-the-next-adventure/), but we haven't picked an idea yet. I thought it would be helpful to have a database of investors with _what they are interested in_ so we can easily reach out to folks within those firms to get feedback on our ideas. VCs have been really helpful in offering thoughtful feedback on ideas really early in the process.

Open source databases have always been interesting to me. There's lots of open source code, but not much open source data. For instance, getting a list of US zip codes isn't easy. It's not clear why this is the case; sure, it's hard, but not harder than open source code. Is zip code data, or IP to location data, core to your business? Probably not. Can't be harder than building or maintaining software. If you haven't any thoughts on the mechanics here, I'd love to hear it.

Anyway, the other motivation for this project was playing with a couple of new technologies, and I'm always a sucker for a [good learning project](http://mikebian.co/tag/learning/):

- Dolthub
- Langchain
- LLMs applied to web scraping
- pnpm

I ran into [rehype](https://unifiedjs.com/explore/package/rehype/) as part of this, which is a neat parsing pipeline. Reminds me of [html-pipeline](https://github.com/gjtorikian/html-pipeline).

## Goals

- Completely open source database
- Make it easy for people to contribute to the database
- Database of companies with some helpful metadata about those companies that can be easily queried
- Database of investors within those companies with as much publicly available contact information sourced as possible

## Development

Pull the dolthub database:

```shell
dolt clone iloveitaly/venture_capital_firms .
```

Install node modules

```shell
pnpm install
```

Setup secrets

```shell
cp .env.example .env
direnv allow .
```

Now you should be ready to roll:

```shell
tsx commands.ts --help
```

## Contributing

Scrape a specific company:

```shell
tsx commands.ts scrape-companies --url 'a16z.com'
tsx commands.ts scrape-team --url 'a16z.com'
```

[Create a dolthub PR](https://www.dolthub.com/blog/2022-01-19-making-your-first-pr/).

## Usage

```shell
Usage: commands [options] [command]

Options:
  -h, --help                  display help for command

Commands:
  scrape-companies [options]  scrape company sites and categorize pages
  scrape-team [options]       scrape team command
  help [command]              display help for command
```

## Design Decisions

- Some sites have a query string url on the team page which just determines which person should be displayed first. In this case, there is a lot of extra text that will be processed, but there's not an easy way to determine the function of the query string so we leave it alone.
- `jsonb` columns with arrays of JSON blobs instead of separate tables. I know this is probably a bad idea, but it keeps some aspects of the project easier for now. The plan is to denormalize the team data attached to companies.

## Scraping with GPT

This has some interesting code which uses langchain + openai to return JSON results from a webpage by converting the raw HTML to simplified markdown. It's amazing how well this works; so many interesting opportunities here.

## Existing Lists & SaaS

Here a list of venture capital firms, and some paid services that provide these lists. I think there's a good opportunity to disrupt traditional data brokers using scraping + LLMs, but over the long term some larger provider will just support real-time data web data ingestion and make any LLM-powered scraping DB obsolete.

- https://mercury.com/investor-database
- https://tracxn.com/d/investor-lists/Venture-Capital-Funds-in-United-States
- https://signal.nfx.com/

### Paid

- https://www.crunchbase.com
- https://pitchbook.com/platform-data/investors
- https://www.harmonic.ai

## TODO

- [ ] Web UI for easy searching and access
