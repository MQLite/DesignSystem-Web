import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TextConfig, CanvasLayout, LayerTransform, SubjectCropState, SubjectSlot, TextZone } from '../types'
import { DEFAULT_LAYER } from '../types'
import { slotClipPath } from '../utils/slotUtils'

type LayerKey = keyof CanvasLayout
const TEXT_LAYER_KEYS = ['title', 'subtitle', 'footer'] as const

interface Props {
  backgroundUrl: string | null
  subjectUrl: string | null
  /** Crop pan/zoom state from Step 5 — applied within the slot viewport. */
  subjectCropState?: SubjectCropState | null
  /** Parsed slots from the selected layout — used to position and clip the subject. */
  slots?: SubjectSlot[]
  textConfig: TextConfig
  /** Text zones parsed from the layout — positions each text element on the canvas. */
  textZones?: TextZone[]
  /**
   * Aspect ratio of the layout (widthMm / heightMm).
   * Must match CropEditor and the backend canvas dimensions so pan/zoom is consistent.
   * Defaults to 3/4 when omitted.
   */
  layoutAspectRatio?: number
  layout: CanvasLayout
  /** When provided the canvas becomes interactive (drag / scroll-zoom / rotate) */
  onLayoutChange?: (l: CanvasLayout) => void
  watermark?: string
}

