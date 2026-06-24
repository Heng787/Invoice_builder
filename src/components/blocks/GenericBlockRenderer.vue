<script setup>
import { computed } from 'vue'

const props = defineProps({
  block: { type: Object, required: true }
})

const style = computed(() => ({
  width: '100%',
  height: '100%',
  border: '1px dashed rgba(255, 159, 28, 0.4)',
  background: 'rgba(255, 159, 28, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  color: 'var(--color-warning)',
  boxSizing: 'border-box',
  borderRadius: '4px',
}))
</script>

<template>
  <div :style="style">
    <span>[{{ block.type || 'unknown' }} block]</span>
  </div>
</template>
