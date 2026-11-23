import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSupportChannel } from '@/hooks/useSupportChannel'

describe('useSupportChannel', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports no channel before the first support request', () => {
    const { result } = renderHook(() => useSupportChannel('acme'))
    expect(result.current.hasChannel).toBe(false)
  })

  it('reports a channel once one has been remembered', () => {
    const { result } = renderHook(() => useSupportChannel('acme'))
    act(() => {
      result.current.remember('C123')
    })
    expect(result.current.hasChannel).toBe(true)
  })

  it('persists across remounts, so the second visit sees the channel', () => {
    const first = renderHook(() => useSupportChannel('acme'))
    act(() => {
      first.result.current.remember('C123')
    })
    first.unmount()

    const second = renderHook(() => useSupportChannel('acme'))
    expect(second.result.current.hasChannel).toBe(true)
  })

  it('scopes to the project, not globally', () => {
    const acme = renderHook(() => useSupportChannel('acme'))
    act(() => {
      acme.result.current.remember('C123')
    })

    const other = renderHook(() => useSupportChannel('globex'))
    expect(other.result.current.hasChannel).toBe(false)
  })

  it('remembers even when the handler returns no channel id', () => {
    // Anonymous support requests post to the feedback channel and come back
    // without a channelId; the person still has somewhere to go next time.
    const { result } = renderHook(() => useSupportChannel('acme'))
    act(() => {
      result.current.remember(undefined)
    })
    expect(result.current.hasChannel).toBe(true)
  })

  it('degrades to first-time copy when storage is unavailable', () => {
    // Private windows and blocked cookies throw here. Showing the
    // "we'll create a channel" copy again is the safe way to be wrong;
    // claiming a channel that may not exist is not.
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })

    const { result } = renderHook(() => useSupportChannel('acme'))
    expect(result.current.hasChannel).toBe(false)

    // Still flips in memory for the rest of the session, and does not throw.
    act(() => {
      result.current.remember('C123')
    })
    expect(result.current.hasChannel).toBe(true)
  })
})
