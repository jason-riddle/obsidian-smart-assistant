import type { RequestTool } from '../../types/llm/request'

import type { Skill } from './types'

export const READ_SKILL_TOOL_NAME = 'read_skill'

export const READ_SKILL_TOOL_DESCRIPTION =
  'Read the full instructions for a skill by name. Use this when you need the detailed instructions for a skill listed in the Available Skills section.'

export function getReadSkillTool(): RequestTool {
  return {
    type: 'function',
    function: {
      name: READ_SKILL_TOOL_NAME,
      description: READ_SKILL_TOOL_DESCRIPTION,
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The skill name to read',
          },
        },
        required: ['name'],
      },
    },
  }
}

export function findSkill(skills: Skill[], name: string): Skill | undefined {
  return skills.find((skill) => skill.name === name)
}
