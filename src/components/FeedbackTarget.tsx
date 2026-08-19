import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Youtube } from 'lucide-react'
import { useMusConfig } from '@/context/MusContext'
import { useFeedbackActions } from '@/hooks/useFeedbackActions'
import { FeedbackTrigger } from '@/components/FeedbackTrigger'
import { FeedbackToolbar } from '@/components/FeedbackToolbar'
import { SupportDialog } from '@/components/dialogs/SupportDialog'
import { FeedbackDialog } from '@/components/dialogs/FeedbackDialog'
import { VideoDialog } from '@/components/dialogs/VideoDialog'
import { StandaloneFeedbackDialog } from '@/components/dialogs/StandaloneFeedbackDialog'
import { MusThemeRoot } from '@/components/MusThemeRoot'
import type { FeedbackAction, FeedbackActionType } from '@/types'

export interface FeedbackTargetHandle {
  reset(): void
  /**
   * Programmatically reveal the trigger (and optionally open its toolbar)
   * without a hover — used to script guided tours, demos and tests.
   */
  reveal(options?: { openToolbar?: boolean }): void
}

interface FeedbackTargetProps {
  /** Unique ID for this section — used in API payloads */
  sectionId: string
  /** Human-readable section name */
  sectionName: string
  children: ReactNode
  className?: string
  /** Video URL for this section (used by the video overview dialog) */
  videoUrl?: string
  /** Override global actions for this section */
  actions?: FeedbackAction[]
  /** When true, trigger sits inside the container instead of straddling its edge */
  inset?: boolean
}

