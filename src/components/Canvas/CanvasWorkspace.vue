<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
// Tiny debounce helper (replaces lodash-es to avoid the extra dependency)
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
import { useDragAndDrop } from '../../composables/useDragAndDrop.js'
import ZoomControls from './ZoomControls.vue'
import AlignmentGuides from './AlignmentGuides.vue'
import CanvasBlock from './CanvasBlock.vue'
import ContextMenu from './ContextMenu.vue'

const canvasStore = useCanvasStore()
const blockStore = useBlockStore()
const historyStore = useHistoryStore()
const { onCanvasDrop, onCanvasDragOver } = useDragAndDrop()

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

const paperStyle = computed(() => {
  const { width, height } = paperDims.value
  const z = zoom.value
  return {
    width: `${width}px`,
    height: `${height}px`,
    transform: `scale(${z})`,
    transformOrigin: 'top left',
    position: 'relative',
    background: 'var(--color-paper)',
    boxShadow: 'var(--shadow-paper)',
    overflow: 'hidden',
    flexShrink: 0,
    willChange: 'transform',
  }
})

const workspaceContentStyle = computed(() => {
  const { width, height } = paperDims.value
  const z = zoom.value
  return {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: `${width * z}px`,
    height: `${height * z}px`,
    minWidth: `${width * z}px`,
    minHeight: `${height * z}px`,
    transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
    transition: isPanning.value ? 'none' : 'transform 0.1s ease',
  }
})

// ─── Drop handling ───────────────────────────────────────────
function handleDrop(e) {
  isDraggingOver.value = false
  onCanvasDrop(e, paperEl.value)
}

function handleDragOver(e) {
  onCanvasDragOver(e)
  isDraggingOver.value = true
}

function handleDragLeave() {
  isDraggingOver.value = false
}

// ─── Pan (Space + drag) ───────────────────────────────────────
function onKeyDown(e) {
  if (e.code === 'Space' && !spaceHeld.value) {
    const tag = document.activeElement?.tagName
    const isEditable = document.activeElement?.contentEditable === 'true' || document.activeElement?.isContentEditable
    if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) return
    e.preventDefault()
    spaceHeld.value = true
  }
}

function onKeyUp(e) {
  if (e.code === 'Space') {
    spaceHeld.value = false
    isPanning.value = false
  }
}

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

function onWheel(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    onWheelDebounced(e.deltaY)
  }
}

// ─── Context menu ─────────────────────────────────────────────
function showContextMenu(e, blockId) {
  e.preventDefault()
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, blockId }
}

function hideContextMenu() {
  contextMenu.value.visible = false
}

// ─── Click outside to deselect ───────────────────────────────
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

onMounted(() => {
  events.forEach(([event, handler]) => {
    window.addEventListener(event, handler)
  })
})

onUnmounted(() => {
  events.forEach(([event, handler]) => {
    window.removeEventListener(event, handler)
  })
  // Cancel any pending debounced calls
  onWheelDebounced.cancel?.()
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
        
        <AlignmentGuides v-if="blockStore.selectedIds.length > 1" />

        <div v-if="dragSelect.active" :style="dragSelectStyle" />

        <CanvasBlock
          v-for="block in blockStore.orderedBlocks"
          :key="block.id"
          :block="block"
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