import { describe, expect, it } from 'vitest'
import { getDashboardLocale, getGreetingKey } from '@/lib/dashboard-i18n'

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
