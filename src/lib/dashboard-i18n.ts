export type DashboardLocale = 'en' | 'sw'

export const DASHBOARD_COPY = {
  en: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    quotes: ['The trend is your friend - until it ends.', 'Patience is a position too.', 'Trade the plan, not the noise.'],
    subtitle: 'Your trading workspace is ready.',
  },
  sw: {
    morning: 'Habari za asubuhi',
    afternoon: 'Habari za mchana',
    evening: 'Habari za jioni',
    quotes: ['Mwelekeo ni rafiki yako - hadi mwisho wake.', 'Subira pia ni nafasi ya biashara.', 'Fuata mpango, si kelele za soko.'],
    subtitle: 'Eneo lako la biashara liko tayari.',
  },
} as const

export function getDashboardLocale(value: string | undefined): DashboardLocale {
  return value?.toLowerCase().startsWith('sw') ? 'sw' : 'en'
}

export function getGreetingKey(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}