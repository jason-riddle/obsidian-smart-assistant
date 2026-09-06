import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import clsx from "clsx"
import fuzzysort from "fuzzysort"
import {
  $createTextNode,
  COMMAND_PRIORITY_NORMAL,
  TextNode,
} from "lexical"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { useSkills } from "../../../../../contexts/skills-context"
import { Skill } from "../../../../../core/skills/types"
import { MenuOption } from "../shared/LexicalMenu"
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from "../typeahead-menu/LexicalTypeaheadMenuPlugin"

class SkillTypeaheadOption extends MenuOption {
  name: string
  description: string
  skill: Skill

  constructor(skill: Skill) {
    super(skill.name)
    this.name = skill.name
    this.description = skill.description
    this.skill = skill
  }
}

function SkillMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  option: SkillTypeaheadOption
}) {
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={clsx("item", isSelected && "selected")}
      ref={(el) => option.setRefElement(el)}
      role="option"
      aria-selected={isSelected}
      id={`typeahead-item-${index}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <div className="smtcmp-template-menu-item">
        <div className="text">{option.name}</div>
        <div
          className="smtcmp-settings-desc"
          style={{ fontSize: "12px", marginTop: "2px" }}
        >
          {option.description}
        </div>
      </div>
    </li>
  )
}

export default function SkillPlugin() {
  const [editor] = useLexicalComposerContext()
  const { skills } = useSkills()

  const [queryString, setQueryString] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Skill[]>([])

  useEffect(() => {
    if (queryString == null) return
    if (skills.length === 0) {
      setSearchResults([])
      return
    }
    const results = fuzzysort
      .go(queryString, skills, {
        keys: ["name", "description"],
        threshold: 0.2,
        limit: 20,
        all: true,
      })
      .map((result) => result.obj)
    setSearchResults(results)
  }, [queryString, skills])

  const options = useMemo(
    () => searchResults.map((skill) => new SkillTypeaheadOption(skill)),
    [searchResults],
  )

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  })

  const onSelectOption = useCallback(
    (
      selectedOption: SkillTypeaheadOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const textNode = $createTextNode(selectedOption.skill.body)
        if (nodeToRemove) {
          const parent = nodeToRemove.getParentOrThrow()
          parent.splice(nodeToRemove.getIndexWithinParent(), 1, [textNode])
          textNode.selectEnd()
        }
        closeMenu()
      })
    },
    [editor],
  )

  return (
    <LexicalTypeaheadMenuPlugin<SkillTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      commandPriority={COMMAND_PRIORITY_NORMAL}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorElementRef.current && searchResults.length
          ? createPortal(
              <div
                className="smtcmp-popover"
                style={{
                  position: "fixed",
                }}
              >
                <ul>
                  {options.map((option, i: number) => (
                    <SkillMenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i)
                        selectOptionAndCleanUp(option)
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i)
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current,
            )
          : null
      }
    />
  )
}