export default function DesignCanvas({
  backgroundUrl, subjectUrl, subjectCropState, slots, textConfig, textZones, layoutAspectRatio, layout, onLayoutChange, watermark,
}: Props) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const layoutRef = useRef(layout)
  layoutRef.current = layout
  const onLayoutChangeRef = useRef(onLayoutChange)
  onLayoutChangeRef.current = onLayoutChange

  const [activeLayer, setActiveLayer] = useState<LayerKey>('subject')
  const activeLayerRef = useRef<LayerKey>('subject')
  activeLayerRef.current = activeLayer

  // Canvas pixel size — needed to convert fraction offsets to px for CSS transforms
  const [canvasSize, setCanvasSize] = useState({ w: 300, h: 400 })
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setCanvasSize({ w: el.offsetWidth, h: el.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const dragRef = useRef({
    active: false,
    layerKey: 'subject' as LayerKey,
    startX: 0, startY: 0, startTx: 0, startTy: 0,
  })
  const interactive = !!onLayoutChange

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const patchLayer = (key: LayerKey, patch: Partial<LayerTransform>) => {
    if (!onLayoutChangeRef.current) return
    onLayoutChangeRef.current({
      ...layoutRef.current,
      [key]: { ...layoutRef.current[key], ...patch },
    })
  }

  const changeScale = (key: LayerKey, delta: number) => {
    const cur = layoutRef.current[key].scale
    patchLayer(key, { scale: Math.max(0.1, Math.min(5, cur + delta)) })
  }

  const changeRotation = (key: LayerKey, delta: number) => {
    let next = layoutRef.current[key].rotation + delta
    while (next > 180) next -= 360
    while (next < -180) next += 360
    patchLayer(key, { rotation: next })
  }

  // Native wheel listener — passive: false required to call preventDefault
  useEffect(() => {
    const el = containerRef.current
    if (!el || !onLayoutChange) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      changeScale(activeLayerRef.current, e.deltaY > 0 ? -0.05 : 0.05)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [onLayoutChange])

  // ─── Drag helpers ─────────────────────────────────────────────────────────

  /** Select a layer and begin dragging it. Call from each element's onMouseDown. */
  const startLayerDrag = (key: LayerKey, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!interactive) return
    setActiveLayer(key)
    activeLayerRef.current = key
    const cur = layoutRef.current[key]
    dragRef.current = { active: true, layerKey: key, startX: e.clientX, startY: e.clientY, startTx: cur.x, startTy: cur.y }
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }

  /** Canvas background click/drag — selects + drags background layer. */
  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return
    e.preventDefault()
    startLayerDrag('background', e)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const d = dragRef.current
    if (!d.active || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    patchLayer(d.layerKey, {
      x: Math.max(-2, Math.min(2, d.startTx + (e.clientX - d.startX) / rect.width)),
      y: Math.max(-2, Math.min(2, d.startTy + (e.clientY - d.startY) / rect.height)),
    })
  }

  const stopDrag = () => {
    dragRef.current.active = false
    if (containerRef.current) containerRef.current.style.cursor = interactive ? 'grab' : ''
  }

  // ─── Layer transform CSS ──────────────────────────────────────────────────

  const { w: cw, h: ch } = canvasSize

  const bgTransform = (l: LayerTransform) =>
    `translate(${l.x * cw}px, ${l.y * ch}px) scale(${l.scale}) rotate(${l.rotation}deg)`

  const subjectTransform = (l: LayerTransform) =>
    `translate(calc(-50% + ${l.x * cw}px), calc(-50% + ${l.y * ch}px)) scale(${l.scale}) rotate(${l.rotation}deg)`

  const textLayerTransform = (l: LayerTransform) =>
    `translate(-50%, -50%) translate(${l.x * cw}px, ${l.y * ch}px) scale(${l.scale}) rotate(${l.rotation}deg)`

  const activeOutline = (key: LayerKey): React.CSSProperties =>
    interactive && activeLayer === key
      ? { outline: '2px dashed rgb(99,102,241)', outlineOffset: '3px', zIndex: 10 }
      : {}

  // Layer keys shown in the toolbar — always include background + subject,
  // then only text layers that exist as zones in the current template.
  const zoneIds = (textZones ?? []).map((z) => z.id)
  const activeLayerKeys: LayerKey[] = [
    'background',
    'subject',
    ...TEXT_LAYER_KEYS.filter((k) => zoneIds.includes(k)),
  ]

  const { background: bg, subject } = layout
  const sel = layout[activeLayer] ?? DEFAULT_LAYER

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-3">
      {/* Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 select-none"
          style={{
            aspectRatio: String(layoutAspectRatio ?? (3 / 4)),
            cursor: interactive ? 'grab' : 'default',
          }}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          {/* Layer 1: Background */}
          <div
            className="absolute inset-0"
            style={activeOutline('background')}
          >
            {backgroundUrl ? (
              <img
                src={backgroundUrl}
                alt="背景"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ transform: bgTransform(bg), transformOrigin: 'center center' }}
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300"
                style={{ transform: bgTransform(bg), transformOrigin: 'center center' }}
              />
            )}
          </div>

          {/* Layer 2: Subject — slot-based when slot info is available */}
          {subjectUrl && (() => {
            const primarySlot = slots?.[0]
            if (primarySlot) {
              // Pan in canvas pixels = offsetFraction × slot pixel size
              const panX = (subjectCropState?.offsetX ?? 0) * primarySlot.w * cw
              const panY = (subjectCropState?.offsetY ?? 0) * primarySlot.h * ch
              const cropScale = subjectCropState?.scale ?? 1.0
              const imgTransform = `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${cropScale})`
              return (
                <div
                  key="subject-slot"
                  className="absolute overflow-hidden pointer-events-auto"
                  style={{
                    left: `${primarySlot.x * 100}%`,
                    top: `${primarySlot.y * 100}%`,
                    width: `${primarySlot.w * 100}%`,
                    height: `${primarySlot.h * 100}%`,
                    cursor: interactive ? 'grab' : 'default',
                    clipPath: slotClipPath(primarySlot),
                    ...activeOutline('subject'),
                  }}
                  onMouseDown={(e) => startLayerDrag('subject', e)}
                >
                  {/* Subject image — min-w/min-h cover with crop pan/zoom */}
                  <img
                    src={subjectUrl}
                    alt="主体"
                    draggable={false}
                    className="pointer-events-none"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      minWidth: '100%',
                      minHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      maxWidth: 'none',
                      opacity: 0.92,
                      transform: imgTransform,
                      transformOrigin: 'center center',
                    }}
                  />
                  {/* Dashed slot boundary */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      border: '2px dashed rgba(255,255,255,0.75)',
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)',
                    }}
                  />
                </div>
              )
            }
            // Fallback: no slot info
            return (
              <div
                key="subject-free"
                className="absolute pointer-events-auto overflow-hidden"
                style={{
                  left: '50%', top: '50%', width: '70%',
                  transform: subjectTransform(subject),
                  transformOrigin: 'center center',
                  ...activeOutline('subject'),
                }}
                onMouseDown={(e) => startLayerDrag('subject', e)}
              >
                <img
                  src={subjectUrl}
                  alt="主体"
                  draggable={false}
                  className="w-full h-auto opacity-90 drop-shadow-lg"
                />
              </div>
            )
          })()}

          {/* Text layers — positioned at zone coordinates from the layout definition */}
          {(textZones ?? []).map((zone) => {
            const text = textConfig[zone.id] ?? ''
            // Use the matching CanvasLayout transform if this zone ID is a known layer key
            const layerKey = (TEXT_LAYER_KEYS as readonly string[]).includes(zone.id)
              ? (zone.id as LayerKey) : null
            const layerTransform: LayerTransform = layerKey ? layout[layerKey] : DEFAULT_LAYER
            const isDraggable = interactive && layerKey !== null
            if (!text && !interactive) return null
            return (
              <div
                key={zone.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${(zone.x + zone.w / 2) * 100}%`,
                  top: `${(zone.y + zone.h / 2) * 100}%`,
                  width: `${zone.w * 100}%`,
                  transform: textLayerTransform(layerTransform),
                  transformOrigin: 'center center',
                  cursor: isDraggable ? 'move' : 'default',
                  ...(layerKey ? activeOutline(layerKey) : {}),
                }}
                onMouseDown={isDraggable ? (e) => startLayerDrag(layerKey!, e) : undefined}
              >
                {text ? (
                  <p
                    className={`text-white text-center leading-tight ${
                      zone.id === 'title' ? 'font-bold text-lg whitespace-nowrap' :
                      zone.id === 'footer' ? 'text-xs opacity-80' : 'text-sm whitespace-nowrap'
                    }`}
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
                  >
                    {text}
                  </p>
                ) : (
                  <p
                    className="text-white/25 text-sm text-center italic"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                  >
                    {zone.id}…
                  </p>
                )}
              </div>
            )
          })}

          {/* Watermark */}
          {watermark && (
            <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded pointer-events-none z-20">
              {watermark}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-2">{t('step7.previewNote')}</p>
      </div>

      {/* Sidebar toolbar */}
      {interactive && (
        <div className="w-[88px] shrink-0 flex flex-col gap-2">

          {/* Layer selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-2 flex flex-col gap-0.5">
            <p className="text-gray-400 text-[10px] font-semibold text-center uppercase tracking-wide mb-1">
              {t('canvas.layers')}
            </p>
            {activeLayerKeys.map((key) => (
              <button
                key={key}
                onClick={() => setActiveLayer(key)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                  activeLayer === key
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t(`canvas.layer.${key}`)}
              </button>
            ))}
          </div>

          {/* Scale */}
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <p className="text-gray-400 text-[10px] font-semibold text-center uppercase tracking-wide mb-2">
              {t('canvas.scale')}
            </p>
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={() => changeScale(activeLayer, -0.1)}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center leading-none"
              >−</button>
              <span className="text-gray-700 text-[11px] font-mono">{Math.round(sel.scale * 100)}%</span>
              <button
                onClick={() => changeScale(activeLayer, 0.1)}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center leading-none"
              >+</button>
            </div>
          </div>

          {/* Rotation */}
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <p className="text-gray-400 text-[10px] font-semibold text-center uppercase tracking-wide mb-2">
              {t('canvas.rotation')}
            </p>
            <div className="flex items-center justify-between gap-1 mb-2">
              <button
                onClick={() => changeRotation(activeLayer, -15)}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 text-base flex items-center justify-center"
                title="-15°"
              >↺</button>
              <span className="text-gray-700 text-[11px] font-mono">{Math.round(sel.rotation)}°</span>
              <button
                onClick={() => changeRotation(activeLayer, 15)}
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 text-base flex items-center justify-center"
                title="+15°"
              >↻</button>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={sel.rotation}
              onChange={(e) => patchLayer(activeLayer, { rotation: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Reset active layer */}
          <button
            onClick={() => patchLayer(activeLayer, { x: 0, y: 0, scale: 1.0, rotation: 0 })}
            className="w-full py-1.5 text-[11px] text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 bg-white rounded-xl transition-colors"
          >
            {t('canvas.reset')}
          </button>
        </div>
      )}
    </div>
  )
}
