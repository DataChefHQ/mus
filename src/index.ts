/* ── Components ───────────────────────────────────────────── */
export { FeedbackTarget } from './components/FeedbackTarget'
export type { FeedbackTargetHandle } from './components/FeedbackTarget'
export { FeedbackToolbar } from './components/FeedbackToolbar'
export { FeedbackTrigger } from './components/FeedbackTrigger'
export { SupportDialog } from './components/dialogs/SupportDialog'
export { FeedbackDialog } from './components/dialogs/FeedbackDialog'
export { VideoDialog } from './components/dialogs/VideoDialog'
export { DialogShell } from './components/dialogs/DialogShell'
export { WelcomeDialog } from './components/dialogs/WelcomeDialog'
export { StandaloneWidget } from './components/StandaloneWidget'
export { StandaloneFeedbackDialog } from './components/dialogs/StandaloneFeedbackDialog'

/* ── Context / Provider ──────────────────────────────────── */
export { MusProvider, useMusConfig } from './context/MusContext'

/* ── Hooks ───────────────────────────────────────────────── */
export { useFeedbackActions } from './hooks/useFeedbackActions'
export { useMusUser } from './hooks/useMusUser'
export { useThumbsStore } from './hooks/useThumbsStore'
export { useSupportChannel } from './hooks/useSupportChannel'
export type { SupportChannelState } from './hooks/useSupportChannel'

/* ── Demo mode (for playground / docs site embeds) ────────── */
export { onDemoFeedback } from './lib/demo-mode'
export type { DemoEvent, DemoEventType } from './lib/demo-mode'

/* ── Types ───────────────────────────────────────────────── */
export type {
  MusConfig,
  MusUser,
  MusIcons,
  SlackConfig,
  StandaloneConfig,
  FeedbackAction,
  FeedbackActionType,
  UserResolver,
  TriggerPosition,
} from './types'

/* ── Styles (imported separately: import '@datachef/mus/styles.css') ── */
import './styles/index.css'
