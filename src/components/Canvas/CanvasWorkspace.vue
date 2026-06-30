<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

/**
 * Creates a debounced function that delays execution
 */
function debounce(fn, wait, { leading = false, trailing = true } = {}) {
  let timer = null
  function debounced(...args) {
    const callNow = leading && !timer
    clearTimeout(timer)
    timer = setTimeout(() => { timer = null; if (trailing && !callNow) fn.apply(this, args) }, wait)
    if (callNow) fn.apply(this, args)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}

import { useCanvasStore } from '../../stores/canvas.js'
import { useBlockStore } from '../../stores/blocks.js'
import { useHistoryStore } from '../../stores/history.js'
import { usePreviewStore } from '../../stores/preview.js'
import { useDragAndDrop } from '../../composables/useDragAndDrop.js'
import ZoomControls from './ZoomControls.vue'
import AlignmentGuides from './AlignmentGuides.vue'
import CanvasBlock from './CanvasBlock.vue'
import ContextMenu from './ContextMenu.vue'
import { useSmartLayout } from '../../composables/useSmartLayout.js'
import { nextTick } from 'vue'

const canvasStore = useCanvasStore()
const blockStore = useBlockStore()
const historyStore = useHistoryStore()
const previewStore = usePreviewStore()
const { onCanvasDrop, onCanvasDragOver } = useDragAndDrop()
const { smartPositions } = useSmartLayout()

const workspaceEl = ref(null)
const paperEl = ref(null)
const isDraggingOver = ref(false)

// Pan state
const isPanning = ref(false)
const spaceHeld = ref(false)
const panStart = ref({ x: 0, y: 0 })
const panOffset = ref({ x: 0, y: 0 })

// Context menu
const contextMenu = ref({ visible: false, x: 0, y: 0, blockId: null })

// Drag-select state
const dragSelect = ref({ active: false, startX: 0, startY: 0, endX: 0, endY: 0 })

// Memoized paper dimensions
const paperDims = computed(() => canvasStore.paperDimensions)
const zoom = computed(() => canvasStore.zoom)

// Styles
const workspaceStyle = computed(() => ({
  flex: 1,
  background: 'var(--color-workspace)',
  overflow: 'auto',
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '40px',
  cursor: isPanning.value ? 'grabbing' : (spaceHeld.value ? 'grab' : 'default')
}))

/**
 * Computes the maximum bottom position of all blocks
 */
const maxContentBottom = computed(() => {
  let maxBottom = 0;
  blockStore.blocks.forEach(b => {
    const y = smartPositions.value[b.id] ?? b.y;
    const h = blockStore.actualHeights[b.id] || b.height;
    if (y + h > maxBottom) {
      maxBottom = y + h;
    }
  });
  return maxBottom;
})

/**
 * Computes the number of pages needed for preview mode
 */
const requiredPages = computed(() => {
  const { height } = paperDims.value;
  if (!height) return 1;
  if (!previewStore.isPreviewMode) return 1;
  const pages = Math.ceil(maxContentBottom.value / height);
  return pages > 0 ? pages : 1;
})

/**
 * Computes the paper element styles with multi-page support
 */
const paperStyle = computed(() => {
  const { width, height } = paperDims.value
  const z = zoom.value
  const isPreview = previewStore.isPreviewMode
  const isPrinting = previewStore.isPrinting
  const pages = requiredPages.value
  
  // To avoid microscopic subpixel overflow that causes browsers to print a blank extra page,
  // we restrict the exact pixel height to the bottom of the content during the print job.
  const finalHeight = isPrinting ? Math.max(height, maxContentBottom.value) : height * pages
  
  return {
    width: `${width}px`,
    height: `${finalHeight}px`,
    transform: `scale(${z})`,
    transformOrigin: 'top left',
    position: 'relative',
    background: isPreview && pages > 1 
      ? `repeating-linear-gradient(to bottom, var(--color-paper) 0, var(--color-paper) calc(${height}px - 2px), rgba(0,0,0,0.15) calc(${height}px - 2px), rgba(0,0,0,0.15) ${height}px)` 
      : 'var(--color-paper)',
    boxShadow: 'var(--shadow-paper)',
    overflow: 'hidden',
    flexShrink: 0,
    willChange: 'transform',
  }
})

/**
 * Computes the workspace content container styles with pan offset
 */
const workspaceContentStyle = computed(() => {
  const { width, height } = paperDims.value
  const z = zoom.value
  const pages = requiredPages.value
  
  const currentHeight = height * pages

  return {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: `${width * z}px`,
    height: `${currentHeight * z}px`,
    minWidth: `${width * z}px`,
    minHeight: `${currentHeight * z}px`,
    transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
    transition: isPanning.value ? 'none' : 'transform 0.1s ease',
  }
})

// ─── Drop handling ───────────────────────────────────────────

/**
 * Handles file/block drop on canvas
 */
function handleDrop(e) {
  isDraggingOver.value = false
  onCanvasDrop(e, paperEl.value)
}

/**
 * Handles drag over events on canvas
 */
function handleDragOver(e) {
  onCanvasDragOver(e)
  isDraggingOver.value = true
}

/**
 * Handles drag leave events
 */
function handleDragLeave() {
  isDraggingOver.value = false
}

// ─── Pan (Space + drag) ───────────────────────────────────────

/**
 * Handles keydown for spacebar pan activation
 */
function onKeyDown(e) {
  if (e.code === 'Space' && !spaceHeld.value) {
    const tag = document.activeElement?.tagName
    const isEditable = document.activeElement?.contentEditable === 'true' || document.activeElement?.isContentEditable
    if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) return
    e.preventDefault()
    spaceHeld.value = true
  }
}

