import { ref } from 'vue'
import { useBlockStore } from '../stores/blocks.js'
import { useCanvasStore } from '../stores/canvas.js'

/**
 * Reactive alignment guide lines state
 */
export const guideLines = ref([]) // [{ orientation: 'h'|'v', position: number }]

const SNAP_THRESHOLD = 6 // px

/**
 * Computes alignment guides for a moving block against all other blocks
 */
export function computeAlignmentGuides(movingBlock, allBlocks, zoom = 1) {
  const guides = []
  const mb = movingBlock

  for (const block of allBlocks) {
    if (block.id === mb.id) continue

    const bRight = block.x + block.width
    const bBottom = block.y + block.height
    const bCenterX = block.x + block.width / 2
    const bCenterY = block.y + block.height / 2

    const mRight = mb.x + mb.width
    const mBottom = mb.y + mb.height
    const mCenterX = mb.x + mb.width / 2
    const mCenterY = mb.y + mb.height / 2

    // Check vertical alignments (left, right, center)
    const vChecks = [
      { mPos: mb.x,      bPos: block.x   },
      { mPos: mb.x,      bPos: bRight     },
      { mPos: mRight,    bPos: block.x   },
      { mPos: mRight,    bPos: bRight     },
      { mPos: mCenterX,  bPos: bCenterX  },
    ]
    for (const { mPos, bPos } of vChecks) {
      if (Math.abs(mPos - bPos) < SNAP_THRESHOLD) {
        if (!guides.find(g => g.orientation === 'v' && g.position === bPos)) {
          guides.push({ orientation: 'v', position: bPos })
        }
      }
    }

    // Check horizontal alignments (top, bottom, center)
    const hChecks = [
      { mPos: mb.y,      bPos: block.y   },
      { mPos: mb.y,      bPos: bBottom   },
      { mPos: mBottom,   bPos: block.y   },
      { mPos: mBottom,   bPos: bBottom   },
      { mPos: mCenterY,  bPos: bCenterY  },
    ]
    for (const { mPos, bPos } of hChecks) {
      if (Math.abs(mPos - bPos) < SNAP_THRESHOLD) {
        if (!guides.find(g => g.orientation === 'h' && g.position === bPos)) {
          guides.push({ orientation: 'h', position: bPos })
        }
      }
    }
  }

  guideLines.value = guides
}


 //Clears all active alignment guides

export function clearGuides() {
  guideLines.value = []
}