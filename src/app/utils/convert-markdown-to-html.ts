import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

export async function convertMarkdownToHtml(text: string | undefined): Promise<string> {
  if (!text) {
    return ''
  }

  const processor = unified()
    .use(remarkParse) // Parse markdown content to a syntax tree
    .use(remarkRehype) // Turn markdown syntax tree to HTML syntax tree, ignoring embedded HTML
    .use(rehypeStringify)

  const root = await processor.process(text)

  return String(root).replaceAll('&#x26;#x200B;', ' ')
}
