import { describe, expect, it, vi } from 'vitest'
import { DerivWebSocket } from '@/lib/deriv-websocket'

describe('DerivWebSocket tick subscriptions', () => {
  it('surfaces subscription errors to the caller', async () => {
    const client = new DerivWebSocket()
    const error = new Error('Tick subscription denied')
    vi.spyOn(client, 'ticks').mockRejectedValue(error)
    const onError = vi.fn()

    client.subscribeTicks('R_10', vi.fn(), onError)

    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error))
  })
})
