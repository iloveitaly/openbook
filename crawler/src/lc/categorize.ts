import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import invariant from "tiny-invariant";
import { z } from "zod";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    companyPages: z
      .array(z.string())
      .describe(
        "URL which describes what the company does and what type of companies they invest in"
      ),
    sources: z
      .array(z.string())
      .describe(
        "Team member name, email, LinkedIn profile URL, job title, location, and other relevant information."
      ),
  })
);

const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
  template:
    "Which of the following webpages, could contain this information:\n```json\n{urls}\n```\n\n{format_instructions}",
  inputVariables: ["urls"],
  partialVariables: { format_instructions: formatInstructions },
});

interface PageRepresentation {
  url: string;
  title: string;
}

export const categorize = async (urls: PageRepresentation[]) => {
  const openAIAPIKey = process.env.OPENAI_API_KEY;
  invariant(openAIAPIKey, "OPENAI_API_KEY is not set");

  const model = new OpenAI({
    temperature: 0,
    // TODO should be able to use
    verbose: true,
    maxTokens: -1,
    modelName: "gpt-3.5-turbo",
    openAIApiKey: openAIAPIKey,
  });
  const input = await prompt.format({
    urls: JSON.stringify(urls),
  });

  const response = await model.call(input);
  const jsonResponse = await parser.parse(response);

  return response;
};

export default categorize;
