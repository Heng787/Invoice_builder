// Paper format dimensions in pixels at 96 DPI
// A4:   210mm x 297mm  → 794 x 1123px
// A5:   148mm x 210mm  → 559 x 794px
// 58mm: 58mm  x 400mm  → 219 x 1512px (thermal receipt)
// 80mm: 80mm  x 400mm  → 302 x 1512px (thermal receipt)

export const PAPER_FORMATS = Object.freeze({
  A4: {
    id: 'A4',
    label: 'A4',
    width: 794,
    height: 1123,
    widthMm: 210,
    heightMm: 297,
    isThermal: false,
  },
  A5: {
    id: 'A5',
    label: 'A5',
    width: 559,
    height: 794,
    widthMm: 148,
    heightMm: 210,
    isThermal: false,
  },
  RECEIPT_58: {
    id: 'RECEIPT_58',
    label: '58mm',
    width: 219,
    height: 1512,
    widthMm: 58,
    heightMm: 400,
    isThermal: true,
  },
  RECEIPT_80: {
    id: 'RECEIPT_80',
    label: '80mm',
    width: 302,
    height: 1512,
    widthMm: 80,
    heightMm: 400,
    isThermal: true,
  },
})

export const DEFAULT_FORMAT = 'A4'
export const DEFAULT_ORIENTATION = 'portrait' // 'portrait' | 'landscape'

/**
 * Returns the effective width/height for a format + orientation combo
 */
export function getFormatDimensions(formatId, orientation) {
  const fmt = PAPER_FORMATS[formatId] ?? PAPER_FORMATS.A4
  if (orientation === 'landscape' && !fmt.isThermal) {
    return { width: fmt.height, height: fmt.width }
  }
  return { width: fmt.width, height: fmt.height }
}
