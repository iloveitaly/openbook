// For more information, see https://crawlee.dev/
import { Dataset, PlaywrightCrawler } from "crawlee"

import { router } from "./routes.js"

export default async function crawl(initialUrl: string) {
  console.log(`crawling ${initialUrl}`)

  const startUrls = [initialUrl]

  const crawler = new PlaywrightCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
  })

  await crawler.addRequests(startUrls)
  await crawler.run()

  const data = await Dataset.getData()
  return data.items
}
