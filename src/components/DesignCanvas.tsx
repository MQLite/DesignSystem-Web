import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TextConfig, CanvasLayout, LayerTransform, SubjectCropState, SubjectSlot, TextZone, TextZoneStyle } from '../types'
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
  /** Per-zone typography overrides from Step 6 — merged with zone defaults at render time. */
  textStyleOverrides?: Record<string, TextZoneStyle>
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
  backgroundUrl, subjectUrl, subjectCropState, slots, textConfig, textZones, textStyleOverrides, layoutAspectRatio, layout, onLayoutChange, watermark,
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

  // Slot pixel size — measured directly on the slot div to match CropEditor's pan formula
  const slotRef = useRef<HTMLDivElement>(null)
  const [slotPx, setSlotPx] = useState({ w: 0, h: 0 })

  // Ref for background img — used to read naturalWidth/naturalHeight for debug logging
  const bgImgRef = useRef<HTMLImageElement>(null)
  // Ref for subject img — used to read naturalWidth/naturalHeight for debug logging
  const subjectImgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const el = slotRef.current
    if (!el) return
    const update = () => setSlotPx({ w: el.offsetWidth, h: el.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [slots, subjectUrl])

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
    `translate(${l.x * 100}%, ${l.y * 100}%) scale(${l.scale}) rotate(${l.rotation}deg)`

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
                ref={bgImgRef}
                src={backgroundUrl}
                alt="背景"
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ transform: bgTransform(bg), transformOrigin: 'center center' }}
                onLoad={() => {
                  const img = bgImgRef.current
                  if (!img) return
                  const naturalW = img.naturalWidth
                  const naturalH = img.naturalHeight
                  // object-contain: scale that fits the image within (cw × ch)
                  const containScale = Math.min(cw / naturalW, ch / naturalH)
                  const renderedW = Math.round(naturalW * containScale)
                  const renderedH = Math.round(naturalH * containScale)
                  // translate(bg.x*100%, bg.y*100%) scale(bg.scale) — applied on top of object-contain
                  console.log(
                    `[DesignCanvas] Background placed — canvas(${Math.round(cw)}×${Math.round(ch)}) src(${naturalW}×${naturalH}) ` +
                    `containScale=${containScale.toFixed(3)} bgScale=${bg.scale.toFixed(3)} effectiveScale=${(containScale * bg.scale).toFixed(3)} ` +
                    `rendered=(${renderedW}×${renderedH}) offset=(${bg.x.toFixed(3)},${bg.y.toFixed(3)})`
                  )
                }}
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
              // Pan in slot pixels — use measured slotPx (same approach as CropEditor) with computed fallback
              const slotW = slotPx.w || primarySlot.w * cw
              const slotH = slotPx.h || primarySlot.h * ch
              const panX = (subjectCropState?.offsetX ?? 0) * slotW
              const panY = (subjectCropState?.offsetY ?? 0) * slotH
              const cropScale = subjectCropState?.scale ?? 1.0
              const imgTransform = `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${cropScale})`
              return (
                <div
                  ref={slotRef}
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
                  {/* Subject image — max-w/max-h contain: full cutout visible at scale=1, transparent edges */}
                  <img
                    ref={subjectImgRef}
                    src={subjectUrl}
                    alt="主体"
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
                      opacity: 0.92,
                      transform: imgTransform,
                      transformOrigin: 'center center',
                    }}
                    onLoad={() => {
                      const img = subjectImgRef.current
                      if (!img) return
                      const naturalW = img.naturalWidth
                      const naturalH = img.naturalHeight
                      const containScale = Math.min(slotW / naturalW, slotH / naturalH)
                      const userScale = subjectCropState?.scale ?? 1.0
                      const finalScale = containScale * userScale
                      const scaledW = Math.round(naturalW * finalScale)
                      const scaledH = Math.round(naturalH * finalScale)
                      const imgLeft = Math.round((slotW - scaledW) / 2 + panX)
                      const imgTop  = Math.round((slotH - scaledH) / 2 + panY)
                      console.log(
                        `[DesignCanvas] Subject placed — slot(${Math.round(primarySlot.x * cw)},${Math.round(primarySlot.y * ch)},${Math.round(slotW)},${Math.round(slotH)}) ` +
                        `src(${naturalW}×${naturalH}) ` +
                        `containScale=${containScale.toFixed(3)} userScale=${userScale.toFixed(2)} finalScale=${finalScale.toFixed(3)} ` +
                        `scaled=(${scaledW}×${scaledH}) pan=(${panX.toFixed(1)},${panY.toFixed(1)}) ` +
                        `imgTopLeft=(${imgLeft},${imgTop})`
                      )
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
            const layerKey = (TEXT_LAYER_KEYS as readonly string[]).includes(zone.id)
              ? (zone.id as LayerKey) : null
            const layerTransform: LayerTransform = layerKey ? layout[layerKey] : DEFAULT_LAYER
            const isDraggable = interactive && layerKey !== null
            if (!text && !interactive) return null

            // Merge zone defaults with user overrides
            const ov = textStyleOverrides?.[zone.id] ?? {}
            const effectiveFontSize   = ov.fontSize    ?? zone.fontSize    ?? 50
            const effectiveFontFamily = ov.fontFamily  ?? zone.fontFamily  ?? 'Arial'
            const effectiveColor      = ov.color       ?? zone.color       ?? '#ffffff'
            const effectiveStrokeW    = ov.strokeWidth ?? zone.strokeWidth ?? 0
            const effectiveStrokeC    = ov.strokeColor ?? zone.strokeColor ?? '#000000'

            // Font size in px relative to zone height in canvas pixels
            const zonePxH = zone.h * ch
            const fontPx  = Math.max(8, zonePxH * effectiveFontSize / 100)
            const strokePx = effectiveStrokeW > 0 ? Math.max(0.5, fontPx * effectiveStrokeW / 100) : 0
            const fontWeight = zone.id === 'title' ? 'bold' : 'normal'

            // ── Arc text (SVG textPath) ───────────────────────────────────────
            if (zone.arcEnabled) {
              const halfW  = zone.w * cw / 2
              const cx     = (zone.x + zone.w / 2) * cw
              const cy     = (zone.y + zone.h / 2) * ch
              const Rx     = Math.max(halfW + 1, (zone.arcRx ?? 0.7) * ch)
              const Ry     = Math.max(1,          (zone.arcRy ?? 0.5) * ch)
              const ratio  = Math.min(1, halfW / Rx)
              const yOff   = Ry * (1 - Math.sqrt(1 - ratio * ratio))
              const isUp   = (zone.arcDirection ?? 'up') === 'up'
              const sx     = cx - halfW
              const ex     = cx + halfW
              const sy     = isUp ? cy + yOff : cy - yOff
              const arcD   = isUp
                ? `M ${sx.toFixed(1)},${sy.toFixed(1)} A ${Rx.toFixed(1)},${Ry.toFixed(1)} 0 0 0 ${ex.toFixed(1)},${sy.toFixed(1)}`
                : `M ${sx.toFixed(1)},${sy.toFixed(1)} A ${Rx.toFixed(1)},${Ry.toFixed(1)} 0 0 1 ${ex.toFixed(1)},${sy.toFixed(1)}`
              const arcId  = `arc-dc-${zone.id}`
              const sharedTpAttrs = {
                fontFamily: effectiveFontFamily,
                fontSize: fontPx,
                fontWeight,
                textAnchor: 'middle' as const,
              }
              return (
                <svg
                  key={zone.id}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    overflow: 'visible', pointerEvents: 'none',
                  }}
                  viewBox={`0 0 ${cw} ${ch}`}
                >
                  <defs><path id={arcId} d={arcD} /></defs>
                  {strokePx > 0 ? (
                    <text {...sharedTpAttrs} fill={effectiveColor}
                      stroke={effectiveStrokeC} strokeWidth={strokePx}
                      style={{ paintOrder: 'stroke' }}>
                      <textPath href={`#${arcId}`} startOffset="50%">{text || `${zone.id}…`}</textPath>
                    </text>
                  ) : (
                    <>
                      <text {...sharedTpAttrs} fill="rgba(0,0,0,0.7)" transform="translate(1,1)">
                        <textPath href={`#${arcId}`} startOffset="50%">{text || `${zone.id}…`}</textPath>
                      </text>
                      <text {...sharedTpAttrs} fill={text ? effectiveColor : 'rgba(255,255,255,0.25)'}>
                        <textPath href={`#${arcId}`} startOffset="50%">{text || `${zone.id}…`}</textPath>
                      </text>
                    </>
                  )}
                </svg>
              )
            }

            // ── Straight text ─────────────────────────────────────────────────
            const effectiveAlign = ov.align ?? zone.align ?? 'center'
            const textStyle: React.CSSProperties = {
              fontFamily: effectiveFontFamily,
              fontSize: `${fontPx}px`,
              color: effectiveColor,
              textAlign: effectiveAlign,
              lineHeight: 1.2,
              WebkitTextStroke: strokePx > 0 ? `${strokePx}px ${effectiveStrokeC}` : undefined,
              textShadow: strokePx > 0 ? 'none' : '0 1px 4px rgba(0,0,0,0.85)',
            }

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
                  <p style={textStyle}>{text}</p>
                ) : (
                  <p className="text-white/25 text-sm text-center italic"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
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
