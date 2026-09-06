import type { Skill } from './types'

export function filterEnabledSkills(
  skills: Skill[],
  disabledSkills: string[],
): Skill[] {
  return skills.filter((skill) => !disabledSkills.includes(skill.name))
}
