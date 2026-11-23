import type { SlackConfig } from '@/types'

async function callProxy<T>(
  proxyUrl: string,
  func: string,
  data: Record<string, unknown>
): Promise<T> {
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ func, ...data }),
  })

  if (!response.ok) {
    throw new Error(`Slack proxy error: ${response.status}`)
  }

  return (await response.json()) as T
}

function sendMessage(proxyUrl: string, channelId: string, message: string) {
  return callProxy(proxyUrl, 'send_message', { channel_id: channelId, message })
}

/* ── Public API ──────────────────────────────────────────── */

export async function sendTextFeedback(
  slack: SlackConfig,
  projectName: string,
  params: {
    name: string
    email: string
    message: string
    sectionId: string
    sectionName: string
  }
) {
  const message = [
    `:speech_balloon: *Text Feedback*`,
    `*Project:* ${projectName}`,
    `*Name:* ${params.name}`,
    `*Email:* ${params.email}`,
    `*Section:* ${params.sectionName} (\`${params.sectionId}\`)`,
    `*Message:*\n${params.message}`,
  ].join('\n')

  await sendMessage(slack.proxyUrl, slack.feedbackChannelId, message)
}

export async function sendVoiceFeedback(
  slack: SlackConfig,
  projectName: string,
  params: {
    name: string
    email: string
    sectionId: string
    sectionName: string
    audioBlob: Blob
    note?: string
  }
) {
  const uploadUrl = slack.voiceUploadUrl ?? '/api/mus/voice-upload'

  const formData = new FormData()
  formData.append('audioFile', params.audioBlob, `voice-feedback-${params.sectionId}-${Date.now()}.webm`)
  formData.append('sectionId', params.sectionId)
  formData.append('sectionName', params.sectionName)
  formData.append('name', params.name)
  formData.append('email', params.email)
  formData.append('projectName', projectName)
  formData.append('channelId', slack.feedbackChannelId)
  if (params.note) formData.append('note', params.note)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Voice upload error: ${response.status}`)
  }
}

export async function sendThumbsFeedback(
  slack: SlackConfig,
  projectName: string,
  params: {
    type: 'thumbs-up' | 'thumbs-down'
    sectionId: string
    sectionName: string
    email?: string
  }
) {
  const emoji = params.type === 'thumbs-up' ? ':+1:' : ':-1:'
  const message = [
    `${emoji} *${params.type === 'thumbs-up' ? 'Thumbs Up' : 'Thumbs Down'}*`,
    `*Project:* ${projectName}`,
    `*Section:* ${params.sectionName} (\`${params.sectionId}\`)`,
    params.email ? `*Email:* ${params.email}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  await sendMessage(slack.proxyUrl, slack.feedbackChannelId, message)
}

export async function sendStandaloneFeedback(
  slack: SlackConfig,
  projectName: string,
  params: {
    name: string
    email: string
    audioBlob?: Blob | null
    screenshotDataUrl?: string | null
    note?: string
    uploadUrl?: string
    sectionId?: string
    sectionName?: string
  }
) {
  const url = params.uploadUrl ?? '/api/mus/standalone-upload'

  const formData = new FormData()
  formData.append('name', params.name)
  formData.append('email', params.email)
  formData.append('projectName', projectName)
  formData.append('channelId', slack.feedbackChannelId)
  if (params.note) formData.append('note', params.note)
  if (params.sectionId) formData.append('sectionId', params.sectionId)
  if (params.sectionName) formData.append('sectionName', params.sectionName)

  if (params.audioBlob) {
    formData.append('audioFile', params.audioBlob, `standalone-voice-${Date.now()}.webm`)
  }

  if (params.screenshotDataUrl) {
    // Convert base64 data URL to a Blob for upload
    const res = await fetch(params.screenshotDataUrl)
    const blob = await res.blob()
    const ext = blob.type.includes('jpeg') ? 'jpg' : 'png'
    formData.append('screenshotFile', blob, `screenshot-${Date.now()}.${ext}`)
  }

  const response = await fetch(url, { method: 'POST', body: formData })

  if (!response.ok) {
    throw new Error(`Standalone upload error: ${response.status}`)
  }
}

export async function createSupportChannel(
  slack: SlackConfig,
  projectName: string,
  params: {
    name: string
    email: string
    topic: string
    sectionId: string
    sectionName: string
    projectSlug?: string
  }
): Promise<{ channelId?: string }> {
  const url = slack.supportChannelUrl ?? '/api/mus/support-channel'

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: params.name,
      email: params.email,
      projectName,
      projectSlug: params.projectSlug,
      topic: params.topic,
      sectionId: params.sectionId,
      sectionName: params.sectionName,
      supportTeamEmails: slack.supportTeamEmails,
      feedbackChannelId: slack.feedbackChannelId,
      channelNamePrefix: slack.channelNamePrefix,
    }),
  })

  const body = (await response.json().catch(() => ({}))) as {
    error?: string
    channelId?: string
  }

  if (!response.ok) {
    throw new Error(body.error ?? `Support channel error: ${response.status}`)
  }

  // The handler reports which channel the request landed in. Returning it lets
  // the dialog tell a first request apart from a follow-up, so it can stop
  // promising to create a channel that already exists.
  return { channelId: body.channelId }
}
