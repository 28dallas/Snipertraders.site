import { describe, expect, it } from 'vitest'
import { getDashboardLocale, getGreetingKey } from '@/lib/dashboard-i18n'
import { MOCK_BOTS } from '@/lib/data'

describe('dashboard localization', () => {
  it('supports Swahili and falls back to English', () => {
    expect(getDashboardLocale('sw-KE')).toBe('sw')
    expect(getDashboardLocale('en-US')).toBe('en')
    expect(getDashboardLocale(undefined)).toBe('en')
  })

  it('selects time-of-day greetings', () => {
    expect(getGreetingKey(8)).toBe('morning')
    expect(getGreetingKey(14)).toBe('afternoon')
    expect(getGreetingKey(20)).toBe('evening')
  })
})

describe('free bot showcase data', () => {
  it('includes the three featured bots in the free catalog', () => {
    const freeBotNames = MOCK_BOTS.filter((bot) => bot.is_free).map((bot) => bot.name)

    expect(freeBotNames).toEqual(expect.arrayContaining([
      'Texas Even Bot',
      'Infinity Algo',
      'Advanced Goldmine M1',
    ]))
  })
})
