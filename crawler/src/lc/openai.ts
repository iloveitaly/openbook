import { OpenAI } from "langchain/llms/openai"
import invariant from "tiny-invariant"

export function gpt3Model(content: string | null = null) {
  const openAIAPIKey = process.env.OPENAI_API_KEY
  invariant(openAIAPIKey, "OPENAI_API_KEY is not set")

  const logLevel = (process.env.LOG_LEVEL || "info").toUpperCase()

  const gpt3Small = "gpt-3.5-turbo"

  const model = new OpenAI({
    temperature: 0,
    verbose: logLevel === "DEBUG",
    maxTokens: -1,
    modelName: gpt3Small,
    openAIApiKey: openAIAPIKey,
  })

  return model
}