/**
 * Handles keyup for spacebar pan deactivation
 */
function onKeyUp(e) {
  if (e.code === 'Space') {
    spaceHeld.value = false
    isPanning.value = false
  }
}

/**
 * Handles mousedown for pan and drag-select initiation
 */
function onMouseDown(e) {
  if (spaceHeld.value) {
    isPanning.value = true
    panStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y }
    e.preventDefault()
    return
  }

  if (e.target === paperEl.value) {
    const rect = paperEl.value.getBoundingClientRect()
    const z = zoom.value
    dragSelect.value = {
      active: true,
      startX: (e.clientX - rect.left) / z,
      startY: (e.clientY - rect.top) / z,
      endX: (e.clientX - rect.left) / z,
      endY: (e.clientY - rect.top) / z,
    }
    blockStore.clearSelection()
    e.preventDefault()
  }
}

/**
 * Handles mousemove for pan and drag-select updates
 */
function onMouseMove(e) {
  if (isPanning.value) {
    panOffset.value = {
      x: e.clientX - panStart.value.x,
      y: e.clientY - panStart.value.y,
    }
    return
  }

  if (dragSelect.value.active) {
    const rect = paperEl.value.getBoundingClientRect()
    const z = zoom.value
    dragSelect.value.endX = (e.clientX - rect.left) / z
    dragSelect.value.endY = (e.clientY - rect.top) / z
  }
}

/**
 * Handles mouseup for pan and drag-select finalization
 */
function onMouseUp() {
  if (isPanning.value) {
    isPanning.value = false
    return
  }

  if (dragSelect.value.active) {
    finalizeDragSelect()
    dragSelect.value.active = false
  }
}

/**
 * Finalizes drag-select by selecting intersecting blocks
 */
function finalizeDragSelect() {
  const { startX, startY, endX, endY } = dragSelect.value
  const selX = Math.min(startX, endX)
  const selY = Math.min(startY, endY)
  const selW = Math.abs(endX - startX)
  const selH = Math.abs(endY - startY)
  if (selW < 4 || selH < 4) return

  const selected = blockStore.blocks.filter(b => {
    return (
      b.x < selX + selW &&
      b.x + b.width > selX &&
      b.y < selY + selH &&
      b.y + b.height > selY
    )
  }).map(b => b.id)

  blockStore.selectBlocks(selected)
}

// ─── Scroll to zoom (debounced) ─────────────────────────────

const onWheelDebounced = debounce((deltaY) => {
  const delta = deltaY > 0 ? -0.08 : 0.08
  canvasStore.setZoom(zoom.value + delta)
}, 16, { leading: true, trailing: true })

/**
 * Handles wheel events for zoom (ctrl/cmd + scroll)
 */
function onWheel(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    onWheelDebounced(e.deltaY)
  }
}

// ─── Context menu ─────────────────────────────────────────────

/**
 * Shows context menu at cursor position
 */
function showContextMenu(e, blockId) {
  e.preventDefault()
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, blockId }
}

/**
 * Hides context menu
 */
function hideContextMenu() {
  contextMenu.value.visible = false
}

// ─── Click outside to deselect ───────────────────────────────

/**
 * Handles click on workspace to deselect blocks
 */
function onWorkspaceClick(e) {
  if (e.target === workspaceEl.value || e.target === paperEl.value) {
    blockStore.clearSelection()
    canvasStore.editingBlockId = null
    hideContextMenu()
  }
}

// Drag-select rect style
const dragSelectStyle = computed(() => {
  if (!dragSelect.value.active) return null
  const { startX, startY, endX, endY } = dragSelect.value
  const z = zoom.value
  return {
    left: `${Math.min(startX, endX) * z}px`,
    top: `${Math.min(startY, endY) * z}px`,
    width: `${Math.abs(endX - startX) * z}px`,
    height: `${Math.abs(endY - startY) * z}px`,
    position: 'absolute',
    border: '1px solid var(--color-selection)',
    background: 'var(--color-accent-dim)',
    pointerEvents: 'none',
    zIndex: 9998,
  }
})

