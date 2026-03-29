import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ZoomControlProps } from '@/ui/patterns'

const DEFAULT_ZOOM = 1
const DEFAULT_MIN = 0.25
const DEFAULT_MAX = 3
const DEFAULT_STEP = 0.25

export type UseCanvasZoomOptions = {
  defaultZoom?: number
  min?: number
  max?: number
  step?: number
}

export type UseCanvasZoomReturn = {
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  zoomIn: () => void
  zoomOut: () => void
  /** Reset zoom to default. Also invokes the registered `resetPan` callback. */
  zoomReset: () => void
  canZoomIn: boolean
  canZoomOut: boolean
  /** Spread onto `<ZoomControl />`. */
  zoomControlProps: ZoomControlProps
  /**
   * Callback ref -- attach to the container element that should respond to
   * Ctrl/Cmd + scroll-wheel and trackpad pinch-to-zoom gestures.
   * Uses a non-passive native listener so `preventDefault` works.
   */
  wheelContainerRef: (node: HTMLElement | null) => void
  /** Register a pan-reset callback invoked by `zoomReset`. */
  bindResetPan: (resetPan: () => void) => void
}

export function useCanvasZoom(options?: UseCanvasZoomOptions): UseCanvasZoomReturn {
  const {
    defaultZoom = DEFAULT_ZOOM,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    step = DEFAULT_STEP,
  } = options ?? {}

  const [zoom, setZoom] = useState(defaultZoom)
  const resetPanRef = useRef<(() => void) | null>(null)

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(z + step, max)),
    [step, max],
  )

  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(z - step, min)),
    [step, min],
  )

  const zoomReset = useCallback(() => {
    setZoom(defaultZoom)
    resetPanRef.current?.()
  }, [defaultZoom])

  const bindResetPan = useCallback((fn: () => void) => {
    resetPanRef.current = fn
  }, [])

  // --- Non-passive wheel listener for Ctrl/Cmd + scroll / trackpad pinch ---
  const [wheelContainer, setWheelContainer] = useState<HTMLElement | null>(null)

  const wheelContainerRef = useCallback((node: HTMLElement | null) => {
    setWheelContainer(node)
  }, [])

  useEffect(() => {
    if (!wheelContainer) return
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setZoom((z) => {
        // Scale proportionally for smooth trackpad pinch, capped at ±step for mouse wheel
        const delta = -e.deltaY * 0.01
        const clamped = Math.max(-step, Math.min(step, delta))
        return Math.min(Math.max(z + clamped, min), max)
      })
    }
    wheelContainer.addEventListener('wheel', handler, { passive: false })
    return () => wheelContainer.removeEventListener('wheel', handler)
  }, [wheelContainer, step, min, max])

  const zoomControlProps: ZoomControlProps = useMemo(
    () => ({
      zoom,
      min,
      max,
      step,
      onZoomIn: zoomIn,
      onZoomOut: zoomOut,
      onReset: zoomReset,
    }),
    [zoom, min, max, step, zoomIn, zoomOut, zoomReset],
  )

  return {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    zoomReset,
    canZoomIn: zoom < max,
    canZoomOut: zoom > min,
    zoomControlProps,
    wheelContainerRef,
    bindResetPan,
  }
}
