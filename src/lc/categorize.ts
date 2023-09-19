import { z } from "zod"

import { StructuredOutputParser } from "langchain/output_parsers"
import { PromptTemplate } from "langchain/prompts"
import { gpt3Model } from "~/lc/openai"

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    nonEnglish: z
      .boolean()
      .describe(
        "Are the titles of most of the pages in a non-English language?",
      ),
    companyPages: z
      .array(z.string())
      .describe(
        "URL which describes what the company does and what type of companies they invest in. Limit to two URLs.",
      ),
    teamPages: z
      .array(z.string())
      .describe(
        "URL which describes a individual team member or list of team members.",
      ),
    legalPages: z
      .array(z.string())
      .describe(
        "URL for the terms of service, privacy policy, or other legal documents. Limit to two URLs.",
      ),
  }),
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

export async function categorize(urls: PageRepresentation[]) {
  const input = await prompt.format({
    urls: JSON.stringify(urls),
  })

  const model = await gpt3Model({ content: input })

  const response = await model.call(input)
  const jsonResponse = await parser.parse(response)

  return jsonResponse
}
