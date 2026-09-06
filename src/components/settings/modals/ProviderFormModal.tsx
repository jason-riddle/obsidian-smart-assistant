import { App, Notice, requestUrl } from 'obsidian'
import { useState } from 'react'

import { PROVIDER_TYPES_INFO } from '../../../constants'
import SmartAssistantPlugin from '../../../main'
import { LLMProvider, llmProviderSchema } from '../../../types/provider.types'
import { ObsidianButton } from '../../common/ObsidianButton'
import { ObsidianDropdown } from '../../common/ObsidianDropdown'
import { ObsidianSetting } from '../../common/ObsidianSetting'
import { ObsidianTextInput } from '../../common/ObsidianTextInput'
import { ObsidianToggle } from '../../common/ObsidianToggle'
import { ReactModal } from '../../common/ReactModal'

type ProviderFormComponentProps = {
  plugin: SmartAssistantPlugin
  provider: LLMProvider | null // null for new provider
  onClose: () => void
}

export class AddProviderModal extends ReactModal<ProviderFormComponentProps> {
  constructor(app: App, plugin: SmartAssistantPlugin) {
    super({
      app: app,
      Component: ProviderFormComponent,
      props: { plugin, provider: null },
      options: {
        title: 'Add Custom Provider',
      },
    })
  }
}

export class EditProviderModal extends ReactModal<ProviderFormComponentProps> {
  constructor(app: App, plugin: SmartAssistantPlugin, provider: LLMProvider) {
    super({
      app: app,
      Component: ProviderFormComponent,
      props: { plugin, provider },
      options: {
        title: `Edit Provider: ${provider.id}`,
      },
    })
  }
}

