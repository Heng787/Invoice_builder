import { useBlockStore } from '../stores/blocks.js'
import { useHistoryStore } from '../stores/history.js'
import { useCanvasStore } from '../stores/canvas.js'
import { getBlockDefaults } from '../utils/blockDefaults.js'
import { computeAlignmentGuides, clearGuides } from './useAlignmentGuides.js'

export function useDragAndDrop() {
  const blockStore = useBlockStore()
  const historyStore = useHistoryStore()
  const canvasStore = useCanvasStore()

  /**
   * Called when user starts dragging a block type from the library panel
   */
  function onLibraryDragStart(event, blockType) {
    event.dataTransfer.setData('blockType', blockType)
    event.dataTransfer.effectAllowed = 'copy'
  }

  /**
   * Called when user drops onto the canvas workspace div
   * Converts drop position to paper-relative coordinates
   */
  function onCanvasDrop(event, paperEl) {
    event.preventDefault()
    const blockType = event.dataTransfer.getData('blockType')
    if (!blockType) return

    // Get drop position relative to the paper element
    const paperRect = paperEl.getBoundingClientRect()
    const zoom = canvasStore.zoom

    const x = Math.round((event.clientX - paperRect.left) / zoom)
    const y = Math.round((event.clientY - paperRect.top) / zoom)

    // Create the block at drop position
    const defaults = getBlockDefaults(blockType)
    const block = {
      ...defaults,
      x: Math.max(0, x - defaults.width / 2),
      y: Math.max(0, y - defaults.height / 2),
    }

    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)))
    blockStore.addBlock(block)
    blockStore.selectBlock(block.id)
  }

  function onCanvasDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  /**
   * Called during a block move on the canvas to compute alignment guides
   */
  function onBlockMove(movingBlock) {
    computeAlignmentGuides(movingBlock, blockStore.blocks, canvasStore.zoom)
  }

  function onBlockMoveEnd() {
    clearGuides()
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)))
  }

  return {
    onLibraryDragStart,
    onCanvasDrop,
    onCanvasDragOver,
    onBlockMove,
    onBlockMoveEnd,
  }
}
