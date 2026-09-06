import { App } from 'obsidian'
import { useCallback, useEffect, useState } from 'react'

import { useSkills } from '../../../contexts/skills-context'
import { Skill } from '../../../core/skills/types'
import { ObsidianButton } from '../../common/ObsidianButton'
import { ObsidianSetting } from '../../common/ObsidianSetting'
import { ObsidianToggle } from '../../common/ObsidianToggle'

type SkillsSectionProps = {
  app: App
}

export function SkillsSection({ app }: SkillsSectionProps) {
  const { skills, refreshSkills } = useSkills()
  const [isLoading, setIsLoading] = useState(false)

  const handleRescan = useCallback(async () => {
    setIsLoading(true)
    try {
      await refreshSkills()
    } finally {
      setIsLoading(false)
    }
  }, [refreshSkills])

  useEffect(() => {
    void refreshSkills()
  }, [refreshSkills])

  return (
    <div className="smtcmp-settings-section">
      <div className="smtcmp-settings-header">Skills</div>

      <div className="smtcmp-settings-desc smtcmp-settings-callout">
        <strong>How to use:</strong> Skills are reusable AI instructions
        discovered from your vault. Place skill files at{' '}
        <code>.agents/skills/&lt;name&gt;/SKILL.md</code> with YAML frontmatter
        (name, description) and a markdown body. Type <code>/</code> in the chat
        input to insert a skill, or the assistant will use the{' '}
        <code>read_skill</code> tool to load instructions on demand. Vault
        skills override bundled skills with the same name. Disable a skill to
        hide it from the AI.
      </div>

      <div className="smtcmp-settings-sub-header-container">
        <div className="smtcmp-settings-sub-header">Discovered Skills</div>
        <ObsidianButton
          text="Rescan"
          onClick={handleRescan}
          disabled={isLoading}
        />
      </div>

      <div className="smtcmp-templates-container">
        {isLoading && skills.length === 0 ? (
          <div className="smtcmp-templates-empty">Loading skills...</div>
        ) : skills.length > 0 ? (
          skills.map((skill) => (
            <SkillItem
              key={`${skill.source}:${skill.name}`}
              skill={skill}
              app={app}
            />
          ))
        ) : (
          <div className="smtcmp-templates-empty">No skills found</div>
        )}
      </div>
    </div>
  )
}

function SkillItem({ skill, app }: { skill: Skill; app: App }) {
  const { isSkillEnabled, toggleSkillEnabled } = useSkills()
  const isEnabled = isSkillEnabled(skill.name)

  const handleOpen = useCallback(() => {
    if (skill.source === 'vault') {
      const file = app.vault.getAbstractFileByPath(skill.path)
      if (file) {
        void app.workspace.openLinkText(skill.path, '', false)
      }
    }
  }, [app, skill.path, skill.source])

  const handleToggle = useCallback(() => {
    void toggleSkillEnabled(skill.name)
  }, [toggleSkillEnabled, skill.name])

  return (
    <ObsidianSetting className="smtcmp-skill-item">
      <div className="smtcmp-skill-item-info">
        <div className="smtcmp-skill-item-name">{skill.name}</div>
        <div
          className="smtcmp-settings-desc"
          style={{ fontSize: '12px', marginTop: '2px' }}
        >
          {skill.description}
        </div>
        <div className="smtcmp-skill-item-meta">
          <span
            className={`smtcmp-skill-source-badge smtcmp-skill-source-${skill.source}`}
          >
            {skill.source}
          </span>
          <span
            className="smtcmp-skill-path"
            onClick={handleOpen}
            style={{
              cursor: skill.source === 'vault' ? 'pointer' : 'default',
            }}
            title={skill.source === 'vault' ? 'Click to open' : skill.path}
          >
            {skill.path}
          </span>
        </div>
      </div>
      <ObsidianToggle value={isEnabled} onChange={handleToggle} />
    </ObsidianSetting>
  )
}
