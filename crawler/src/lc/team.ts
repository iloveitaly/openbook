import invariant from "tiny-invariant"
import { z } from "zod"

import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright"
import { OpenAI } from "langchain/llms/openai"
import { StructuredOutputParser } from "langchain/output_parsers"
import { PromptTemplate } from "langchain/prompts"

import { log } from "../logging.js"
import { convertToMarkdown } from "../markdown.js"

const parser = StructuredOutputParser.fromZodSchema(
  z.array(
    z.object({
      name: z.string().describe("Full name of the team member"),
      role: z.string().describe("Official role or title of the team member"),
      roleDescription: z
        .string()
        .describe("Summary of what this member does in less than 350 words"),
      email: z.string().describe("Email of the team member"),
      twitter: z.string().describe("Twitter handle of the team member"),
      linkedin: z.string().describe("LinkedIn handle of the team member"),
    })
  )
)

const formatInstructions = parser.getFormatInstructions()

const prompt = new PromptTemplate({
  template:
    "This page contains information on one or more team members:\n```json\n{pageContents}\n```\n\n{format_instructions}",
  inputVariables: ["pageContents"],
  partialVariables: { format_instructions: formatInstructions },
})

async function extractUrlContents(url: string) {
  log.debug("extracting contents from url", { url })

  // const loader = new PlaywrightWebBaseLoader(url, {
  //   launchOptions: {
  //     headless: true,
  //   },

  //   gotoOptions: {
  //     waitUntil: "domcontentloaded",
  //   },

  //   async evaluate(page: Page, browser: Browser) {
  //     return page.evaluate(() => {
  //       debugger
  //       return document.body.innerText
  //     })
  //   },
  // })
  const loader = new PlaywrightWebBaseLoader(url)
  const docs = await loader.load()

  // Extracted contents from the HTML page
  const extractedContents = docs[0].pageContent
  const markdownContents = await convertToMarkdown(extractedContents)
  return markdownContents
}

export async function extractTeamMemberInformation(url: string) {
  const openAIAPIKey = process.env.OPENAI_API_KEY
  invariant(openAIAPIKey, "OPENAI_API_KEY is not set")

  // TODO should be centralized?
  const model = new OpenAI({
    temperature: 0,
    // TODO should be able to use
    verbose: true,
    maxTokens: -1,
    modelName: "gpt-3.5-turbo",
    openAIApiKey: openAIAPIKey,
  })

  const input = await prompt.format({
    pageContents: await extractUrlContents(url),
  })

  const response = await model.call(input)
  const jsonResponse = await parser.parse(response)

  return jsonResponse
}

export default extractTeamMemberInformation
