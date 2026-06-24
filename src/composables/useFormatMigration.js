import { useBlockStore } from '../stores/blocks.js'
import { useCanvasStore } from '../stores/canvas.js'
import { calcScaleFactor, migrateBlock, isWithinBounds } from '../utils/paperSizes.js'

export function useFormatMigration() {
  const blockStore = useBlockStore()
  const canvasStore = useCanvasStore()

  /**
   * Migrate all blocks from one format to another
   * Applies proportional scaling with animation
   */
  function migrate(fromFormatId, toFormatId, fromOrientation = 'portrait', toOrientation = 'portrait') {
    const { scaleX, scaleY } = calcScaleFactor(fromFormatId, toFormatId, fromOrientation, toOrientation)

    const migratedBlocks = blockStore.blocks.map(block => {
      const migrated = migrateBlock(block, scaleX, scaleY)
      const outOfBounds = !isWithinBounds(migrated, toFormatId, toOrientation)
      return { ...migrated, _outOfBounds: outOfBounds }
    })

    blockStore.setBlocks(migratedBlocks)
  }

  /**
   * Change format and trigger migration
   */
  function switchFormat(newFormatId) {
    const fromFormatId = canvasStore.formatId
    const fromOrientation = canvasStore.orientation

    canvasStore.setFormat(newFormatId)

    // Migrate blocks
    migrate(fromFormatId, newFormatId, fromOrientation, canvasStore.orientation)
  }

  /**
   * Change orientation and trigger migration
   */
  function switchOrientation(newOrientation) {
    const fromFormatId = canvasStore.formatId
    const fromOrientation = canvasStore.orientation

    canvasStore.setOrientation(newOrientation)
    migrate(fromFormatId, fromFormatId, fromOrientation, newOrientation)
  }

  return { migrate, switchFormat, switchOrientation }
}
