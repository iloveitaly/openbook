/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 *
 * @typedef {Record<string, string>} Sources
 * @typedef {Record<string, Sources>} Options
 */
import path from "node:path"
import { remove } from "unist-util-remove"
import { visit } from "unist-util-visit"

import { isElement } from "hast-util-is-element"

/**
 * @type {import('unified').Plugin<[Options?] | Array<void>, Root>}
 */
export default function rehypeRemoveImages() {
  console.log("filter!")

  return (tree) =>
    remove(tree, { cascade: true }, (node) => {
      console.log(`the thing ${node.type} - ${isElement(node, "img")}`)
      // note that `type` is not the same as `tagName`!
      return isElement(node, "img")
      return node.type == "img"
    }) || undefined

  // return (tree) =>
  //   filter(tree, { cascade: true }, (node) => {
  //     console.log(`the thing ${node.type}`)
  //     return node.type == "img"
  //   }) ||
  //   // filter(tree, { cascade: false }, (node) => isElement(node, "img")) ||
  //   undefined

  return (tree) => {
    return visit(tree, "element", (node) => {
      // debugger
      // console.log("START")
      // console.dir(node, { depth: null, colors: true, maxArrayLength: null })
      // console.log("END")
      console.log(`the thing ${node.type}`)
      if (isElement(node, "img")) {
        node.children = []
      }
    })
  }

  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (
        !parent ||
        typeof index !== "number" ||
        !isElement(node, "img") ||
        !node.properties ||
        !node.properties.src
      ) {
        return
      }

      const src = String(node.properties.src)
      const extension = path.extname(src).slice(1)

      if (!own.call(settings, extension)) {
        return
      }

      /** @type {Element['children']} */
      const nodes = []
      const map = settings[extension]
      /** @type {string} */
      let key

      for (key in map) {
        if (own.call(map, key)) {
          nodes.push({
            type: "element",
            tagName: "source",
            properties: { srcSet: replaceExt(src, "." + key), type: map[key] },
            children: [],
          })
        }
      }

      /** @type {Element} */
      const replacement = {
        type: "element",
        tagName: "picture",
        properties: {},
        children: nodes.concat(node),
      }

      parent.children[index] = replacement
    })
  }
}