// Event listeners
const events = [
  ['keydown', onKeyDown],
  ['keyup', onKeyUp],
  ['mouseup', onMouseUp],
  ['mousemove', onMouseMove],
  ['resize', () => {}] // Add any resize handlers
]

let dynamicStyleEl = null
let savedZoom = 1
let originalPrint = null

/**
 * Saves current zoom before print
 */
function handleBeforePrint() {
  savedZoom = canvasStore.zoom
  canvasStore.setZoom(1)
}

/**
 * Restores zoom after print
 */
function handleAfterPrint() {
  canvasStore.setZoom(savedZoom)
}

/**
 * Lifecycle: Mount - sets up event listeners and print override
 */
onMounted(() => {
  events.forEach(([event, handler]) => {
    window.addEventListener(event, handler)
  })
  window.addEventListener('afterprint', handleAfterPrint)

  // Override window.print globally to guarantee layout calculations run at 100% (zoom = 1)
  originalPrint = window.print
  window.print = async () => {
    savedZoom = canvasStore.zoom
    canvasStore.setZoom(1)
    
    await nextTick()

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    
    originalPrint()
  }

  // Dynamically inject the @page CSS rule to match formatId & orientation
  dynamicStyleEl = document.createElement('style')
  dynamicStyleEl.id = 'dynamic-print-page-size'
  document.head.appendChild(dynamicStyleEl)

  watch(
    [() => canvasStore.formatId, () => canvasStore.orientation],
    ([formatId, orientation]) => {
      if (!dynamicStyleEl) return
      
      let sizeStr = 'A4 portrait'
      let marginStr = '15mm'
      
      if (formatId === 'A4') {
        sizeStr = `A4 ${orientation}`
        marginStr = '15mm'
      } else if (formatId === 'A5') {
        sizeStr = `A5 ${orientation}`
        marginStr = '10mm'
      } else if (formatId === 'RECEIPT_58') {
        sizeStr = '58mm auto'
        marginStr = '0mm'
      } else if (formatId === 'RECEIPT_80') {
        sizeStr = '80mm auto'
        marginStr = '0mm'
      }
      
      dynamicStyleEl.innerHTML = `
        @page {
          size: ${sizeStr};
          margin: ${marginStr};
        }
      `
    },
    { immediate: true }
  )
})

/**
 * Lifecycle: Unmount - cleans up event listeners and print override
 */
onUnmounted(() => {
  events.forEach(([event, handler]) => {
    window.removeEventListener(event, handler)
  })
  window.removeEventListener('afterprint', handleAfterPrint)
  
  if (originalPrint) {
    window.print = originalPrint
  }

  // Cancel any pending debounced calls
  onWheelDebounced.cancel?.()

  if (dynamicStyleEl && dynamicStyleEl.parentNode) {
    dynamicStyleEl.parentNode.removeChild(dynamicStyleEl)
  }
})
</script>

<template>
  <main
    ref="workspaceEl"
    class="workspace"
    :style="workspaceStyle"
    @click="onWorkspaceClick"
    @mousedown="onMouseDown"
    @wheel="onWheel"
    @contextmenu.prevent
  >
    <div
      class="workspace-content"
      :style="workspaceContentStyle"
    >
      <div
        ref="paperEl"
        id="canvas-paper"
        class="paper"
        :style="paperStyle"
        :class="{ 'drop-active': isDraggingOver }"
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @contextmenu.prevent
      >
        <div class="margin-indicator" />
        
        <AlignmentGuides v-if="!previewStore.isPreviewMode" />

        <div v-if="dragSelect.active" :style="dragSelectStyle" />

        <CanvasBlock
          v-for="block in blockStore.orderedBlocks"
          :key="block.id"
          :block="block"
          :smart-y="smartPositions[block.id]"
          @contextmenu.stop="(e) => showContextMenu(e, block.id)"
        />
      </div>
    </div>

    <div class="print-hidden zoom-controls">
      <ZoomControls />
    </div>

    <ContextMenu
      v-if="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :block-id="contextMenu.blockId"
      @close="hideContextMenu"
    />
  </main>
</template>

<style scoped>
.workspace::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.workspace::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.drop-active {
  outline: 2px dashed var(--color-accent) !important;
  outline-offset: -4px;
}

.margin-indicator {
  position: absolute;
  inset: 20px;
  border: 1px dashed rgba(0, 180, 216, 0.15);
  pointer-events: none;
  z-index: 0;
}

#canvas-paper {
  will-change: transform;
}

.zoom-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}

@media print {
  .print-hidden {
    display: none !important;
  }
}
</style>