<script setup>
import { computed } from 'vue'
import { useCanvasStore } from '../../stores/canvas.js'
import { useBlockStore } from '../../stores/blocks.js'

const props = defineProps({
  block: { type: Object, required: true },
  fillMode: { type: Boolean, default: false },
})

const canvasStore = useCanvasStore()
const blockStore = useBlockStore()

const columns = computed(() => props.block.columns ?? [
  { label: 'From', content: '' },
  { label: 'To', content: '' },
  { label: 'Details', content: '' },
])

const isFillMode = computed(() => props.fillMode || canvasStore.fillMode)

function updateColumn(index, value) {
  const cols = JSON.parse(JSON.stringify(props.block.columns ?? []))
  if (cols[index] !== undefined) {
    cols[index].content = value
    blockStore.updateBlock(props.block.id, { columns: cols })
  }
}
</script>

<template>
  <div
    :style="{
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
      gap: '0',
      fontFamily: block.fontFamily ?? 'inherit',
      fontSize: `${block.fontSize ?? 12}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }"
  >
    <div
      v-for="(col, i) in columns"
      :key="i"
      :style="{
        padding: '8px 10px',
        borderRight: i < columns.length - 1 ? '1px solid #e0e0e0' : 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }"
    >
      <!-- Column label header -->
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 6px; flex-shrink: 0">
        {{ col.label }}
      </div>

      <!-- Fill mode: editable textarea -->
      <textarea
        v-if="isFillMode"
        :value="col.content ?? ''"
        :style="{
          flex: 1,
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: block.fontFamily ?? 'inherit',
          fontSize: `${block.fontSize ?? 12}px`,
          color: block.color ?? '#222',
          lineHeight: block.lineHeight ?? 1.5,
          padding: 0,
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          cursor: 'text',
          pointerEvents: 'auto',
        }"
        @input="updateColumn(i, $event.target.value)"
      />

      <!-- Design mode: plain text display -->
      <div
        v-else
        :style="{
          color: block.color ?? '#222',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: block.lineHeight ?? 1.5,
          flex: 1,
        }"
      >
        {{ col.content || '' }}
      </div>
    </div>
  </div>
</template>
