import invariant from "tiny-invariant"
import { z } from "zod"

import { calculateMaxTokens } from "langchain/base_language"
import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright"
import { OpenAI } from "langchain/llms/openai"
import {
  OutputFixingParser,
  StructuredOutputParser,
} from "langchain/output_parsers"
import { PromptTemplate } from "langchain/prompts"

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
        .describe("Summary of what this member does in less than 50 words"),
      email: z.string().describe("Email of the team member"),
      twitter: z.string().describe("Twitter url of the team member"),
      linkedin: z.string().describe("LinkedIn url of the team member"),
    }),
  ),
)

// NOTE this is the schema used for the `team_members` array
// extract the type of the element of the parser zod array
export type ScrapedPerson = z.infer<(typeof parser)["schema"]>[0]

const formatInstructions = parser.getFormatInstructions()

const prompt = new PromptTemplate({
  // this prompt is really important! Without explicit instructions it will return garbage stuff
  template:
    "This webpage, formatted as markdown, could contain information on one or more team members. If you cannot find any team members, respond with an empty array; do not make up fake people.\n```markdown\n{pageContents}\n```\n\n{format_instructions}",
  inputVariables: ["pageContents"],
  partialVariables: { format_instructions: formatInstructions },
})

async function extractUrlContents(url: string) {
  log.debug("extracting contents from url", { url })

  const loader = new PlaywrightWebBaseLoader(url)
  const docs = await loader.load()

  // Extracted contents from the HTML page
  const extractedContents = docs[0].pageContent
  const markdownContents = await convertToMarkdown(extractedContents)
  debugger
  return markdownContents
}

// type Id<T> = T extends object ? {} & { [P in keyof T]: Id<T[P]> } : T
// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T

export async function extractTeamMemberInformationFromUrl(url: string) {
  const pageContentsAsMarkdown = String((await extractUrlContents(url)).value)
  return await extractTeamMemberInformation(pageContentsAsMarkdown)
}

export async function extractTeamMemberInformation(
  pageContentsAsMarkdown: string,
) {
  // TODO refactor once the typing change is in place
  const openAIAPIKey = process.env.OPENAI_API_KEY
  invariant(openAIAPIKey, "OPENAI_API_KEY is not set")

  // TODO should be centralized?
  const model = new OpenAI({
    temperature: 0,
    // TODO should be able to use
    verbose: true,
    maxTokens: -1,
    modelName: "gpt-3.5-turbo-16k",
    openAIApiKey: openAIAPIKey,
  })

  type ExpandedParams = ExpandRecursively<
    ConstructorParameters<typeof OpenAI>[0]
  >

  const renderedEmptyPrompt = await prompt.format({
    pageContents: [],
  })

  // TODO we really just want the total tokens consumed by the empty prompt based on the model-specific calculation
  //      this would enable us to drop to a model variant with a lower token window if we needed to
  const modelTokenLimit = await calculateMaxTokens({
    // TODO this is not exactly right, it includes the variables + format instructions as a variable
    prompt: renderedEmptyPrompt,
    modelName: model.modelName,
  })

  const charactersPerToken = 4
  const tokenToCharacterBuffer = 100 * charactersPerToken
  const chunkOverlap = 1000
  const maxDocumentCharacters =
    (modelTokenLimit - tokenToCharacterBuffer) * charactersPerToken -
    chunkOverlap

  // TODO langchainjs does not split on tokens unless you use a token-based splitter, which is not aware of markdown
  //      best alternative is to estimate the character size add in some buffer, and hope for the best

  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: maxDocumentCharacters,
    chunkOverlap: chunkOverlap,
  })

  const markdownDocuments = await splitter.createDocuments([
    pageContentsAsMarkdown,
  ])

  const responses = []

  for (const document of markdownDocuments) {
    const renderedPrompt = await prompt.format({
      // TODO without the `pageContent` reference `[Object object]` will be passed to openai and there's not an easy way to know about it
      pageContents: document.pageContent,
    })

    const responseWithCodeblock = await model.call(renderedPrompt)
    let jsonResponse: Awaited<ReturnType<typeof parser.parse>>

    debugger
    try {
      jsonResponse = await parser.parse(responseWithCodeblock)
    } catch (e) {
      jsonResponse = await fixTruncatedJson(model, responseWithCodeblock)
    }

    debugger

    responses.push(jsonResponse)
  }

  return responses.flat()
}

async function fixTruncatedJson(model: OpenAI, invalidJsonString: string) {
  log.debug("output parser failed, attempting to fix")

  // if the number of responses exceeds the token window, then we need to ask the LLM to fix the output
  const fixParser = OutputFixingParser.fromLLM(model, parser)
  const jsonResponse = await fixParser.parse(invalidJsonString)
  return jsonResponse
}
