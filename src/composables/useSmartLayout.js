import { computed } from 'vue'
import { useBlockStore } from '../stores/blocks.js'
import { usePreviewStore } from '../stores/preview.js'

/**
 * Composable that computes dynamic Y positions to prevent block overlap
 */
export function useSmartLayout() {
  const blockStore = useBlockStore()

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
    
    // Build working data with actual heights and expansions
    const blockData = new Array(blockCount)
    for (let i = 0; i < blockCount; i++) {
      const b = blocks[i]
      const designX = b.x || 0
      const width = b.width || 0
      const baseHeight = b.height || 0
      let actualH = actualHeights[b.id] || baseHeight
      
      // Adjust table height for print page breaks
      actualH = adjustForPrintBreaks(b, actualH)
      
      const expansion = Math.max(0, actualH - baseHeight)

      blockData[i] = {
        id: b.id,
        designY: b.y || 0,
        designX,
        baseHeight,
        actualHeight: actualH,
        expansion,
        shift: 0,
        rightEdge: designX + width
      }
    }

    // Sort by initial design Y position (top-to-bottom)
    blockData.sort((a, b) => a.designY - b.designY)

    // Resolve collisions by shifting blocks down
    for (let i = 0; i < blockCount; i++) {
      const current = blockData[i]
      let maxShift = 0
      const currentLeft = current.designX
      const currentRight = current.rightEdge

      for (let j = 0; j < i; j++) {
        const above = blockData[j]
        
        // Skip if no horizontal overlap
        if (currentLeft >= above.rightEdge - 1 || currentRight <= above.designX + 1) {
          continue 
        }

        // Push blocks designed below the above block's base
        const aboveBaseBottom = above.designY + above.baseHeight
        
        if (current.designY >= aboveBaseBottom - 30) {
          const neededShift = above.shift + above.expansion
          if (neededShift > maxShift) {
            maxShift = neededShift
          }
        }
      }

      current.shift = maxShift
    }

    // Build final position map
    const positions = {}
    for (let i = 0; i < blockCount; i++) {
      const b = blockData[i]
      positions[b.id] = b.designY + b.shift
    }

    return positions
  })

  return { smartPositions }
}

/**
 * Adjusts block height for print page breaks
 */
function adjustForPrintBreaks(block, actualHeight) {
  const PAGE_HEIGHT = 1122
  const HEADER_HEIGHT = 38.5 // Approximate table header height per page break
  
  if (block.type !== 'item_table' || actualHeight <= 0) {
    return actualHeight
  }
  
  const previewStore = usePreviewStore()
  
  if (!previewStore.isPrinting) {
    return actualHeight
  }
  
  const startY = block.y || 0
  const endY = startY + actualHeight
  
  // Count page breaks within the block's vertical span
  let pageBreaks = 0
  for (let pageY = PAGE_HEIGHT; pageY < endY; pageY += PAGE_HEIGHT) {
    if (pageY > startY) {
      pageBreaks++
    }
  }
  
  // Add extra height for repeated headers on each page break
  return actualHeight + (pageBreaks * HEADER_HEIGHT)
}