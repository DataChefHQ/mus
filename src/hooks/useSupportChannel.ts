import { useCallback, useState } from 'react'

/**
 * Remembers whether this person has already opened a support channel for a
 * given project.
 *
 * Support channels are deterministic — one private channel per user per
 * project, found-or-created by name — so the *first* request is the only one
 * that creates anything. Every later request lands in the channel that is
 * already open. The dialog uses this to stop promising to create a channel
 * that exists, and to say what is actually about to happen instead.
 *
 * Scoped to the project rather than the section, because the channel is: a
 * user who asked for help on one section is already in the channel when they
 * ask about another.
 *
 * Mirrors the storage approach in useThumbsStore — per browser, never fatal
 * when storage is unavailable (private windows, blocked cookies), in which
 * case the dialog simply shows first-time copy every time. That is the right
 * way to be wrong: over-explaining beats promising something untrue.
 */

const STORAGE_PREFIX = 'mus-support-'

function key(projectSlug: string) {
  return `${STORAGE_PREFIX}${projectSlug || 'default'}`
}

function readStored(projectSlug: string): boolean {
  try {
    return localStorage.getItem(key(projectSlug)) !== null
  } catch {
    return false
  }
}

export interface SupportChannelState {
  /** True once a support request for this project has succeeded in this browser. */
  hasChannel: boolean
  /** Record that a channel now exists. Safe to call with no channel id. */
  remember: (channelId?: string) => void
}

export function useSupportChannel(projectSlug: string): SupportChannelState {
  const [hasChannel, setHasChannel] = useState(() => readStored(projectSlug))

  const remember = useCallback(
    (channelId?: string) => {
      try {
        localStorage.setItem(key(projectSlug), channelId ?? '1')
      } catch {
        // Storage unavailable — the in-memory flag still covers this session.
      }
      setHasChannel(true)
    },
    [projectSlug]
  )

  return { hasChannel, remember }
}
