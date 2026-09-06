import {
  DEFAULT_APPLY_MODEL_ID,
  DEFAULT_CHAT_MODELS,
  DEFAULT_CHAT_MODEL_ID,
  DEFAULT_PROVIDERS,
} from '../../constants'

import { SETTINGS_SCHEMA_VERSION } from './migrations'
import { parseSmartAssistantSettings } from './settings'

describe('parseSmartAssistantSettings', () => {
  it('should return default values for empty input', () => {
    const result = parseSmartAssistantSettings({})
    expect(result).toEqual({
      version: SETTINGS_SCHEMA_VERSION,

      providers: [...DEFAULT_PROVIDERS],

      chatModels: [...DEFAULT_CHAT_MODELS],

      chatModelId: DEFAULT_CHAT_MODEL_ID,
      applyModelId: DEFAULT_APPLY_MODEL_ID,

      systemPromptFile: '',
      systemPrompt: '',
      systemPromptMode: 'default',
      showHiddenFeatures: false,
      injectTimestamp: false,

      mcp: {
        servers: [],
      },

      disabledSkills: [],

      chatOptions: {
        includeCurrentFileContent: true,
        enableTools: true,
        maxAutoIterations: 1,
      },
    })
  })
})
