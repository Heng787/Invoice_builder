<script setup>
import { computed } from 'vue'
import { useBlockStore } from '../../../stores/blocks.js'
import { useHistoryStore } from '../../../stores/history.js'
import { useTranslateUi } from '../../../utils/translateUi.js'
const { translateUi } = useTranslateUi()

const props = defineProps({
  block: { type: Object, required: true }
})

const blockStore = useBlockStore()
const historyStore = useHistoryStore()

const formats = [
  { id: 'A4', label: 'A4 Page' },
  { id: 'A5', label: 'A5 Page' },
  { id: 'RECEIPT_58', label: '58mm Receipt' },
  { id: 'RECEIPT_80', label: '80mm Receipt' },
]

const visibleFormats = computed(() => props.block.visibleFormats || ['A4', 'A5', 'RECEIPT_58', 'RECEIPT_80'])

function toggleFormat(formatId) {
  const current = [...visibleFormats.value]
  const index = current.indexOf(formatId)
  if (index === -1) {
    current.push(formatId)
  } else {
    // Keep at least one format visible
    if (current.length > 1) {
      current.splice(index, 1)
    }
  }
  blockStore.updateBlock(props.block.id, { visibleFormats: current })
  historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)))
}
</script>

<template>
  <div class="tab-panel">
    <div class="field-group">
      <div class="field-label">{{ translateUi('Format Visibility') }}</div>
      <p style="font-size: 11px; color: var(--color-panel-muted); margin-bottom: 12px; line-height: 1.4">
        {{ translateUi('Choose which paper formats this block should be visible on. If a format is disabled, this block will be hidden when that format is active.') }}
      </p>

      <div style="display: flex; flex-direction: column; gap: 10px">
        <div
          v-for="fmt in formats"
          :key="fmt.id"
          style="display: flex; align-items: center; justify-content: space-between"
        >
          <span style="font-weight: 500">{{ translateUi(fmt.label) }}</span>
          <label class="toggle">
            <input
              type="checkbox"
              :checked="visibleFormats.includes(fmt.id)"
              @change="toggleFormat(fmt.id)"
            />
            <span class="toggle-track" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel {
  display: flex;
  flex-direction: column;
}
</style>
