import { DEFAULT_SYSTEM_PROMPT, MINIMAL_SYSTEM_PROMPT } from '../../constants'

import { selectSystemPrompt } from './promptGenerator'

describe('selectSystemPrompt', () => {
  it('selects the default built-in prompt', () => {
    expect(selectSystemPrompt('default', 'custom')).toBe(DEFAULT_SYSTEM_PROMPT)
  })

  it('selects the minimal built-in prompt', () => {
    expect(selectSystemPrompt('minimal', 'custom')).toBe(MINIMAL_SYSTEM_PROMPT)
  })

  it('selects and trims the custom prompt', () => {
    expect(selectSystemPrompt('custom', '  custom instructions  ')).toBe(
      'custom instructions',
    )
  })
})
