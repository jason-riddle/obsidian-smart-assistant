import { App, EventRef, normalizePath } from "obsidian"

import { BUNDLED_SKILLS } from "./bundledSkills"
import {
  Skill,
  SkillFrontmatter,
  VAULT_SKILLS_DIR,
  skillFrontmatterSchema,
} from "./types"

const SKILL_FILE_NAME = "SKILL.md"
const DEBOUNCE_MS = 500

function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>
  body: string
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }
  const yamlBlock = match[1]
  const body = match[2]
  const frontmatter: Record<string, unknown> = {}
  for (const line of yamlBlock.split(/\r?\n/)) {
    if (line.trim() === "") continue
    const colonIndex = line.indexOf(":")
    if (colonIndex === -1) continue
    const key = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()
    frontmatter[key] = value
  }
  return { frontmatter, body }
}

function getDirName(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/")
  const dir = parts.length > 1 ? parts[parts.length - 2] : ""
  return dir
}

export class SkillManager {
  private app: App
  private skills: Skill[] = []
  private subscribers = new Set<(skills: Skill[]) => void>()
  private vaultEventRefs: EventRef[] = []
  private debounceTimer: ReturnType<typeof setTimeout> | null = null

  constructor(app: App) {
    this.app = app
  }

  public async loadSkills(): Promise<Skill[]> {
    const vaultSkills = await this.loadVaultSkills()
    const bundledSkills = BUNDLED_SKILLS
    const skillsByName = new Map<string, Skill>()
    for (const skill of bundledSkills) {
      skillsByName.set(skill.name, skill)
    }
    for (const skill of vaultSkills) {
      skillsByName.set(skill.name, skill)
    }
    this.skills = Array.from(skillsByName.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
    this.notifySubscribers()
    return this.skills
  }

  public getSkills(): Skill[] {
    return this.skills
  }

  public findSkillByName(name: string): Skill | undefined {
    return this.skills.find((skill) => skill.name === name)
  }

  public parseSkillFile(
    content: string,
    path: string,
    source: "vault" | "bundled",
  ): Skill {
    const { frontmatter: rawFrontmatter, body } = parseFrontmatter(content)
    const parsed = skillFrontmatterSchema.safeParse(rawFrontmatter)
    if (!parsed.success) {
      throw new Error(
        `Invalid skill frontmatter in ${path}: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      )
    }
    const frontmatter: SkillFrontmatter = parsed.data
    const dir = getDirName(path)
    if (frontmatter.name !== dir) {
      throw new Error(
        `Skill name "${frontmatter.name}" does not match directory name "${dir}" in ${path}`,
      )
    }
    return {
      name: frontmatter.name,
      description: frontmatter.description,
      frontmatter,
      body: body.trim(),
      source,
      path,
      dir,
    }
  }

  public subscribe(callback: (skills: Skill[]) => void): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  public notifySubscribers() {
    for (const cb of this.subscribers) {
      cb(this.skills)
    }
  }

  public registerVaultListeners(): void {
    this.unregisterVaultListeners()
    const handler = (_file: unknown) => {
      this.scheduleReload()
    }
    const createRef = this.app.vault.on("create", (file) => {
      if (this.isUnderSkillsDir(file.path)) handler(file)
    })
    const modifyRef = this.app.vault.on("modify", (file) => {
      if (this.isUnderSkillsDir(file.path)) handler(file)
    })
    const deleteRef = this.app.vault.on("delete", (file) => {
      if (this.isUnderSkillsDir(file.path)) handler(file)
    })
    this.vaultEventRefs = [createRef, modifyRef, deleteRef]
  }

  public unregisterVaultListeners(): void {
    for (const ref of this.vaultEventRefs) {
      this.app.vault.offref(ref)
    }
    this.vaultEventRefs = []
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  public cleanup(): void {
    this.unregisterVaultListeners()
    this.subscribers.clear()
  }

  private isUnderSkillsDir(path: string): boolean {
    const normalized = path.replace(/\\/g, "/")
    return normalized.startsWith(VAULT_SKILLS_DIR + "/")
  }

  private scheduleReload(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null
      void this.loadSkills()
    }, DEBOUNCE_MS)
  }

  private async loadVaultSkills(): Promise<Skill[]> {
    const skills: Skill[] = []
    const adapter = this.app.vault.adapter
    const skillsDirExists = await adapter
      .exists(normalizePath(VAULT_SKILLS_DIR))
      .catch(() => false)
    if (!skillsDirExists) {
      return skills
    }
    let entries: { files: string[]; folders: string[] }
    try {
      entries = await adapter.list(normalizePath(VAULT_SKILLS_DIR))
    } catch {
      return skills
    }
    for (const folder of entries.folders) {
      const skillFilePath = normalizePath(`${folder}/${SKILL_FILE_NAME}`)
      const exists = await adapter.exists(skillFilePath).catch(() => false)
      if (!exists) continue
      let content: string
      try {
        content = await adapter.read(skillFilePath)
      } catch {
        continue
      }
      try {
        const skill = this.parseSkillFile(content, skillFilePath, "vault")
        skills.push(skill)
      } catch (error) {
        console.error(error)
      }
    }
    return skills
  }
}
