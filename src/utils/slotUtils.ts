import type { SubjectSlot } from '../types'

/**
 * Parses SubjectSlot[] from a layout's subjectSlotsJson.
 * Assigns fallback IDs ("slot_0", "slot_1", …) for slots that lack an id field,
 * matching the backend's SlotParser.cs fallback so crop-state slotId lookups succeed.
 */
export function parseSlots(json: string | null | undefined): SubjectSlot[] {
  if (!json) return []
  try {
    const raw = JSON.parse(json) as SubjectSlot[]
    if (!Array.isArray(raw)) return []
    return raw.map((s, i) => ({ ...s, id: s.id || `slot_${i}` }))
  } catch {
    return []
  }
}

/**
 * Returns a CSS `clip-path` value that clips the slot div to its declared shape.
 * - "ellipse": inscribed ellipse filling the bounding box
 * - "polygon": polygon with vertices expressed as percentages relative to the slot div
 * - "rect" (or unset): returns undefined — `overflow: hidden` on the div is sufficient
 */
export function slotClipPath(slot: SubjectSlot): string | undefined {
  const shape = slot.shape ?? 'rect'

  if (shape === 'ellipse') {
    return 'ellipse(50% 50% at 50% 50%)'
  }

  if (shape === 'polygon' && slot.points && slot.points.length >= 3) {
    const pts = slot.points
      .map(([px, py]) => {
        const rx = ((px - slot.x) / slot.w * 100).toFixed(2)
        const ry = ((py - slot.y) / slot.h * 100).toFixed(2)
        return `${rx}% ${ry}%`
      })
      .join(', ')
    return `polygon(${pts})`
  }

  return undefined
}
