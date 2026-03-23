import type { SubjectSlot } from '../types'

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
