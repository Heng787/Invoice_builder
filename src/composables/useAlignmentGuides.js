import { ref } from 'vue'
import { useBlockStore } from '../stores/blocks.js'
import { useCanvasStore } from '../stores/canvas.js'

/**
 * Alignment guide lines state — imported by AlignmentGuides.vue to render them
 */
export const guideLines = ref([]) // [{ orientation: 'h'|'v', position: number }]

const SNAP_THRESHOLD = 6 // px

/**
 * Called during block drag to compute alignment guides
 * @param {Object} movingBlock - The block being dragged
 * @param {Array} allBlocks - All blocks on canvas
 * @param {number} zoom - Current zoom level
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

    // Vertical guides (x positions)
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

    // Horizontal guides (y positions)
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

export function clearGuides() {
  guideLines.value = []
}
