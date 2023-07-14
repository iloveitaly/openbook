// showdown,
import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import rehypeRemoveComments from "rehype-remove-comments"
import rehypeStringify from "rehype-stringify"
import remarkStringify from "remark-stringify"
import { unified } from "unified"
import { log } from "~/logging.js"
import rehypeRemoveImages from "./rehype-remove-images"

export async function convertToMarkdown(htmlString: string) {
  log.debug(`converting html to markdown`)

  const transformedHtmlString = await unified()
    .use(rehypeParse)
    .use(rehypeRemoveImages)
    .use(rehypeRemoveComments, { removeConditional: true })
    .use(rehypeStringify)
    .process(htmlString)

  const markdownString = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(transformedHtmlString)

  return markdownString
}

export default convertToMarkdown
