import {
  DEFAULT_SYSTEM_PROMPT,
  MINIMAL_SYSTEM_PROMPT,
  RECOMMENDED_MODELS_FOR_APPLY,
  RECOMMENDED_MODELS_FOR_CHAT,
} from '../../../constants'
import { useSettings } from '../../../contexts/settings-context'
import { ObsidianDropdown } from '../../common/ObsidianDropdown'
import { ObsidianSetting } from '../../common/ObsidianSetting'
import { ObsidianTextArea } from '../../common/ObsidianTextArea'
import { ObsidianTextInput } from '../../common/ObsidianTextInput'
import { ObsidianToggle } from '../../common/ObsidianToggle'

export function ChatSection() {
  const { settings, setSettings } = useSettings()

  return (
    <div className="smtcmp-settings-section">
      <div className="smtcmp-settings-header">Chat</div>

      <ObsidianSetting
        name="Show hidden features"
        desc="Reveal experimental settings that are currently disabled or in development."
      >
        <ObsidianToggle
          value={settings.showHiddenFeatures}
          onChange={async (value) => {
            await setSettings({
              ...settings,
              showHiddenFeatures: value,
            })
          }}
        />
      </ObsidianSetting>

      <ObsidianSetting
        name="Inject timestamp and day into system prompt"
        desc="When enabled, the current ISO8601 timestamp and day of week are injected into the system prompt."
      >
        <ObsidianToggle
          value={settings.injectTimestamp}
          onChange={async (value) => {
            await setSettings({
              ...settings,
              injectTimestamp: value,
            })
          }}
        />
      </ObsidianSetting>

      <ObsidianSetting
        name="Chat model"
        desc="Choose the model you want to use for chat."
      >
        <ObsidianDropdown
          value={settings.chatModelId}
          options={Object.fromEntries(
            settings.chatModels
              .filter(({ enable }) => enable ?? true)
              .map((chatModel) => [
                chatModel.id,
                `${chatModel.id}${RECOMMENDED_MODELS_FOR_CHAT.includes(chatModel.id) ? ' (Recommended)' : ''}`,
              ]),
          )}
          onChange={async (value) => {
            await setSettings({
              ...settings,
              chatModelId: value,
            })
          }}
        />
      </ObsidianSetting>

      <ObsidianSetting
        name="Apply model"
        desc="Choose the model you want to use for apply feature."
      >
        <ObsidianDropdown
          value={settings.applyModelId}
          options={Object.fromEntries(
            settings.chatModels
              .filter(({ enable }) => enable ?? true)
              .map((chatModel) => [
                chatModel.id,
                `${chatModel.id}${RECOMMENDED_MODELS_FOR_APPLY.includes(chatModel.id) ? ' (Recommended)' : ''}`,
              ]),
          )}
          onChange={async (value) => {
            await setSettings({
              ...settings,
              applyModelId: value,
            })
          }}
        />
      </ObsidianSetting>

      <ObsidianSetting
        name="System prompt"
        desc="Choose the instructions used at the beginning of every chat."
      >
        <ObsidianDropdown
          value={settings.systemPromptMode}
          options={{
            default: 'Default',
            minimal: 'Minimal',
            custom: 'Custom',
          }}
          onChange={async (value) => {
            await setSettings({
              ...settings,
              systemPromptMode: value as typeof settings.systemPromptMode,
            })
          }}
        />
      </ObsidianSetting>

      {(settings.systemPromptMode === 'default' ||
        settings.systemPromptMode === 'minimal') && (
        <ObsidianSetting
          name="Built-in prompt preview"
          desc="This is the built-in system prompt. It cannot be edited. Select 'Custom' to write your own."
          className="smtcmp-settings-textarea-header"
        />
      )}
      {(settings.systemPromptMode === 'default' ||
        settings.systemPromptMode === 'minimal') && (
        <ObsidianSetting className="smtcmp-settings-textarea">
          <ObsidianTextArea
            value={
              settings.systemPromptMode === 'default'
                ? DEFAULT_SYSTEM_PROMPT
                : MINIMAL_SYSTEM_PROMPT
            }
            onChange={() => undefined}
          />
        </ObsidianSetting>
      )}

      {settings.systemPromptMode === 'custom' && (
        <ObsidianSetting
          name="Custom system prompt"
          desc="This prompt replaces the built-in system prompt."
          className="smtcmp-settings-textarea-header"
        />
      )}
      {settings.systemPromptMode === 'custom' && (
        <ObsidianSetting className="smtcmp-settings-textarea">
          <ObsidianTextArea
            value={settings.systemPrompt}
            onChange={async (value: string) => {
              await setSettings({
                ...settings,
                systemPrompt: value,
              })
            }}
          />
        </ObsidianSetting>
      )}

      <ObsidianSetting
        name="Include current file"
        desc="Automatically include the content of your current file in chats."
      >
        <ObsidianToggle
          value={settings.chatOptions.includeCurrentFileContent}
          onChange={async (value) => {
            await setSettings({
              ...settings,
              chatOptions: {
                ...settings.chatOptions,
                includeCurrentFileContent: value,
              },
            })
          }}
        />
      </ObsidianSetting>

      <ObsidianSetting
        name="Enable tools"
        desc="Allow the AI to use MCP tools."
      >
        <ObsidianToggle
          value={settings.chatOptions.enableTools}
          onChange={async (value) => {
            await setSettings({
              ...settings,
              chatOptions: {
                ...settings.chatOptions,
                enableTools: value,
              },
            })
          }}
        />
      </ObsidianSetting>

      <ObsidianSetting
        name="Max auto tool requests"
        desc="Maximum number of consecutive tool calls that can be made automatically without user confirmation. Higher values can significantly increase costs as each tool call consumes additional tokens."
      >
        <ObsidianTextInput
          value={settings.chatOptions.maxAutoIterations.toString()}
          onChange={async (value) => {
            const parsedValue = parseInt(value)
            if (isNaN(parsedValue) || parsedValue < 1) {
              return
            }
            await setSettings({
              ...settings,
              chatOptions: {
                ...settings.chatOptions,
                maxAutoIterations: parsedValue,
              },
            })
          }}
        />
      </ObsidianSetting>
    </div>
  )
}
