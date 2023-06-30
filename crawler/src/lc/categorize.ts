import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import invariant from "tiny-invariant";
import { z } from "zod";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    companyPages: z.array(z.string()).describe("URL which describes what the company does and what type of companies they invest in"),
    sources: z
      .array(z.string())
      .describe("Team member name, email, LinkedIn profile URL, job title, location, and other relevant information."),
  })
);

const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
  template: "Which of the following webpages, could contain this information:\n```json\n{urls}\n```\n\n{format_instructions}",
  inputVariables: ["urls"],
  partialVariables: { format_instructions: formatInstructions },
});

interface PageRepresentation {
  url: string;
  title: string;
}

export const categorize = async (urls: PageRepresentation[]) => {
  const openAIAPIKey = process.env.OPENAI_API_KEY;
  invariant(openAIAPIKey, "OPENAI_API_KEY is not set")

  const model = new OpenAI({
    temperature: 0,
    verbose: true,
    modelName: "gpt-3.5-turbo",
    openAIApiKey: openAIAPIKey
  });
  const input = await prompt.format({
    urls: JSON.stringify(urls),
  });

  const response = await model.call(input);
  const jsonResponse = await parser.parse(response)

  return response
}

export default categorize;

// console.log(input);
// /*
// Answer the users question as best as possible.
// You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

// "JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

// For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
// would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
// Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

// Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

// Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:
// ```json
// {"type":"object","properties":{"answer":{"type":"string","description":"answer to the user's question"},"source":{"type":"string","description":"source used to answer the user's question, should be a website."}},"required":["answer","source"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}
// ```

// What is the capital of France?
// */

// console.log(response);
// /*
// {"answer": "Paris", "source": "https://en.wikipedia.org/wiki/Paris"}
// */

// console.log(await parser.parse(response));
// // { answer: 'Paris', source: 'https://en.wikipedia.org/wiki/Paris' }