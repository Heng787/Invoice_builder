<script setup>
import { useBlockStore } from '../../stores/blocks.js'
import { useHistoryStore } from '../../stores/history.js'
import { Copy, Trash2, Lock, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Star } from '@lucide/vue'
import { onMounted, onUnmounted } from 'vue'
import { useTranslateUi } from '../../utils/translateUi.js'
const { translateUi } = useTranslateUi()

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  blockId: { type: String, default: null },
})

const emit = defineEmits(['close'])

const blockStore = useBlockStore()
const historyStore = useHistoryStore()

function getSnapshot() {
  return JSON.parse(JSON.stringify(blockStore.blocks))
}

function duplicate() {
  if (!props.blockId) return
  historyStore.push(getSnapshot())
  blockStore.duplicateBlock(props.blockId)
  emit('close')
}

function deleteBlock() {
  if (!props.blockId) return
  historyStore.push(getSnapshot())
  blockStore.removeBlock(props.blockId)
  emit('close')
}

function toggleLock() {
  if (!props.blockId) return
  const b = blockStore.blocks.find(bl => bl.id === props.blockId)
  if (b) blockStore.updateBlock(props.blockId, { locked: !b.locked })
  emit('close')
}

function bringForward() {
  if (props.blockId) blockStore.bringForward(props.blockId)
  emit('close')
}

function sendBackward() {
  if (props.blockId) blockStore.sendBackward(props.blockId)
  emit('close')
}

function bringToFront() {
  if (props.blockId) blockStore.bringToFront(props.blockId)
  emit('close')
}

function sendToBack() {
  if (props.blockId) blockStore.sendToBack(props.blockId)
  emit('close')
}

function closeOnOutside(e) {
  emit('close')
}

onMounted(() => {
  setTimeout(() => window.addEventListener('click', closeOnOutside), 10)
})
onUnmounted(() => window.removeEventListener('click', closeOnOutside))
</script>

<template>
  <div
    class="context-menu animate-fade-in"
    :style="{ top: `${y}px`, left: `${x}px` }"
    @click.stop
  >
    <div class="context-menu-item" @click="duplicate">
      <Copy :size="13" /> {{ translateUi('Duplicate') }}
    </div>
    <div class="context-menu-separator" />
    <div class="context-menu-item" @click="bringToFront">
      <ChevronsUp :size="13" /> {{ translateUi('Bring to Front') }}
    </div>
    <div class="context-menu-item" @click="bringForward">
      <ArrowUp :size="13" /> {{ translateUi('Bring Forward') }}
    </div>
    <div class="context-menu-item" @click="sendBackward">
      <ArrowDown :size="13" /> {{ translateUi('Send Backward') }}
    </div>
    <div class="context-menu-item" @click="sendToBack">
      <ChevronsDown :size="13" /> {{ translateUi('Send to Back') }}
    </div>
    <div class="context-menu-separator" />
    <div class="context-menu-item" @click="toggleLock">
      <Lock :size="13" /> {{ translateUi('Toggle Lock') }}
    </div>
    <div class="context-menu-separator" />
    <div class="context-menu-item danger" @click="deleteBlock">
      <Trash2 :size="13" /> {{ translateUi('Delete') }}
    </div>
  </div>
</template>
