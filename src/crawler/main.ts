// For more information, see https://crawlee.dev/
import {
  Configuration,
  Dataset,
  LogLevel,
  PlaywrightCrawler,
  purgeDefaultStorages,
} from "crawlee"

import { createRouter } from "./routes.js"

export default async function crawl(initialUrl: string) {
  console.log(`crawling ${initialUrl}`)

  const startUrls = [initialUrl]

  // const config = new Configuration({ persistStorage: false })
  const config = new Configuration({
    logLevel: LogLevel.DEBUG,
    persistStorage: false,
    storageClientOptions: {
      persistStorage: false,
    },
  })

  Configuration.getGlobalConfig().set("persistStorage", false)
  Configuration.getGlobalConfig().set("storageClientOptions", {
    ...Configuration.getGlobalConfig().get("storageClientOptions"),
    persistStorage: false,
  })

  const crawler = new PlaywrightCrawler(
    {
      // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
      requestHandler: createRouter(),
    },
    config
  )

  await crawler.addRequests(startUrls)
  await crawler.run()

  const data = await Dataset.getData()
  const urls = data.items

  ;(await Dataset.open()).drop()
  await purgeDefaultStorages()

  // await crawler.requestQueue.drop()
  await crawler.teardown()

  return data.items
}
