import { z } from 'zod'

export const skillFrontmatterSchema = z.object({
  name: z
    .string()
    .max(64)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'name must be lowercase with hyphens'),
  description: z.string().max(1024),
  license: z.string().optional(),
  compatibility: z.string().max(500).optional(),
  metadata: z.union([z.record(z.string(), z.string()), z.string()]).optional(),
  'allowed-tools': z.string().optional(),
})

export type SkillFrontmatter = z.infer<typeof skillFrontmatterSchema>

export type Skill = {
  name: string
  description: string
  frontmatter: SkillFrontmatter
  body: string
  source: 'vault' | 'bundled'
  path: string
  dir: string
}

export const VAULT_SKILLS_DIR = '.agents/skills'
export const BUNDLED_SKILLS_DIR = 'skills'
