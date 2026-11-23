import { useState } from 'react'
import { useMusConfig } from '@/context/MusContext'
import { useMusUser } from '@/hooks/useMusUser'
import { useSupportChannel } from '@/hooks/useSupportChannel'
import { createSupportChannel } from '@/lib/slack-client'
import { simulateFeedback } from '@/lib/demo-mode'
import { cn } from '@/lib/utils'
import { DialogShell } from './DialogShell'

interface SupportDialogProps {
  sectionId: string
  sectionName: string
  onClose: () => void
}

export function SupportDialog({
  sectionId,
  sectionName,
  onClose,
}: SupportDialogProps) {
  const config = useMusConfig()
  const { name, email } = useMusUser()
  const { hasChannel, remember } = useSupportChannel(
    config.projectSlug ?? config.projectName
  )

  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = message.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)

    try {
      let channelId: string | undefined

      if (config.demoMode) {
        await simulateFeedback('support', {
          projectName: config.projectName,
          name,
          email,
          topic: message.trim(),
          sectionId,
          sectionName,
          projectSlug: config.projectSlug,
        })
      } else {
        const result = await createSupportChannel(config.slack, config.projectName, {
          name,
          email,
          topic: message.trim(),
          sectionId,
          sectionName,
          projectSlug: config.projectSlug,
        })
        channelId = result.channelId
      }

      // From here on this person has a channel, so the next visit explains
      // where they are going rather than offering to create one.
      remember(channelId)

      config.onFeedbackSubmitted?.('support', sectionId, sectionName)
      onClose()
    } catch {
      // TODO: error handling
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogShell
      title={hasChannel ? 'Back to your Slack channel' : 'Get Support'}
      description={
        hasChannel
          ? // The channel already exists — saying it will be created is simply
            // untrue on every visit after the first, and undersells what is
            // actually on offer: a direct line to the people who built this.
            'Your Slack channel is already open. Send this and it lands straight with the engineers who built this — no queue, no ticket.'
          : "Need help? We'll open a private Slack channel and bring in the engineers who built this, so you can talk to them directly."
      }
      onClose={onClose}
    >
      <div className="flex w-full flex-col gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            hasChannel ? 'What would you like to ask them?' : 'What do you need help with?'
          }
          rows={5}
          className={cn(
            'w-full resize-none rounded-mus-md border border-mus-input bg-white/5 px-[12px] py-[10px]',
            'text-[14px] leading-[20px] text-mus-foreground',
            'placeholder:text-mus-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-mus-ring'
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={cn(
            'flex h-[40px] w-full items-center justify-center rounded-mus-md bg-mus-primary px-4',
            'text-[14px] font-medium text-mus-primary-foreground',
            'hover:opacity-90 transition-opacity',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {submitting
            ? hasChannel
              ? 'Sending…'
              : 'Opening channel…'
            : hasChannel
              ? 'Send to your Slack channel'
              : 'Start chat with support'}
        </button>
      </div>
    </DialogShell>
  )
}