export const FeedbackTarget = forwardRef<FeedbackTargetHandle, FeedbackTargetProps>(function FeedbackTarget({
  sectionId,
  sectionName,
  children,
  className,
  videoUrl,
  actions,
  inset = false,
}, ref) {
  const config = useMusConfig()
  const { handleAction, activeThumb } = useFeedbackActions(sectionId, sectionName)
  const resolvedActions = actions ?? config.actions

  const [showTrigger, setShowTrigger] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const [activeDialog, setActiveDialog] = useState<FeedbackActionType | null>(null)

  // Standalone mode state
  const [capturing, setCapturing] = useState(false)
  const [standaloneOpen, setStandaloneOpen] = useState(false)
  const [standaloneScreenshot, setStandaloneScreenshot] = useState<string | null>(null)

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const hoverDelay = config.hoverDelay ?? 500

  const handleMouseEnter = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setShowTrigger(true)
    }, hoverDelay)
  }, [hoverDelay])

  useImperativeHandle(ref, () => ({
    reset() {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
      if (!showToolbar && !activeDialog && !standaloneOpen && !capturing) {
        setShowTrigger(false)
      }
    },
    reveal(options) {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
      setShowTrigger(true)
      if (options?.openToolbar && config.mode !== 'standalone') setShowToolbar(true)
    },
  }), [showToolbar, activeDialog, standaloneOpen, capturing, config.mode])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // If moving to a descendant (e.g. trigger button positioned outside card bounds), keep visible
    if (e.relatedTarget instanceof Node && containerRef.current?.contains(e.relatedTarget)) return

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    if (!showToolbar && !activeDialog && !standaloneOpen && !capturing) {
      setShowTrigger(false)
    }
  }, [showToolbar, activeDialog, standaloneOpen, capturing])

  const handleTriggerClick = useCallback(async () => {
    if (config.mode === 'standalone') {
      if (capturing) return
      setCapturing(true)
      try {
        let dataUrl: string | null = null
        if (config.standalone?.onCaptureScreenshot) {
          // Wait one frame so the trigger turns invisible before the screenshot
          await new Promise<void>((r) => requestAnimationFrame(() => { requestAnimationFrame(() => r()) }))
          const result = await config.standalone.onCaptureScreenshot()
          if (typeof result === 'string') {
            dataUrl = result
          } else {
            dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(result)
            })
          }
        }
        setStandaloneScreenshot(dataUrl)
        setStandaloneOpen(true)
      } finally {
        setCapturing(false)
      }
      return
    }
    setShowToolbar((prev) => !prev)
  }, [config.mode, config.standalone, capturing])

  const handleActionClick = useCallback(
    (type: FeedbackActionType) => {
      const result = handleAction(type)
      if (result === 'dialog') {
        setActiveDialog(type)
        setShowToolbar(false)
      }
    },
    [handleAction]
  )

  const handleDialogClose = useCallback(() => {
    setActiveDialog(null)
    setShowTrigger(false)
    setShowToolbar(false)
  }, [])

  const handleStandaloneClose = useCallback(() => {
    setStandaloneOpen(false)
    setStandaloneScreenshot(null)
    setShowTrigger(false)
  }, [])

  // Close toolbar when clicking outside
  useEffect(() => {
    if (!showToolbar) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowToolbar(false)
        setShowTrigger(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showToolbar])

  // Close on ESC
  useEffect(() => {
    if (!showToolbar && !activeDialog && !standaloneOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowToolbar(false)
        setActiveDialog(null)
        setStandaloneOpen(false)
        setStandaloneScreenshot(null)
        setShowTrigger(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [showToolbar, activeDialog, standaloneOpen])

  const position = config.triggerPosition ?? 'top-right'

  // Straddling: trigger half-outside the container edge (default for card-level targets)
  const positionClasses: Record<string, string> = {
    'top-left': '-top-[18px] -left-[18px]',
    'top-right': '-top-[18px] -right-[18px]',
    'bottom-left': '-bottom-[18px] -left-[18px]',
    'bottom-right': '-bottom-[18px] -right-[18px]',
  }

  // Inset: trigger fully inside the container — use inline styles to avoid Tailwind
  // scan issues (node_modules classes may not be compiled in the consuming app)
  const insetStyle: React.CSSProperties | undefined = inset
    ? {
        top: position.includes('top') ? '8px' : undefined,
        bottom: position.includes('bottom') ? '8px' : undefined,
        left: position.includes('left') ? '8px' : undefined,
        right: position.includes('right') ? '8px' : undefined,
      }
    : undefined

  // Toolbar expands in the opposite direction of the trigger's corner
  const toolbarDirection = position.includes('right') ? 'flex-row-reverse' : 'flex-row'

  // Align video button to the same side as the trigger
  const columnAlign = position.includes('right') ? 'items-end' : 'items-start'

  // Transform origin for grow animation — grows from the trigger's corner
  const growOrigin: Record<string, string> = {
    'top-left': 'top left',
    'top-right': 'top right',
    'bottom-left': 'bottom left',
    'bottom-right': 'bottom right',
  }

  // Check if video action is enabled
  const hasVideo = resolvedActions.some(
    (a) => a.type === 'video' && a.enabled !== false
  )

  if (config.enabled === false) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* All mus UI lives in a shadow root — fully isolated from host-app styles */}
      <MusThemeRoot>
        {/* Trigger + toolbar overlay — invisible during screenshot capture */}
        {showTrigger && (
          <div
            className={cn(
              'absolute z-40 flex flex-col gap-3',
              !inset && positionClasses[position],
              columnAlign,
              capturing && 'invisible'
            )}
            style={insetStyle}
          >
            {/* Row 1: Toolbar actions + Trigger */}
            <div className={cn('flex items-center gap-3', toolbarDirection)}>
              <FeedbackTrigger
                onClick={handleTriggerClick}
                isActive={showToolbar}
                loading={capturing}
                style={{ transformOrigin: growOrigin[position] }}
                icon={config.icons?.trigger}
              />

              {showToolbar && config.mode !== 'standalone' && (
                <FeedbackToolbar
                  actions={resolvedActions}
                  onAction={handleActionClick}
                  growOrigin={position.includes('right') ? 'right center' : 'left center'}
                  activeThumb={activeThumb}
                />
              )}
            </div>

            {/* Row 2: Video button (default mode only) */}
            {hasVideo && config.mode !== 'standalone' && (
              <button
                onClick={() => handleActionClick('video')}
                className={cn(
                  'flex size-9 items-center justify-center rounded-[12px]',
                  'bg-mus-accent-foreground text-mus-secondary-foreground',
                  'shadow-[0_3px_3px_0_rgba(0,0,0,0.12)]',
                  'hover:opacity-80 transition-opacity',
                  'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(115,115,115,0.5)]',
                  'mus-grow'
                )}
                aria-label="Introduction video"
                title="Introduction video"
              >
                <Youtube className="size-4 pointer-events-none" />
              </button>
            )}
          </div>
        )}

        {/* Dialogs — default mode */}
        {activeDialog === 'support' && (
          <SupportDialog
            sectionId={sectionId}
            sectionName={sectionName}
            onClose={handleDialogClose}
          />
        )}
        {activeDialog === 'voice' && (
          <FeedbackDialog
            sectionId={sectionId}
            sectionName={sectionName}
            onClose={handleDialogClose}
          />
        )}
        {activeDialog === 'video' && (
          <VideoDialog
            sectionId={sectionId}
            sectionName={sectionName}
            onClose={handleDialogClose}
            videoUrl={videoUrl}
          />
        )}

        {/* Dialog — standalone mode */}
        {standaloneOpen && (
          <StandaloneFeedbackDialog
            sectionId={sectionId}
            sectionName={sectionName}
            screenshot={standaloneScreenshot}
            onClose={handleStandaloneClose}
          />
        )}
      </MusThemeRoot>
    </div>
  )
})
