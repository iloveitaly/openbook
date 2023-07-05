import invariant from "tiny-invariant"
import { z } from "zod"

import { OpenAI } from "langchain/llms/openai"
import { StructuredOutputParser } from "langchain/output_parsers"
import { PromptTemplate } from "langchain/prompts"

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    nonEnglish: z
      .boolean()
      .describe(
        "Are the titles of most of hte pages in a non-English language?"
      ),
    companyPages: z
      .array(z.string())
      .describe(
        "URL which describes what the company does and what type of companies they invest in. Limit to two URLs."
      ),
    teamPages: z
      .array(z.string())
      .describe(
        "URL which describes a individual team member or list of team members."
      ),
  })
)

const formatInstructions = parser.getFormatInstructions()

const prompt = new PromptTemplate({
  template:
    "Which of the following webpages, could contain this information:\n```json\n{urls}\n```\n\n{format_instructions}",
  inputVariables: ["urls"],
  partialVariables: { format_instructions: formatInstructions },
})

interface PageRepresentation {
  url: string
  title: string
}

export const categorize = async (urls: PageRepresentation[]) => {
  const openAIAPIKey = process.env.OPENAI_API_KEY
  invariant(openAIAPIKey, "OPENAI_API_KEY is not set")

  const model = new OpenAI({
    temperature: 0,
    // TODO should be able to use
    verbose: true,
    maxTokens: -1,
    modelName: "gpt-3.5-turbo",
    openAIApiKey: openAIAPIKey,
  })

  const input = await prompt.format({
    urls: JSON.stringify(urls),
  })

  const response = await model.call(input)
  const jsonResponse = await parser.parse(response)

  return jsonResponse
}

export default categorize
