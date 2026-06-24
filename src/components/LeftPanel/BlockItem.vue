<script setup>
import { computed } from 'vue'
import * as icons from '@lucide/vue'
import { useBlockStore } from '../../stores/blocks.js'
import { useHistoryStore } from '../../stores/history.js'
import { getBlockDefaults } from '../../utils/blockDefaults.js'
import { useCanvasStore } from '../../stores/canvas.js'

const props = defineProps({
  blockType: { type: String, required: true },
  meta: { type: Object, required: true },
})

const blockStore = useBlockStore()
const historyStore = useHistoryStore()
const canvasStore = useCanvasStore()

const Icon = computed(() => icons[props.meta.icon] ?? icons.Box)

// HTML5 drag start — sets blockType in dataTransfer
function onDragStart(e) {
  e.dataTransfer.setData('blockType', props.blockType)
  e.dataTransfer.effectAllowed = 'copy'
}

// Click to add at center of paper
function addToCenter() {
  const { width, height } = canvasStore.paperDimensions
  const defaults = getBlockDefaults(props.blockType)
  const block = {
    ...defaults,
    x: Math.round((width - defaults.width) / 2),
    y: Math.round((height - defaults.height) / 2),
  }
  historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)))
  blockStore.addBlock(block)
  blockStore.selectBlock(block.id)
}
</script>

<template>
  <div
    class="block-item"
    draggable="true"
    @dragstart="onDragStart"
    @click="addToCenter"
  >
    <div class="block-item-icon">
      <component :is="Icon" :size="14" />
    </div>
    <div style="min-width: 0">
      <div style="font-size: 12px; font-weight: 500; color: var(--color-panel-text); line-height: 1.3">
        {{ meta.name }}
      </div>
      <div style="font-size: 10px; color: var(--color-panel-muted); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
        {{ meta.description }}
      </div>
    </div>
  </div>
</template>
