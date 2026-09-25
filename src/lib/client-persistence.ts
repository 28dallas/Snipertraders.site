'use client'

export function readClientState<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeClientState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Preview mode remains usable when browser storage is unavailable.
  }
}