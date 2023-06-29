# Crawlee + PlaywrightCrawler + TypeScript project

This template is a production ready boilerplate for developing with `PlaywrightCrawler`. Use this to bootstrap your projects using the most up-to-date code.

If you're looking for examples or want to learn more visit:

- [Documentation](https://crawlee.dev/api/playwright-crawler/class/PlaywrightCrawler)
- [Examples](https://crawlee.dev/docs/examples/playwright-crawler)

## Prompt

I am looking for the following information from a webpage:

- Description of what the company does
- Team member name, email, LinkedIn profile URL, job title, location, and other relevant information

Which of the following webpages could contain this information:


```

```

Include the full list. Use two code blocks, one for "what the company does" and one for team members. Include the URL on a new line within the codeblock

### Person Extraction Prompt


I am looking for data structured like this JSON schema:

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Generated schema for Root",
  "type": "object",
  "properties": {
    "userId": {
      "type": "number"
    },
    "id": {
      "type": "number"
    },
    "title": {
      "type": "string"
    },
    "completed": {
      "type": "boolean"
    }
  },
  "required": [
    "userId",
    "id",
    "title",
    "completed"
  ]
}

Here is an example JSON blob that I am looking for:

{
  "email": "iloveitaly@gmail.com",
  "name": "John Doe",
  "linkedin": "https://www.linkedin.com/in/john-doe-123456789/",
  "title": "Software Engineer",
  "location": "San Francisco, CA",
  "twitter": "https://twitter.com/johndoe",
  "specialization": "Works in software engineering specializing in NetSuite"
}

Extract the previously described JSON blog from this page:

https://www.indexventures.com/team/avron-marcus/

## Scrap log

INFO  PlaywrightCrawler: Crawl finished. Final request statistics: {"requestsFinished":67,"requestsFailed":0,"retryHistogram":[67],"requestAvgFailedDurationMillis":null,"requestAvgFinishedDurationMillis":14575,"requestsFinishedPerMinute":30,"requestsFailedPerMinute":0,"requestTotalDurationMillis":976527,"requestsTotal":67,"crawlerRuntimeMillis":133208}

## Team Scraping

* https://www.indexventures.com/team/ includes all team members on the page