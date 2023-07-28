import "better-node-inspect"

import { extractTeamMemberInformation } from "./src/lc/team.js"
import { convertToMarkdown } from "./src/markdown.js"

// https://github.com/iloveitaly/langchainjs/blob/49572fdc205316dec267d833d39b777d674bf980/langchain/src/document_loaders/web/playwright.ts#L40-L44
async function visitUrl(url: string) {
  const { chromium } = await import("playwright")

  const browser = await chromium.launch({
    headless: true,
  })

  const page = await browser.newPage()

  await page.goto(url, {
    timeout: 180000,
    waitUntil: "domcontentloaded",
  })

  return [page, browser]
}

// TODO I can't disable strict mode...
// https://github.com/Microsoft/TypeScript/issues/28306
// function storeVars(target) {
//   return new Proxy(target, {
//     has(target, prop) { return true; },
//     get(target, prop) { return (prop in target ? target : window)[prop]; }
//   });
// }
// var vars = {}; // Outer variable, not stored.
// with(storeVars(vars)) {
//   const [page,browser] = await visitUrl("https://www.daphni.com/team/marc-simoncini/")
//   const converted = await convertToMarkdown(await page.content())
// }
// console.log(vars);

// const [page, browser] = await visitUrl(
//   "https://www.daphni.com/team/marc-simoncini/"
// )
// const converted = await convertToMarkdown(await page.content())

// const contents = (await import("fs")).readFileSync("./example.html", "utf8")
// const converted = await convertToMarkdown(contents)
// process.stdout.write(String(converted))

// TODO I don't think this is possible, I want to list out all vars and pass them to the repl
// console.log(Object.keys(this))
// console.log("---")
// console.log(Object.keys(global))
// console.log(Object.keys(globalThis))

// list all local variables

// const result = await extractTeamMemberInformation(
//   "https://www.daphni.com/team/marc-simoncini/"
// )

repl({ visitUrl, convertToMarkdown })
