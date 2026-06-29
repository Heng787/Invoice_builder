import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBlockDefaults } from '../utils/blockDefaults.js'
import { DOCUMENT_PRESETS } from '../constants/presets.js'

export const useBlockStore = defineStore('blocks', () => {
  // All blocks on canvas — keyed by their fabric object id (block.id)
  const blocks = ref([])
  const selectedIds = ref([])
  const actualHeights = ref({})

  const selectedBlock = computed(() =>
    selectedIds.value.length === 1
      ? blocks.value.find(b => b.id === selectedIds.value[0]) ?? null
      : null
  )

  const selectedBlocks = computed(() =>
    blocks.value.filter(b => selectedIds.value.includes(b.id))
  )

  const orderedBlocks = computed(() =>
    [...blocks.value].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  )

  // Actions
  function setBlockActualHeight(id, height) {
    actualHeights.value = { ...actualHeights.value, [id]: height }
  }

  function addBlock(block) {
    const zIndex = blocks.value.length
    blocks.value.push({ ...block, zIndex })
  }

  function removeBlock(id) {
    blocks.value = blocks.value.filter(b => b.id !== id)
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
  }

  function removeSelected() {
    selectedIds.value.forEach(id => removeBlock(id))
  }

  function updateBlock(id, props) {
    const idx = blocks.value.findIndex(b => b.id === id)
    if (idx !== -1) {
      blocks.value[idx] = { ...blocks.value[idx], ...props }
    }
  }

  function selectBlock(id) {
    selectedIds.value = id ? [id] : []
  }

  function selectBlocks(ids) {
    selectedIds.value = ids
  }

  function addToSelection(id) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id]
    }
  }

  function clearSelection() {
    selectedIds.value = []
  }

  function normalizeZIndices() {
    blocks.value.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
    blocks.value.forEach((b, i) => {
      b.zIndex = i
    })
  }

  function bringForward(id) {
    normalizeZIndices()
    const index = blocks.value.findIndex(b => b.id === id)
    if (index === -1 || index === blocks.value.length - 1) return
    const nextBlock = blocks.value[index + 1]
    const currentZ = blocks.value[index].zIndex
    const nextZ = nextBlock.zIndex
    
    updateBlock(id, { zIndex: nextZ })
    updateBlock(nextBlock.id, { zIndex: currentZ })
  }

  function sendBackward(id) {
    normalizeZIndices()
    const index = blocks.value.findIndex(b => b.id === id)
    if (index <= 0) return
    const prevBlock = blocks.value[index - 1]
    const currentZ = blocks.value[index].zIndex
    const prevZ = prevBlock.zIndex

    updateBlock(id, { zIndex: prevZ })
    updateBlock(prevBlock.id, { zIndex: currentZ })
  }

  function bringToFront(id) {
    const maxZ = Math.max(0, ...blocks.value.map(b => b.zIndex ?? 0))
    updateBlock(id, { zIndex: maxZ + 1 })
  }

  function sendToBack(id) {
    const minZ = Math.min(0, ...blocks.value.map(b => b.zIndex ?? 0))
    updateBlock(id, { zIndex: minZ - 1 })
  }

  function duplicateBlock(id) {
    const block = blocks.value.find(b => b.id === id)
    if (!block) return null
    const newBlock = {
      ...block,
      id: crypto.randomUUID(),
      x: (block.x ?? 0) + 20,
      y: (block.y ?? 0) + 20,
      zIndex: Math.max(...blocks.value.map(b => b.zIndex ?? 0)) + 1,
    }
    blocks.value.push(newBlock)
    return newBlock
  }

  function clearAll() {
    blocks.value = []
    selectedIds.value = []
  }

  function setBlocks(newBlocks) {
    blocks.value = newBlocks
    selectedIds.value = []
    normalizeZIndices()
  }

  function loadPreset(documentType, width, height) {
    const preset = DOCUMENT_PRESETS[documentType]
    if (!preset) return
    const newBlocks = preset.map(pb => {
      const x = Math.round(pb.xPercent * width)
      const y = Math.round(pb.yPercent * height)
      const w = Math.round(pb.widthPercent * width)
      const h = Math.round(pb.heightPercent * height)
      return getBlockDefaults(pb.type, {
        x,
        y,
        width: w,
        height: h,
        ...pb.defaultProps
      })
    })
    setBlocks(newBlocks)
  }

  return {
    blocks,
    selectedIds,
    actualHeights,
    selectedBlock,
    selectedBlocks,
    orderedBlocks,
    setBlockActualHeight,
    addBlock,
    removeBlock,
    removeSelected,
    updateBlock,
    selectBlock,
    selectBlocks,
    addToSelection,
    clearSelection,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    duplicateBlock,
    clearAll,
    setBlocks,
    loadPreset,
  }
})
