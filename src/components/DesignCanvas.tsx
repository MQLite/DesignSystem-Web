import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TextConfig, CanvasLayout, LayerTransform } from '../types'

type LayerKey = keyof CanvasLayout
const LAYER_KEYS: LayerKey[] = ['background', 'subject', 'text']

interface Props {
  backgroundUrl: string | null
  subjectUrl: string | null
  textConfig: TextConfig
  layout: CanvasLayout
  /** When provided the canvas becomes interactive (drag / scroll-zoom / rotate) */
  onLayoutChange?: (l: CanvasLayout) => void
  watermark?: string
}

export default function DesignCanvas({
  backgroundUrl, subjectUrl, textConfig, layout, onLayoutChange, watermark,
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

  const dragRef = useRef({ active: false, startX: 0, startY: 0, startTx: 0, startTy: 0 })
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

  // ─── Drag handlers ───────────────────────────────────────────────────────────

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return
    e.preventDefault()
    const cur = layoutRef.current[activeLayerRef.current]
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, startTx: cur.x, startTy: cur.y }
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const d = dragRef.current
    if (!d.active || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    patchLayer(activeLayerRef.current, {
      x: Math.max(-2, Math.min(2, d.startTx + (e.clientX - d.startX) / rect.width)),
      y: Math.max(-2, Math.min(2, d.startTy + (e.clientY - d.startY) / rect.height)),
    })
  }

  const stopDrag = () => {
    dragRef.current.active = false
    if (containerRef.current) containerRef.current.style.cursor = interactive ? 'grab' : ''
  }

  // ─── Layer transform CSS ──────────────────────────────────────────────────────

  const { w: cw, h: ch } = canvasSize

  const bgTransform = (l: LayerTransform) =>
    `translate(${l.x * cw}px, ${l.y * ch}px) scale(${l.scale}) rotate(${l.rotation}deg)`

  const subjectTransform = (l: LayerTransform) =>
    `translate(calc(-50% + ${l.x * cw}px), calc(-50% + ${l.y * ch}px)) scale(${l.scale}) rotate(${l.rotation}deg)`

  const textTransform = (l: LayerTransform) =>
    `translate(${l.x * cw}px, ${l.y * ch}px) scale(${l.scale}) rotate(${l.rotation}deg)`

  const activeOutline = (key: LayerKey): React.CSSProperties =>
    interactive && activeLayer === key
      ? { outline: '2px solid rgb(99,102,241)', outlineOffset: '2px', zIndex: 10 }
      : {}

  const { background: bg, subject, text } = layout
  const sel = layout[activeLayer]

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-3">
      {/* Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[3/4] select-none"
          style={{ cursor: interactive ? 'grab' : 'default' }}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          {/* Layer 1: Background */}
          <div
            className="absolute inset-0"
            style={activeOutline('background')}
            onClick={() => interactive && setActiveLayer('background')}
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

          {/* Layer 2: Subject */}
          {subjectUrl && (
            <div
              className="absolute pointer-events-auto"
              style={{
                left: '50%',
                top: '50%',
                width: '70%',
                transform: subjectTransform(subject),
                transformOrigin: 'center center',
                ...activeOutline('subject'),
              }}
              onClick={(e) => { e.stopPropagation(); interactive && setActiveLayer('subject') }}
            >
              <img
                src={subjectUrl}
                alt="主体"
                draggable={false}
                className="w-full h-auto object-contain opacity-90 drop-shadow-lg"
              />
            </div>
          )}

          {/* Layer 3: Text */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-6 pointer-events-auto"
            style={{
              transform: textTransform(text),
              transformOrigin: 'center center',
              ...activeOutline('text'),
            }}
            onClick={(e) => { e.stopPropagation(); interactive && setActiveLayer('text') }}
          >
            {textConfig.title ? (
              <p className="text-white font-bold text-lg leading-tight text-center drop-shadow">{textConfig.title}</p>
            ) : (
              <p className="text-white/30 font-bold text-lg leading-tight text-center italic">{t('step6.titlePlaceholder')}</p>
            )}
            {textConfig.subtitle && (
              <p className="text-white/80 text-sm text-center mt-1">{textConfig.subtitle}</p>
            )}
            {textConfig.footer && (
              <p className="text-white/60 text-xs text-center mt-2 border-t border-white/20 pt-2">{textConfig.footer}</p>
            )}
          </div>

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
            {LAYER_KEYS.map((key) => (
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
