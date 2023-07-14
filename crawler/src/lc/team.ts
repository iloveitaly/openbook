import invariant from "tiny-invariant"
import { z } from "zod"

import { calculateMaxTokens } from "langchain/base_language"
import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright"
import { OpenAI } from "langchain/llms/openai"
import { StructuredOutputParser } from "langchain/output_parsers"
import { PromptTemplate } from "langchain/prompts"

import type { TiktokenModel } from "langchain/base_language"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
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

  const modelName: TiktokenModel = "gpt-3.5-turbo-16k"

  // TODO should be centralized?
  const model = new OpenAI({
    temperature: 0,
    // TODO should be able to use
    verbose: true,
    maxTokens: -1,
    modelName: modelName,
    openAIApiKey: openAIAPIKey,
  })

  const renderedEmptyPrompt = await prompt.format({
    pageContents: [],
  })

  const modelTokenLimit = await calculateMaxTokens({
    // TODO this is not exactly right, it includes the variables + format instructions as a variable
    prompt: renderedEmptyPrompt,
    modelName: modelName,
  })

  const tokenToCharacterBuffer = 100 * 4
  const chunkOverlap = 1000
  const maxDocumentCharacters =
    (modelTokenLimit - tokenToCharacterBuffer) * 4 - chunkOverlap

  const pageContentsAsMarkdown = await extractUrlContents(url)

  // TODO langchainjs does not split on tokens unless you use a token-based splitter, which is not aware of markdown
  //      best alternative is to estimate the character size add in some buffer, and hope for the best

  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: maxDocumentCharacters,
    chunkOverlap: chunkOverlap,
  })
  debugger

  const markdownDocuments = await splitter.createDocuments([
    pageContentsAsMarkdown.value,
  ])

  const responses = []

  for (const document of markdownDocuments) {
    debugger

    const renderedPrompt = await prompt.format({
      pageContents: document,
    })

    const responseWithCodeblock = await model.call(renderedPrompt)
    const jsonResponse = await parser.parse(responseWithCodeblock)
    responses.push(jsonResponse)
  }

  if (responses.flat().length > 1) {
    debugger
  }

  return responses.flat()
}

export default extractTeamMemberInformation
