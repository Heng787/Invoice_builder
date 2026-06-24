<script setup>
const props = defineProps({ block: { type: Object, required: true } })
</script>

<template>
  <div style="width: 100%; height: 100%; display: flex; align-items: center">
    <div
      :style="{
        width: '100%',
        height: `${block.lineWidth ?? 1}px`,
        background: block.lineColor ?? '#cccccc',
        borderTop: block.lineStyle === 'dashed' ? `${block.lineWidth ?? 1}px dashed ${block.lineColor ?? '#cccccc'}` : undefined,
        borderTopStyle: block.lineStyle ?? 'solid',
      }"
    />
  </div>
</template>
