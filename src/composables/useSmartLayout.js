import { computed } from 'vue'
import { useBlockStore } from '../stores/blocks.js'
import { usePreviewStore } from '../stores/preview.js'

/**
 * Composable that computes dynamic Y positions to prevent block overlap
 */
export function useSmartLayout() {
  const blockStore = useBlockStore()
  const previewStore = usePreviewStore()

  /**
   * Calculates adjusted Y positions for all blocks based on actual heights
   */
  const smartPositions = computed(() => {
    const blocks = blockStore.blocks
    
    if (!blocks?.length) {
      return {}
    }

    const actualHeights = blockStore.actualHeights
    const blockCount = blocks.length
    
    // Pre-allocate arrays and cache commonly used values
    const blockData = new Array(blockCount)
    const isTableCache = new Map()
    
    // Single pass to build data and cache table checks
    for (let i = 0; i < blockCount; i++) {
      const b = blocks[i]
      const isTable = b.type === 'item_table' || b.type === 'table' || b.type === 'table_builder'
      isTableCache.set(b.id, isTable)
      
      blockData[i] = {
        id: b.id,
        designY: b.y || 0,
        designX: b.x || 0,
        width: b.width || 0,
        height: b.height || 0,
        actualHeight: actualHeights[b.id] || b.height || 0,
        shift: 0,
        rightEdge: (b.x || 0) + (b.width || 0), // Pre-calculate right edge
        isTable
      }
    }

    // Sort by Y position (top to bottom) - stable sort not needed
    blockData.sort((a, b) => a.designY - b.designY)

    // Process each block
    for (let i = 0; i < blockCount; i++) {
      const current = blockData[i]
      let maxShift = 0
      const currentLeft = current.designX
      const currentRight = current.rightEdge

      // Check only relevant blocks above - early break optimization
      for (let j = 0; j < i; j++) {
        const above = blockData[j]
        
        // Quick overlap check using pre-calculated right edge
        if (currentLeft >= above.rightEdge - 1 || currentRight <= above.designX + 1) {
          continue // No horizontal overlap
        }

        // Calculate needed shift
        let neededShift
        if (above.isTable) {
          const heightIncrease = Math.max(0, above.actualHeight - above.height)
          const aboveBottom = above.designY + above.actualHeight + above.shift
          const originalGap = current.designY - (above.designY + above.height)

          if (originalGap >= 0) {
            neededShift = above.shift + heightIncrease
          } else {
            neededShift = aboveBottom - current.designY
          }
        } else {
          neededShift = above.shift
        }

        if (neededShift > maxShift) {
          maxShift = neededShift
        }
      }

      current.shift = maxShift
    }

    // Build final position map using pre-allocated object
    const positions = {}
    for (let i = 0; i < blockCount; i++) {
      const b = blockData[i]
      positions[b.id] = b.designY + b.shift
    }

    return positions
  })

  return { smartPositions }
}