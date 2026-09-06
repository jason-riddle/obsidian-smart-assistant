import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { SkillManager } from '../core/skills/skillManager'
import { Skill } from '../core/skills/types'

import { useApp } from './app-context'
import { useSettings } from './settings-context'
import { toggleSkillEnabledLogic } from './toggleSkillEnabledLogic'

export type SkillsContextType = {
  skills: Skill[]
  disabledSkills: string[]
  refreshSkills: () => Promise<void>
  getSkillManager: () => SkillManager
  toggleSkillEnabled: (skillName: string) => Promise<void>
  isSkillEnabled: (skillName: string) => boolean
}

const SkillsContext = createContext<SkillsContextType | null>(null)

export function SkillsProvider({ children }: PropsWithChildren) {
  const app = useApp()
  const { settings, setSettings } = useSettings()
  const [skills, setSkills] = useState<Skill[]>([])

  const skillManager = useMemo(() => new SkillManager(app), [app])

  useEffect(() => {
    skillManager.registerVaultListeners()
    void skillManager.loadSkills().then(setSkills)
    const unsubscribe = skillManager.subscribe(setSkills)
    return () => {
      unsubscribe()
      skillManager.cleanup()
    }
  }, [skillManager])

  const refreshSkills = useCallback(async () => {
    const loaded = await skillManager.loadSkills()
    setSkills(loaded)
  }, [skillManager])

  const getSkillManager = useCallback(() => skillManager, [skillManager])

  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const toggleSkillEnabled = useCallback(
    async (skillName: string) => {
      const current = settingsRef.current
      await setSettings(toggleSkillEnabledLogic(current, skillName))
    },
    [setSettings],
  )

  const isSkillEnabled = useCallback(
    (skillName: string) => !settings.disabledSkills.includes(skillName),
    [settings.disabledSkills],
  )

  const value = useMemo(
    () => ({
      skills,
      disabledSkills: settings.disabledSkills,
      refreshSkills,
      getSkillManager,
      toggleSkillEnabled,
      isSkillEnabled,
    }),
    [
      skills,
      settings.disabledSkills,
      refreshSkills,
      getSkillManager,
      toggleSkillEnabled,
      isSkillEnabled,
    ],
  )

  return (
    <SkillsContext.Provider value={value}>{children}</SkillsContext.Provider>
  )
}

export function useSkills() {
  const context = useContext(SkillsContext)
  if (!context) {
    throw new Error('useSkills must be used within a SkillsProvider')
  }
  return context
}
