<script setup>
import { computed } from 'vue'
const props = defineProps({ block: { type: Object, required: true } })

const shapeStyle = computed(() => {
  const b = props.block
  const base = {
    width: '100%',
    height: '100%',
    backgroundColor: b.backgroundColor ?? '#e0e0e0',
    border: b.borderWidth ? `${b.borderWidth}px ${b.borderStyle ?? 'solid'} ${b.borderColor ?? '#aaa'}` : 'none',
    boxSizing: 'border-box',
  }
  if (b.shapeType === 'circle') {
    base.borderRadius = '50%'
  } else {
    base.borderRadius = `${b.borderRadius ?? 0}px`
  }
  return base
})
</script>

<template>
  <div :style="shapeStyle" />
</template>
