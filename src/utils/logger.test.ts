import { logger } from './logger'

describe('logger', () => {
  let consoleDebugSpy: jest.SpyInstance
  let consoleInfoSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('level dispatch', () => {
    beforeEach(() => {
      logger.setLevel('debug')
    })

    it('debug calls console.debug with formatted output', () => {
      logger.debug('MyModule', 'myFn', 'hello')
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1)
      const output = consoleDebugSpy.mock.calls[0][0] as string
      expect(output).toContain('[DEBUG]')
      expect(output).toContain('[MyModule.myFn]')
      expect(output).toContain('hello')
    })

    it('info calls console.info with formatted output', () => {
      logger.info('MyModule', 'myFn', 'hello')
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
      const output = consoleInfoSpy.mock.calls[0][0] as string
      expect(output).toContain('[INFO]')
      expect(output).toContain('[MyModule.myFn]')
      expect(output).toContain('hello')
    })

    it('warn calls console.warn with formatted output', () => {
      logger.warn('MyModule', 'myFn', 'hello')
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      const output = consoleWarnSpy.mock.calls[0][0] as string
      expect(output).toContain('[WARN]')
      expect(output).toContain('[MyModule.myFn]')
      expect(output).toContain('hello')
    })

    it('error calls console.error with formatted output', () => {
      logger.error('MyModule', 'myFn', 'hello')
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const output = consoleErrorSpy.mock.calls[0][0] as string
      expect(output).toContain('[ERROR]')
      expect(output).toContain('[MyModule.myFn]')
      expect(output).toContain('hello')
    })
  })

  describe('format', () => {
    beforeEach(() => {
      logger.setLevel('debug')
    })

    it('includes an ISO8601 timestamp at the start', () => {
      logger.info('Mod', 'fn', 'msg')
      const output = consoleInfoSpy.mock.calls[0][0] as string
      const isoMatch = output.match(
        /^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/,
      )
      expect(isoMatch).not.toBeNull()
      if (isoMatch) {
        const parsed = Date.parse(isoMatch[1])
        expect(Number.isNaN(parsed)).toBe(false)
      }
    })

    it('includes module and function name in the expected segment', () => {
      logger.warn('SettingsParser', 'parse', 'parsing')
      const output = consoleWarnSpy.mock.calls[0][0] as string
      expect(output).toMatch(/\[SettingsParser\.parse\]/)
    })

    it('forwards extra args to the console method', () => {
      const extra = { a: 1 }
      logger.debug('Mod', 'fn', 'msg', extra)
      expect(consoleDebugSpy).toHaveBeenCalledWith(expect.any(String), extra)
    })

    it('formats correctly with an empty message', () => {
      logger.error('Mod', 'fn', '')
      const output = consoleErrorSpy.mock.calls[0][0] as string
      expect(output).toMatch(/\[ERROR\] \[Mod\.fn\] $/)
    })
  })

  describe('level filtering', () => {
    it('does not log debug when minLevel is info', () => {
      logger.setLevel('info')
      logger.debug('Mod', 'fn', 'should be suppressed')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })

    it('does not log debug or info when minLevel is warn', () => {
      logger.setLevel('warn')
      logger.debug('Mod', 'fn', 'should be suppressed')
      logger.info('Mod', 'fn', 'should be suppressed')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })

    it('logs warn and error when minLevel is warn', () => {
      logger.setLevel('warn')
      logger.warn('Mod', 'fn', 'warn-msg')
      logger.error('Mod', 'fn', 'error-msg')
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })

    it('only logs error when minLevel is error', () => {
      logger.setLevel('error')
      logger.debug('Mod', 'fn', 'no')
      logger.info('Mod', 'fn', 'no')
      logger.warn('Mod', 'fn', 'no')
      logger.error('Mod', 'fn', 'yes')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })

    it('logs all levels when minLevel is debug', () => {
      logger.setLevel('debug')
      logger.debug('Mod', 'fn', 'd')
      logger.info('Mod', 'fn', 'i')
      logger.warn('Mod', 'fn', 'w')
      logger.error('Mod', 'fn', 'e')
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1)
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })
  })
})
