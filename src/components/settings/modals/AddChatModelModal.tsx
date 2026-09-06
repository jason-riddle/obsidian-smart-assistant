import { App, Notice, requestUrl } from 'obsidian'
import { useState } from 'react'

import { DEFAULT_PROVIDERS } from '../../../constants'
import SmartAssistantPlugin from '../../../main'
import { ChatModel, chatModelSchema } from '../../../types/chat-model.types'
import { PromptLevel } from '../../../types/prompt-level.types'
import { ObsidianButton } from '../../common/ObsidianButton'
import { ObsidianDropdown } from '../../common/ObsidianDropdown'
import { ObsidianSetting } from '../../common/ObsidianSetting'
import { ObsidianTextInput } from '../../common/ObsidianTextInput'
import { ReactModal } from '../../common/ReactModal'

type AddChatModelModalComponentProps = {
  plugin: SmartAssistantPlugin
  onClose: () => void
}

export class AddChatModelModal extends ReactModal<AddChatModelModalComponentProps> {
  constructor(app: App, plugin: SmartAssistantPlugin) {
    super({
      app: app,
      Component: AddChatModelModalComponent,
      props: { plugin },
      options: {
        title: 'Add Custom Chat Model',
      },
    })
  }
}

function AddChatModelModalComponent({
  plugin,
  onClose,
}: AddChatModelModalComponentProps) {
  const [formData, setFormData] = useState<ChatModel>({
    providerId: DEFAULT_PROVIDERS[0].id,
    providerType: DEFAULT_PROVIDERS[0].type,
    id: '',
    model: '',
    promptLevel: PromptLevel.Default,
  })
  const [isTesting, setIsTesting] = useState(false)

  const handleTestModel = async () => {
    const provider = plugin.settings.providers.find(
      (p) => p.id === formData.providerId,
    )
    if (!provider) {
      new Notice('Provider not found.')
      return
    }
    const baseUrl = provider.baseUrl?.replace(/\/+$/, '')
    if (!baseUrl) {
      new Notice('This provider has no base URL configured.')
      return
    }
    setIsTesting(true)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (provider.apiKey) {
        headers.Authorization = `Bearer ${provider.apiKey}`
      }
      const response = await requestUrl({
        url: `${baseUrl}/chat/completions`,
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: formData.model,
          messages: [{ role: 'user', content: 'Say hi' }],
          max_tokens: 16,
        }),
      })
      const content = response.json?.choices?.[0]?.message?.content
      new Notice(
        typeof content === 'string' ? content : 'Model responded successfully.',
      )
    } catch (error) {
      new Notice(
        error instanceof Error ? error.message : 'Failed to test model.',
      )
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async () => {
    if (plugin.settings.chatModels.some((p) => p.id === formData.id)) {
      new Notice('Model with this ID already exists. Try a different ID.')
      return
    }

    if (
      !plugin.settings.providers.some(
        (provider) => provider.id === formData.providerId,
      )
    ) {
      new Notice('Provider with this ID does not exist')
      return
    }

    const validationResult = chatModelSchema.safeParse(formData)
    if (!validationResult.success) {
      new Notice(validationResult.error.issues.map((v) => v.message).join('\n'))
      return
    }

    await plugin.setSettings({
      ...plugin.settings,
      chatModels: [...plugin.settings.chatModels, formData],
    })

    onClose()
  }

  return (
    <>
      <ObsidianSetting
        name="ID"
        desc="Choose an ID to identify this model in your settings. This is just for your reference."
        required
      >
        <ObsidianTextInput
          value={formData.id}
          placeholder="my-custom-model"
          onChange={(value: string) =>
            setFormData((prev) => ({ ...prev, id: value }))
          }
        />
      </ObsidianSetting>

      <ObsidianSetting name="Provider ID" required>
        <ObsidianDropdown
          value={formData.providerId}
          options={Object.fromEntries(
            plugin.settings.providers.map((provider) => [
              provider.id,
              provider.id,
            ]),
          )}
          onChange={(value: string) => {
            const provider = plugin.settings.providers.find(
              (p) => p.id === value,
            )
            if (!provider) {
              new Notice(`Provider with ID ${value} not found`)
              return
            }
            // Cast required because we're changing the discriminant field
            setFormData(
              (prev) =>
                ({
                  ...prev,
                  providerId: value,
                  providerType: provider.type,
                }) as ChatModel,
            )
          }}
        />
      </ObsidianSetting>

      <ObsidianSetting name="Model Name" required>
        <ObsidianTextInput
          value={formData.model}
          placeholder="Enter the model name"
          onChange={(value: string) =>
            setFormData((prev) => ({ ...prev, model: value }))
          }
        />
      </ObsidianSetting>

      <ObsidianSetting
        name="Prompt Level"
        desc={`Choose how complex the system prompt should be. Select "simple" for small models that ignore user questions and just repeat back instructions.`}
        required
      >
        <ObsidianDropdown
          value={(formData.promptLevel ?? PromptLevel.Default).toString()}
          options={{
            [PromptLevel.Default]: 'default',
            [PromptLevel.Simple]: 'simple',
          }}
          onChange={(value: string) =>
            setFormData((prev) => ({
              ...prev,
              promptLevel: Number(value) as PromptLevel,
            }))
          }
        />
      </ObsidianSetting>

      <ObsidianSetting>
        <ObsidianButton
          text={isTesting ? 'Testing...' : 'Test model'}
          onClick={handleTestModel}
          disabled={isTesting}
        />
        <ObsidianButton text="Add" onClick={handleSubmit} cta />
        <ObsidianButton text="Cancel" onClick={onClose} />
      </ObsidianSetting>
    </>
  )
}
