import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { SkillManager } from "../core/skills/skillManager"
import { Skill } from "../core/skills/types"

import { useApp } from "./app-context"

export type SkillsContextType = {
  skills: Skill[]
  refreshSkills: () => Promise<void>
  getSkillManager: () => SkillManager
}

const SkillsContext = createContext<SkillsContextType | null>(null)

export function SkillsProvider({ children }: PropsWithChildren) {
  const app = useApp()
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

  const value = useMemo(
    () => ({ skills, refreshSkills, getSkillManager }),
    [skills, refreshSkills, getSkillManager],
  )

  return (
    <SkillsContext.Provider value={value}>{children}</SkillsContext.Provider>
  )
}

export function useSkills() {
  const context = useContext(SkillsContext)
  if (!context) {
    throw new Error("useSkills must be used within a SkillsProvider")
  }
  return context
}
