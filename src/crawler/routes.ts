import { Dataset, createPlaywrightRouter } from "crawlee"

export function createRouter() {
  const router = createPlaywrightRouter()

  router.addDefaultHandler(async ({ enqueueLinks, log }) => {
    log.info(`enqueueing new URLs`)

    await enqueueLinks({
      // globs: ['https://crawlee.dev/**'],
      // limit: 1000,
      label: "detail",
    })
  })

  router.addHandler("detail", async ({ request, page, log }) => {
    const title = await page.title()
    // TODO maybe we should pull the description from the page as well?

    log.info(`${title}`, { url: request.loadedUrl })

    await Dataset.pushData({
      url: request.loadedUrl,
      title,
    })
  })

  return router
}
