import { App } from "obsidian"

import { AppProvider } from "../../contexts/app-context"
import { SkillsProvider } from "../../contexts/skills-context"
import { ReactModal } from "../common/ReactModal"
import { SkillsSection } from "../settings/sections/SkillsSection"

type SkillsSectionModalProps = {
  app: App
}

export class SkillsSectionModal extends ReactModal<SkillsSectionModalProps> {
  constructor(app: App) {
    super({
      app: app,
      Component: SkillsSectionComponent,
      props: {
        app,
      },
    })
    this.modalEl.style.width = "720px"
  }
}

function SkillsSectionComponent({ app }: SkillsSectionModalProps) {
  return (
    <AppProvider app={app}>
      <SkillsProvider>
        <SkillsSection app={app} />
      </SkillsProvider>
    </AppProvider>
  )
}
