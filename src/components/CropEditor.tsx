import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SubjectSlot, SubjectCropState, BgCrop } from '../types'
import { slotClipPath } from '../utils/slotUtils'

interface Props {
  /** URL of the selected background image (shown as canvas context). */
  backgroundImageUrl: string | null
  /** widthMm / heightMm of the layout — sets the outer canvas aspect ratio. */
  backgroundAspectRatio: number
  /** Admin-defined background crop to display background correctly. */
  bgCrop?: BgCrop | null
  /** URL of the uploaded subject photo. */
  imageUrl: string
  slot: SubjectSlot
  value: SubjectCropState
  onChange: (s: SubjectCropState) => void
}

/**
 * Crop/pan/zoom editor that shows the full background as context.
 *
 * Layout:
 *   - Outer container: background aspect ratio, shows the background image.
 *   - Slot div: positioned at slot.x/y/w/h (% of outer), overflow hidden → crop viewport.
 *   - Subject image inside slot div: min-w/min-h cover, centred, with pan+zoom transform.
 *
 * Transform on subject img:
 *   translate(-50%, -50%) translate(panX px, panY px) scale(scale)
 *   panX/panY are in slot-div pixels (offsetX/Y × slotPx.w/h).
 */
export default function CropEditor({
  backgroundImageUrl,
  backgroundAspectRatio,
  bgCrop,
  imageUrl,
  slot,
  value,
  onChange,
}: Props) {
  const { t } = useTranslation()

  // Guard against NaN (e.g. widthMm/heightMm not yet in API response) — fall back to slot shape
  const canvasAspectRatio =
    isFinite(backgroundAspectRatio) && backgroundAspectRatio > 0
      ? backgroundAspectRatio
      : slot.w / slot.h

  const slotRef = useRef<HTMLDivElement>(null)
  const [slotPx, setSlotPx] = useState({ w: 0, h: 0 })
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startOx: 0, startOy: 0 })

  // Track slot pixel size for accurate pan computation
  useEffect(() => {
    const el = slotRef.current
    if (!el) return
    const ro = new ResizeObserver(() =>
      setSlotPx({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    setSlotPx({ w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  const patch = (p: Partial<SubjectCropState>) =>
    onChange({ ...value, ...p })

  const changeScale = (delta: number) =>
    patch({ scale: Math.max(0.1, Math.min(4.0, value.scale + delta)) })

  const setScale = (s: number) =>
    patch({ scale: Math.max(0.1, Math.min(4.0, s)) })

  // ── Drag ──────────────────────────────────────────────────────────────────

  const onMouseDown = (e: React.MouseEvent) => {
    if (!slot.allowUserMove) return
    e.preventDefault()
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOx: value.offsetX,
      startOy: value.offsetY,
    }
    if (slotRef.current) slotRef.current.style.cursor = 'grabbing'
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const d = dragRef.current
    if (!d.active || !slotRef.current) return
    const rect = slotRef.current.getBoundingClientRect()
    patch({
      offsetX: Math.max(-0.5, Math.min(0.5, d.startOx + (e.clientX - d.startX) / rect.width)),
      offsetY: Math.max(-0.5, Math.min(0.5, d.startOy + (e.clientY - d.startY) / rect.height)),
    })
  }

  const stopDrag = () => {
    dragRef.current.active = false
    if (slotRef.current) slotRef.current.style.cursor = slot.allowUserMove ? 'grab' : 'default'
  }

  // Wheel zoom intentionally removed — it conflicted with page scrolling,
  // causing accidental scale-down when the user scrolled over the crop area.
  // Use the +/− buttons below for explicit zoom control.

  // ── Subject image transform ───────────────────────────────────────────────
  const panX = value.offsetX * slotPx.w
  const panY = value.offsetY * slotPx.h
  const imgTransform = `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${value.scale})`

  return (
    <div>
      {/* Outer canvas — background aspect ratio */}
      <div
        className="relative w-full overflow-hidden rounded-lg select-none"
        style={{ aspectRatio: String(canvasAspectRatio) }}
      >
        {/* Background image — apply admin bgCrop transform */}
        {backgroundImageUrl ? (
          <img
            src={backgroundImageUrl}
            alt="background"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={bgCrop ? {
              transform: `translate(${bgCrop.offsetX * 100}%, ${bgCrop.offsetY * 100}%) scale(${bgCrop.scale})`,
              transformOrigin: 'center center',
            } : undefined}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100" />
        )}

        {/* Slot viewport — crop boundary */}
        {(() => {
          const slotShape = slot.shape ?? 'rect'
          const isEllipse = slotShape === 'ellipse'
          return (
            <div
              ref={slotRef}
              className="absolute overflow-hidden"
              style={{
                left: `${slot.x * 100}%`,
                top: `${slot.y * 100}%`,
                width: `${slot.w * 100}%`,
                height: `${slot.h * 100}%`,
                cursor: slot.allowUserMove ? 'grab' : 'default',
                // ellipse: border-radius + overflow-hidden clips the image correctly
                // polygon/rect: use clip-path
                borderRadius: isEllipse ? '50%' : undefined,
                clipPath: !isEllipse ? slotClipPath(slot) : undefined,
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
            >
              {/* Subject image — max-w/max-h contain: full cutout visible at scale=1, transparent edges */}
              <img
                src={imageUrl}
                alt="subject"
                draggable={false}
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  transform: imgTransform,
                  transformOrigin: 'center center',
                }}
              />

              {/* Crop boundary: dashed border — ellipse uses border-radius for smooth outline */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  border: '2px dashed rgba(255,255,255,0.85)',
                  boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.25)',
                  borderRadius: isEllipse ? '50%' : undefined,
                }}
              />

              {/* Rule-of-thirds grid (rect only — doesn't add value in ellipse) */}
              {!isEllipse && (
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.3 }}>
                  <div className="absolute top-0 bottom-0 border-l border-white" style={{ left: '33.33%' }} />
                  <div className="absolute top-0 bottom-0 border-l border-white" style={{ left: '66.66%' }} />
                  <div className="absolute left-0 right-0 border-t border-white" style={{ top: '33.33%' }} />
                  <div className="absolute left-0 right-0 border-t border-white" style={{ top: '66.66%' }} />
                </div>
              )}

              {/* Corner accent marks (rect only) */}
              {!isEllipse && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl" />
                  <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr" />
                  <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl" />
                  <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-white rounded-br" />
                </div>
              )}
            </div>
          )
        })()}

      </div>

      {/* Controls row */}
      {slot.allowUserScale && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => changeScale(-0.1)}
            className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center leading-none flex-shrink-0"
          >−</button>
          <input
            type="range"
            min={0.1}
            max={4.0}
            step={0.05}
            value={value.scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
          <button
            onClick={() => changeScale(0.1)}
            className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center leading-none flex-shrink-0"
          >+</button>
          <span className="text-gray-700 text-xs font-mono w-10 text-center flex-shrink-0">
            {Math.round(value.scale * 100)}%
          </span>
          <button
            onClick={() => onChange({ slotId: value.slotId, offsetX: 0, offsetY: 0, scale: 1.0 })}
            className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors flex-shrink-0"
          >
            {t('canvas.reset')}
          </button>
        </div>
      )}
    </div>
  )
}
