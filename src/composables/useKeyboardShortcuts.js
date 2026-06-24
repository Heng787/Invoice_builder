import { onMounted, onUnmounted } from 'vue'
import { useBlockStore } from '../stores/blocks.js'
import { useHistoryStore } from '../stores/history.js'
import { useCanvasStore } from '../stores/canvas.js'

export function useKeyboardShortcuts() {
  const blockStore = useBlockStore()
  const historyStore = useHistoryStore()
  const canvasStore = useCanvasStore()

  function getSnapshot() {
    return JSON.parse(JSON.stringify(blockStore.blocks))
  }

  function handleKeyDown(e) {
    const tag = document.activeElement?.tagName
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    const isEditing = document.activeElement?.contentEditable === 'true'
    if (isInput || isEditing) return

    const ctrl = e.ctrlKey || e.metaKey
    const shift = e.shiftKey

    switch (true) {
      // Undo
      case ctrl && !shift && e.key === 'z': {
        e.preventDefault()
        const snapshot = historyStore.undo()
        if (snapshot) blockStore.setBlocks(snapshot)
        break
      }
      // Redo
      case ctrl && shift && e.key === 'Z':
      case ctrl && e.key === 'y': {
        e.preventDefault()
        const snapshot = historyStore.redo()
        if (snapshot) blockStore.setBlocks(snapshot)
        break
      }
      // Save
      case ctrl && e.key === 's': {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('app:save'))
        break
      }
      // Duplicate
      case ctrl && e.key === 'd': {
        e.preventDefault()
        if (blockStore.selectedBlock) {
          historyStore.push(getSnapshot())
          blockStore.duplicateBlock(blockStore.selectedBlock.id)
        }
        break
      }
      // Select all
      case ctrl && e.key === 'a': {
        e.preventDefault()
        blockStore.selectBlocks(blockStore.blocks.map(b => b.id))
        break
      }
      // Delete
      case e.key === 'Delete' || e.key === 'Backspace': {
        if (blockStore.selectedIds.length > 0) {
          e.preventDefault()
          historyStore.push(getSnapshot())
          blockStore.removeSelected()
        }
        break
      }
      // Deselect
      case e.key === 'Escape': {
        blockStore.clearSelection()
        break
      }
      // Bring forward
      case e.key === ']' && !ctrl: {
        if (blockStore.selectedBlock) {
          blockStore.bringForward(blockStore.selectedBlock.id)
        }
        break
      }
      // Send backward
      case e.key === '[' && !ctrl: {
        if (blockStore.selectedBlock) {
          blockStore.sendBackward(blockStore.selectedBlock.id)
        }
        break
      }
      // Lock
      case ctrl && e.key === 'l': {
        e.preventDefault()
        if (blockStore.selectedBlock) {
          const b = blockStore.selectedBlock
          blockStore.updateBlock(b.id, { locked: !b.locked })
        }
        break
      }
      // Zoom
      case ctrl && e.key === '=':
      case ctrl && e.key === '+': {
        e.preventDefault()
        canvasStore.zoomIn()
        break
      }
      case ctrl && e.key === '-': {
        e.preventDefault()
        canvasStore.zoomOut()
        break
      }
      case ctrl && e.key === '0': {
        e.preventDefault()
        canvasStore.resetZoom()
        break
      }
      // Nudge selected blocks
      case e.key === 'ArrowLeft': {
        e.preventDefault()
        nudgeSelected(shift ? -10 : -1, 0)
        break
      }
      case e.key === 'ArrowRight': {
        e.preventDefault()
        nudgeSelected(shift ? 10 : 1, 0)
        break
      }
      case e.key === 'ArrowUp': {
        e.preventDefault()
        nudgeSelected(0, shift ? -10 : -1)
        break
      }
      case e.key === 'ArrowDown': {
        e.preventDefault()
        nudgeSelected(0, shift ? 10 : 1)
        break
      }
    }
  }

  function nudgeSelected(dx, dy) {
    blockStore.selectedIds.forEach(id => {
      const block = blockStore.blocks.find(b => b.id === id)
      if (!block || block.locked) return
      blockStore.updateBlock(id, { x: (block.x ?? 0) + dx, y: (block.y ?? 0) + dy })
    })
  }

  onMounted(() => window.addEventListener('keydown', handleKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
}
