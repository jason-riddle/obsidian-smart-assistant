import { AbstractInputSuggest, App, TFile, TextComponent } from 'obsidian'
import { useEffect, useRef, useState } from 'react'

import { useObsidianSetting } from './ObsidianSetting'

class FileSuggest extends AbstractInputSuggest<TFile> {
  private readonly onSelectCallback: (file: TFile) => void

  constructor(
    app: App,
    inputEl: HTMLInputElement,
    onSelect: (file: TFile) => void,
  ) {
    super(app, inputEl)
    this.onSelectCallback = onSelect
  }

  getSuggestions(query: string): TFile[] {
    const lowerQuery = query.toLowerCase()
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.toLowerCase().includes(lowerQuery))
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.addClass('smtcmp-file-suggest-item')
    el.createEl('div', { text: file.name })
    el.createEl('small', { text: file.path })
  }

  selectSuggestion(file: TFile): void {
    this.setValue(file.path)
    this.onSelectCallback(file)
    this.close()
  }
}

type FileSuggestInputProps = {
  app: App
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function FileSuggestInput({
  app,
  value,
  placeholder,
  onChange,
}: FileSuggestInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setting } = useObsidianSetting()
  const [textComponent, setTextComponent] = useState<TextComponent | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (setting) {
      let newTextComponent: TextComponent | null = null
      setting.addText((component) => {
        newTextComponent = component
      })
      setTextComponent(newTextComponent)

      return () => {
        newTextComponent?.inputEl.remove()
      }
    } else if (containerRef.current) {
      const newTextComponent = new TextComponent(containerRef.current)
      setTextComponent(newTextComponent)

      return () => {
        newTextComponent?.inputEl.remove()
      }
    }
  }, [setting])

  useEffect(() => {
    if (!textComponent) return
    textComponent.onChange((v) => onChangeRef.current(v))
  }, [textComponent])

  useEffect(() => {
    if (!textComponent) return
    textComponent.setValue(value)
    if (placeholder) textComponent.setPlaceholder(placeholder)
  }, [textComponent, value, placeholder])

  useEffect(() => {
    if (!textComponent) return
    const suggest = new FileSuggest(app, textComponent.inputEl, (file) => {
      onChangeRef.current(file.path)
    })
    return () => {
      suggest.close()
    }
  }, [textComponent, app])

  return <div ref={containerRef} />
}
