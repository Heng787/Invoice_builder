import { PAPER_FORMATS, getFormatDimensions } from '../constants/paperFormats.js'

/**
 * Calculate scale factor when migrating from one format to another
 */
export function calcScaleFactor(fromFormatId, toFormatId, fromOrientation = 'portrait', toOrientation = 'portrait') {
  const from = getFormatDimensions(fromFormatId, fromOrientation)
  const to = getFormatDimensions(toFormatId, toOrientation)
  return {
    scaleX: to.width / from.width,
    scaleY: to.height / from.height,
    uniformScale: Math.min(to.width / from.width, to.height / from.height),
  }
}

/**
 * Migrate a single block's position/size to a new paper format
 * Uses proportional scaling
 */
export function migrateBlock(block, scaleX, scaleY) {
  return {
    ...block,
    x: Math.round(block.x * scaleX),
    y: Math.round(block.y * scaleY),
    width: Math.round(block.width * scaleX),
    height: Math.round(block.height * scaleY),
  }
}

/**
 * Check if block is within paper bounds
 */
export function isWithinBounds(block, formatId, orientation) {
  const { width, height } = getFormatDimensions(formatId, orientation)
  return (
    block.x >= 0 &&
    block.y >= 0 &&
    block.x + block.width <= width &&
    block.y + block.height <= height
  )
}

export { PAPER_FORMATS, getFormatDimensions }
