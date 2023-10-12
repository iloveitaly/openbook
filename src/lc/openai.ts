import { calculateMaxTokens } from "langchain/base_language"
import { OpenAI } from "langchain/llms/openai"
import invariant from "tiny-invariant"

// dynamically select which model name based on content
export async function gpt3Model({
  content,
  modelName,
}: {
  content?: string
  modelName?: string
}) {
  const openAIAPIKey = process.env.OPENAI_API_KEY
  invariant(openAIAPIKey, "OPENAI_API_KEY is not set")

  const logLevel = (process.env.LOG_LEVEL || "info").toUpperCase()

  const gpt3Small = "gpt-3.5-turbo"
  const gpt3Large = "gpt-3.5-turbo-16k"
  let selectedModelName = gpt3Small

  if (content && !modelName) {
    const modelTokenLimit = await calculateMaxTokens({
      prompt: content,
      // TODO TiktokModelName
      modelName: gpt3Small,
    })

    if (modelTokenLimit < 0) {
      selectedModelName = gpt3Large
    }
  }

  if (modelName) {
    selectedModelName = modelName
  }

  const model = new OpenAI({
    temperature: 0,
    verbose: logLevel === "DEBUG",
    maxTokens: -1,
    modelName: selectedModelName,
    openAIApiKey: openAIAPIKey,
  })

  return model
}
