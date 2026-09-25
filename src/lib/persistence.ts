'use client'

import { getSupabaseClient } from '@/lib/supabase'

export type ProfilePreferences = {
  full_name: string
  email: string
  phone: string
}

export type AlertPreferences = {
  connected: boolean
  chatId: string
  alerts: Record<string, boolean>
}

async function currentUserId() {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function persistProfilePreferences(profile: ProfilePreferences) {
  const supabase = getSupabaseClient()
  const userId = await currentUserId()
  if (!supabase || !userId) return false
  const { error } = await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone }).eq('id', userId)
  return !error
}

export async function persistAlertPreferences(preferences: AlertPreferences) {
  const supabase = getSupabaseClient()
  const userId = await currentUserId()
  if (!supabase || !userId) return false
  const { error } = await supabase.from('profiles').update({ telegram_id: preferences.connected ? preferences.chatId : null }).eq('id', userId)
  return !error
}

export async function persistTrackedModels(modelIds: string[]) {
  const supabase = getSupabaseClient()
  const userId = await currentUserId()
  if (!supabase || !userId) return false
  const { error } = await supabase.from('profiles').update({ metadata: { followed_models: modelIds } }).eq('id', userId)
  return !error
}