function ProviderFormComponent({
  plugin,
  provider,
  onClose,
}: ProviderFormComponentProps) {
  const [formData, setFormData] = useState<LLMProvider>(
    provider
      ? { ...provider }
      : {
          type: 'openai-compatible',
          id: '',
          apiKey: '',
          baseUrl: '',
        },
  )
  const [isTesting, setIsTesting] = useState(false)

  const handleTestConnection = async () => {
    const validationResult = llmProviderSchema.safeParse(formData)
    if (!validationResult.success) {
      new Notice(validationResult.error.issues.map((v) => v.message).join('\n'))
      return
    }
    const baseUrl = formData.baseUrl?.replace(/\/+$/, '')
    if (!baseUrl) {
      new Notice('A base URL is required to test this provider.')
      return
    }
    setIsTesting(true)
    try {
      const modelsResponse = await requestUrl({
        url: `${baseUrl}/models`,
        method: 'GET',
        headers: formData.apiKey
          ? { Authorization: `Bearer ${formData.apiKey}` }
          : undefined,
      })
      const model = modelsResponse.json?.data?.[0]?.id
      if (!model) {
        throw new Error('The provider returned no models to test.')
      }
      const response = await requestUrl({
        url: `${baseUrl}/chat/completions`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(formData.apiKey
            ? { Authorization: `Bearer ${formData.apiKey}` }
            : {}),
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say hi' }],
          max_tokens: 16,
        }),
      })
      const content = response.json?.choices?.[0]?.message?.content as
        | string
        | undefined
      new Notice(
        content
          ? `Provider response: ${content}`
          : 'Provider responded successfully.',
      )
    } catch (error) {
      new Notice(
        `Provider test failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async () => {
    if (provider) {
      const newProviders = [...plugin.settings.providers]
      const currentProviderIndex = newProviders.findIndex(
        (v) => v.id === formData.id,
      )

      if (currentProviderIndex === -1) {
        new Notice(`No provider found with this ID`)
        return
      }

      const validationResult = llmProviderSchema.safeParse(formData)
      if (!validationResult.success) {
        new Notice(
          validationResult.error.issues.map((v) => v.message).join('\n'),
        )
        return
      }

      await plugin.setSettings({
        ...plugin.settings,
        providers: [
          ...plugin.settings.providers.slice(0, currentProviderIndex),
          formData,
          ...plugin.settings.providers.slice(currentProviderIndex + 1),
        ],
      })
    } else {
      if (
        plugin.settings.providers.some((p: LLMProvider) => p.id === formData.id)
      ) {
        new Notice('Provider with this ID already exists. Try a different ID.')
        return
      }

      const validationResult = llmProviderSchema.safeParse(formData)
      if (!validationResult.success) {
        new Notice(
          validationResult.error.issues.map((v) => v.message).join('\n'),
        )
        return
      }

      await plugin.setSettings({
        ...plugin.settings,
        providers: [...plugin.settings.providers, formData],
      })
    }

    onClose()
  }

  const providerTypeInfo = PROVIDER_TYPES_INFO[formData.type]

  return (
    <>
      {!provider && (
        <>
          <ObsidianSetting
            name="ID"
            desc="Choose an ID to identify this provider in your settings. This is just for your reference."
            required
          >
            <ObsidianTextInput
              value={formData.id}
              placeholder="my-custom-provider"
              onChange={(value: string) =>
                setFormData((prev) => ({ ...prev, id: value }))
              }
            />
          </ObsidianSetting>

          <ObsidianSetting name="Provider Type" required>
            <ObsidianDropdown
              value={formData.type}
              options={Object.fromEntries(
                Object.entries(PROVIDER_TYPES_INFO).map(([key, info]) => [
                  key,
                  info.label,
                ]),
              )}
              onChange={(value: string) =>
                setFormData(
                  (prev) =>
                    ({
                      ...prev,
                      type: value,
                      additionalSettings: {},
                    }) as LLMProvider,
                )
              }
            />
          </ObsidianSetting>
        </>
      )}

      <>
        <ObsidianSetting
          name="API Key"
          desc="(leave blank if not required)"
          required={providerTypeInfo.requireApiKey}
        >
          <ObsidianTextInput
            value={formData.apiKey ?? ''}
            placeholder="Enter your API Key"
            onChange={(value: string) =>
              setFormData((prev) => ({ ...prev, apiKey: value }))
            }
          />
        </ObsidianSetting>

        <ObsidianSetting
          name="Base URL"
          desc="(leave blank if using default)"
          required={providerTypeInfo.requireBaseUrl}
        >
          <ObsidianTextInput
            value={formData.baseUrl ?? ''}
            placeholder="Enter base URL"
            onChange={(value: string) =>
              setFormData((prev) => ({ ...prev, baseUrl: value }))
            }
          />
        </ObsidianSetting>
      </>

      {providerTypeInfo.additionalSettings.map((setting) => (
        <ObsidianSetting
          key={setting.key}
          name={setting.label}
          desc={'description' in setting ? setting.description : undefined}
          required={setting.required}
        >
          {setting.type === 'toggle' ? (
            <ObsidianToggle
              value={
                (formData.additionalSettings as Record<string, boolean>)?.[
                  setting.key
                ] ?? false
              }
              onChange={(value: boolean) =>
                setFormData(
                  (prev) =>
                    ({
                      ...prev,
                      additionalSettings: {
                        ...(prev.additionalSettings ?? {}),
                        [setting.key]: value,
                      },
                    }) as LLMProvider,
                )
              }
            />
          ) : (
            <ObsidianTextInput
              value={
                (formData.additionalSettings as Record<string, string>)?.[
                  setting.key
                ] ?? ''
              }
              placeholder={setting.placeholder}
              onChange={(value: string) =>
                setFormData(
                  (prev) =>
                    ({
                      ...prev,
                      additionalSettings: {
                        ...(prev.additionalSettings ?? {}),
                        [setting.key]: value,
                      },
                    }) as LLMProvider,
                )
              }
            />
          )}
        </ObsidianSetting>
      ))}

      <ObsidianSetting>
        <ObsidianButton
          text={isTesting ? 'Testing...' : 'Test connection'}
          onClick={handleTestConnection}
          disabled={isTesting}
        />
        <ObsidianButton
          text={provider ? 'Save' : 'Add'}
          onClick={handleSubmit}
          cta
        />
        <ObsidianButton text="Cancel" onClick={onClose} />
      </ObsidianSetting>
    </>
  )
}
