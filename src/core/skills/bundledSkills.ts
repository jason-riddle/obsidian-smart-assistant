import type { Skill } from './types'

const summarizeBody = `## Summarize

Provide a concise summary of the provided content.

1. Identify the main topic
2. Extract key points (max 5)
3. Write a 2-3 sentence summary
4. List key points as bullets
`

const extractTodosBody = `## Extract Todos

Extract actionable todo items from the provided content.

1. Scan the content for tasks, action items, and follow-ups
2. List each as a checkbox item: \`- [ ] task description\`
3. Group by source section or heading when possible
4. Omit items that are informational rather than actionable
`

export const BUNDLED_SKILLS: Skill[] = [
  {
    name: 'summarize',
    description:
      'Summarize the selected text or current note into a concise summary. Use when the user asks to summarize, condense, or get the key points of content.',
    frontmatter: {
      name: 'summarize',
      description:
        'Summarize the selected text or current note into a concise summary. Use when the user asks to summarize, condense, or get the key points of content.',
    },
    body: summarizeBody,
    source: 'bundled',
    path: 'skills/summarize/SKILL.md',
    dir: 'skills/summarize',
  },
  {
    name: 'extract-todos',
    description:
      'Extract actionable todo items from text or notes. Use when the user asks to find tasks, action items, or follow-ups in content.',
    frontmatter: {
      name: 'extract-todos',
      description:
        'Extract actionable todo items from text or notes. Use when the user asks to find tasks, action items, or follow-ups in content.',
    },
    body: extractTodosBody,
    source: 'bundled',
    path: 'skills/extract-todos/SKILL.md',
    dir: 'skills/extract-todos',
  },
]
