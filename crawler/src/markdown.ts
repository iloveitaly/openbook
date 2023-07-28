import { gfmTableToMarkdown } from "mdast-util-gfm-table"
import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import rehypeRemoveComments from "rehype-remove-comments"
import rehypeRemoveImages from "rehype-remove-images"
import rehypeStringify from "rehype-stringify"
import remarkStringify from "remark-stringify"
import { unified } from "unified"
import { log } from "~/logging.js"

export async function convertToMarkdown(htmlString: string) {
  log.debug(`converting html to markdown`)

  // NOTE these pipelines are executed top down, although process is at the bottom of the chain
  // TODO pretty sure both of these pipelines can be combined, but I'm lazy

  const transformedHtmlString = await unified()
    .use(rehypeParse)
    .use(rehypeRemoveImages)
    .use(rehypeRemoveComments, { removeConditional: true })
    .use(rehypeStringify)
    .process(htmlString)

  const markdownString = await unified()
    // however, `table` HTML elements are parsed
    .use(rehypeParse)
    .use(rehypeRemark)
    // NOTE without this, `table` elements are not converted to markdown and throw an error
    // https://github.com/enkidevs/remark-stringify/issues/27
    .data("toMarkdownExtensions", [gfmTableToMarkdown()])
    .use(remarkStringify)
    .process(transformedHtmlString)

  return markdownString
}

export default convertToMarkdown
