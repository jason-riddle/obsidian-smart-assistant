import { filterEnabledSkills } from './skillFilter'
import type { Skill } from './types'

function makeSkill(name: string): Skill {
  return {
    name,
    description: `Skill ${name}`,
    frontmatter: {
      name,
      description: `Skill ${name}`,
    },
    body: `Body of ${name}`,
    source: 'bundled',
    path: `.agents/skills/${name}/SKILL.md`,
    dir: name,
  }
}

describe('filterEnabledSkills', () => {
  it('should filter out a skill that is in disabledSkills', () => {
    const skills = [makeSkill('skill-a'), makeSkill('skill-b')]
    const disabledSkills = ['skill-a']
    const result = filterEnabledSkills(skills, disabledSkills)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('skill-b')
  })

  it('should keep a skill that is not in disabledSkills', () => {
    const skills = [makeSkill('skill-a'), makeSkill('skill-b')]
    const disabledSkills = ['skill-c']
    const result = filterEnabledSkills(skills, disabledSkills)
    expect(result).toHaveLength(2)
    expect(result.map((s) => s.name)).toEqual(['skill-a', 'skill-b'])
  })

  it('should keep all skills when disabledSkills is empty', () => {
    const skills = [makeSkill('skill-a'), makeSkill('skill-b')]
    const disabledSkills: string[] = []
    const result = filterEnabledSkills(skills, disabledSkills)
    expect(result).toHaveLength(2)
    expect(result.map((s) => s.name)).toEqual(['skill-a', 'skill-b'])
  })

  it('should return empty when all skills are disabled', () => {
    const skills = [makeSkill('skill-a'), makeSkill('skill-b')]
    const disabledSkills = ['skill-a', 'skill-b']
    const result = filterEnabledSkills(skills, disabledSkills)
    expect(result).toEqual([])
  })

  it('should return empty when skills array is empty', () => {
    const skills: Skill[] = []
    const disabledSkills = ['skill-a']
    const result = filterEnabledSkills(skills, disabledSkills)
    expect(result).toEqual([])
  })

  it('should handle disabledSkills with names not matching any skill', () => {
    const skills = [makeSkill('skill-a')]
    const disabledSkills = ['nonexistent', 'also-nonexistent']
    const result = filterEnabledSkills(skills, disabledSkills)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('skill-a')
  })

  it('should not mutate the input skills array', () => {
    const skills = [makeSkill('skill-a'), makeSkill('skill-b')]
    const disabledSkills = ['skill-a']
    filterEnabledSkills(skills, disabledSkills)
    expect(skills).toHaveLength(2)
    expect(skills.map((s) => s.name)).toEqual(['skill-a', 'skill-b'])
  })
})
