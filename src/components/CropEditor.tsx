import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { SubjectCropFrame, SubjectCropState } from '../types'

interface Props {
  imageUrl: string
  cropFrame: SubjectCropFrame
  value: SubjectCropState
  onChange: (s: SubjectCropState) => void
}

/**
 * Interactive crop/pan/zoom editor for the subject photo.
 * The viewport's aspect ratio is derived from cropFrame.aspectRatio (or w/h as fallback).
 * offsetX/offsetY are fractions of the viewport size (0 = centered).
 * scale is a multiplier over the natural "cover" fit.
 */
export default function CropEditor({ imageUrl, cropFrame, value, onChange }: Props) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startOx: 0, startOy: 0 })

  // Keep stable refs so the wheel handler never goes stale
  const valueRef = useRef(value)
  valueRef.current = value
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const aspectRatio = cropFrame.aspectRatio ?? (cropFrame.w / cropFrame.h)

  const patch = (p: Partial<SubjectCropState>) =>
    onChange({ ...value, ...p })

  const changeScale = (delta: number) =>
    patch({ scale: Math.max(0.5, Math.min(3.0, value.scale + delta)) })

  // ── Drag ─────────────────────────────────────────────────────────────────

  const onMouseDown = (e: React.MouseEvent) => {
    if (!cropFrame.allowUserMove) return
    e.preventDefault()
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOx: value.offsetX,
      startOy: value.offsetY,
    }
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const d = dragRef.current
    if (!d.active || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    patch({
      offsetX: Math.max(-0.5, Math.min(0.5, d.startOx + (e.clientX - d.startX) / rect.width)),
      offsetY: Math.max(-0.5, Math.min(0.5, d.startOy + (e.clientY - d.startY) / rect.height)),
    })
  }

  const stopDrag = () => {
    dragRef.current.active = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }

  // ── Wheel zoom (passive: false required to call preventDefault) ───────────

  useEffect(() => {
    const el = containerRef.current
    if (!el || !cropFrame.allowUserScale) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const cur = valueRef.current
      onChangeRef.current({
        ...cur,
        scale: Math.max(0.5, Math.min(3.0, cur.scale + (e.deltaY > 0 ? -0.05 : 0.05))),
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [cropFrame.allowUserScale])

  // ── Image transform: pan then scale, both from viewport center ───────────

  const imgTransform =
    `translate(${value.offsetX * 100}%, ${value.offsetY * 100}%) scale(${value.scale})`

  return (
    <div>
      {/* Viewport: clips the image to the crop frame's aspect ratio */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border-2 border-indigo-400 select-none"
        style={{ aspectRatio: String(aspectRatio), cursor: 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <img
          src={imageUrl}
          alt="crop preview"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ transform: imgTransform, transformOrigin: 'center center' }}
        />
        {/* Corner crop guides */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-white/80 rounded-tl-sm" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-white/80 rounded-tr-sm" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-white/80 rounded-bl-sm" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-white/80 rounded-br-sm" />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 mt-2">
        {cropFrame.allowUserScale && (
          <>
            <button
              onClick={() => changeScale(-0.1)}
              className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center leading-none"
            >−</button>
            <span className="text-gray-700 text-xs font-mono w-10 text-center">
              {Math.round(value.scale * 100)}%
            </span>
            <button
              onClick={() => changeScale(0.1)}
              className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center leading-none"
            >+</button>
          </>
        )}
        <span className="text-gray-400 text-xs flex-1">{t('step5.cropHint')}</span>
        <button
          onClick={() =>
            onChange({ cropFrameId: value.cropFrameId, offsetX: 0, offsetY: 0, scale: 1.0 })
          }
          className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
        >
          {t('canvas.reset')}
        </button>
      </div>
    </div>
  )
}
