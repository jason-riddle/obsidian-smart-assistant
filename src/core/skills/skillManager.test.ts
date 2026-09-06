import { App } from 'obsidian'

import { SkillManager } from './skillManager'

const mockAdapter = {
  exists: jest.fn().mockResolvedValue(false),
  read: jest.fn().mockResolvedValue(''),
  list: jest.fn().mockResolvedValue({ files: [], folders: [] }),
}

const mockVault = {
  adapter: mockAdapter,
  on: jest.fn().mockReturnValue({}),
  offref: jest.fn(),
}

const mockApp = {
  vault: mockVault,
} as unknown as App

describe('SkillManager', () => {
  let skillManager: SkillManager

  beforeEach(() => {
    jest.clearAllMocks()
    mockAdapter.exists.mockResolvedValue(false)
    mockAdapter.list.mockResolvedValue({ files: [], folders: [] })
    skillManager = new SkillManager(mockApp)
  })

  describe('parseSkillFile', () => {
    const validFrontmatter =
      '---\n' +
      'name: "my-skill"\n' +
      'description: "A test skill description"\n' +
      '---\n' +
      '## Instructions\n\nDo the thing.\n'

    test('parses valid frontmatter and body', () => {
      const skill = skillManager.parseSkillFile(
        validFrontmatter,
        '.agents/skills/my-skill/SKILL.md',
        'vault',
      )
      expect(skill.name).toBe('my-skill')
      expect(skill.description).toBe('A test skill description')
      expect(skill.body).toContain('## Instructions')
      expect(skill.source).toBe('vault')
      expect(skill.dir).toBe('my-skill')
    })

    test('skill name matches directory name', () => {
      const skill = skillManager.parseSkillFile(
        validFrontmatter,
        '.agents/skills/my-skill/SKILL.md',
        'vault',
      )
      expect(skill.name).toBe(skill.dir)
    })

    test('parses optional fields (license, compatibility, metadata)', () => {
      const content =
        '---\n' +
        'name: "my-skill"\n' +
        'description: "A test skill"\n' +
        'license: "MIT"\n' +
        'compatibility: ">=1.0.0"\n' +
        'metadata: "key=value"\n' +
        'allowed-tools: "read_skill write_file"\n' +
        '---\n' +
        'Body here.\n'
      const skill = skillManager.parseSkillFile(
        content,
        '.agents/skills/my-skill/SKILL.md',
        'vault',
      )
      expect(skill.frontmatter.license).toBe('MIT')
      expect(skill.frontmatter.compatibility).toBe('>=1.0.0')
    })

    test('throws when skill name does not match directory name', () => {
      expect(() =>
        skillManager.parseSkillFile(
          validFrontmatter,
          '.agents/skills/other-name/SKILL.md',
          'vault',
        ),
      ).toThrow(/does not match directory name/)
    })

    test('throws when required name field is missing', () => {
      const content =
        '---\n' + 'description: "No name here"\n' + '---\n' + 'Body.\n'
      expect(() =>
        skillManager.parseSkillFile(
          content,
          '.agents/skills/my-skill/SKILL.md',
          'vault',
        ),
      ).toThrow()
    })

    test('throws when required description field is missing', () => {
      const content = '---\n' + 'name: "my-skill"\n' + '---\n' + 'Body.\n'
      expect(() =>
        skillManager.parseSkillFile(
          content,
          '.agents/skills/my-skill/SKILL.md',
          'vault',
        ),
      ).toThrow()
    })

    test('throws when name has uppercase characters', () => {
      const content =
        '---\n' +
        'name: "MySkill"\n' +
        'description: "Bad name"\n' +
        '---\n' +
        'Body.\n'
      expect(() =>
        skillManager.parseSkillFile(
          content,
          '.agents/skills/MySkill/SKILL.md',
          'vault',
        ),
      ).toThrow()
    })

    test('throws when name has spaces', () => {
      const content =
        '---\n' +
        'name: "my skill"\n' +
        'description: "Bad name"\n' +
        '---\n' +
        'Body.\n'
      expect(() =>
        skillManager.parseSkillFile(
          content,
          '.agents/skills/my skill/SKILL.md',
          'vault',
        ),
      ).toThrow()
    })

    test('throws when description exceeds 1024 chars', () => {
      const longDescription = 'A'.repeat(1025)
      const content =
        '---\n' +
        'name: "my-skill"\n' +
        `description: "${longDescription}"\n` +
        '---\n' +
        'Body.\n'
      expect(() =>
        skillManager.parseSkillFile(
          content,
          '.agents/skills/my-skill/SKILL.md',
          'vault',
        ),
      ).toThrow()
    })
  })

  describe('loadSkills', () => {
    test('returns bundled skills when vault has none', async () => {
      mockAdapter.exists.mockResolvedValue(false)
      const skills = await skillManager.loadSkills()
      expect(skills.length).toBeGreaterThanOrEqual(1)
      expect(skills.every((s) => s.source === 'bundled')).toBe(true)
    })
  })
})
