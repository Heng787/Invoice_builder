<script setup>
import { computed } from 'vue'
import { guideLines } from '../../composables/useAlignmentGuides.js'
import { useCanvasStore } from '../../stores/canvas.js'

const canvasStore = useCanvasStore()
const z = computed(() => canvasStore.zoom)
const dims = computed(() => canvasStore.paperDimensions)

// Cache the scaled dimensions to prevent repetitive template math
const scaledWidth = computed(() => `${dims.value.width * z.value}px`)
const scaledHeight = computed(() => `${dims.value.height * z.value}px`)

// Helper to handle hardware-accelerated positioning
const getGuideStyle = (line) => {
  const scaledPos = line.position * z.value
  
  return {
    transform: line.orientation === 'h' 
      ? `translate3d(0, ${scaledPos}px, 0)` 
      : `translate3d(${scaledPos}px, 0, 0)`,
    width: line.orientation === 'h' ? scaledWidth.value : '1px',
    height: line.orientation === 'v' ? scaledHeight.value : '1px'
  }
}
</script>

<template>
  <div
    v-for="line in guideLines"
    :key="`${line.orientation}-${line.position}`"
    class="guide-line"
    :class="{ 'guide-line-h': line.orientation === 'h', 'guide-line-v': line.orientation === 'v' }"
    :style="getGuideStyle(line)"
  />
</template>

<style scoped>
.guide-line {
  position: absolute;
  top: 0;
  left: 0;
  z-index: var(--z-index-guides, 9999);
  background-color: var(--guide-color, #00b4d8);
  box-shadow: 0 0 3px var(--guide-shadow-color, rgba(0, 180, 216, 0.6));
  will-change: transform; /* Signals GPU optimization to the browser */
  pointer-events: none;   /* Ensures guides don't block mouse/drag events */
}

/* Explicitly separating layout concerns from base styles */
.guide-line-h {
  height: 1px;
}

.guide-line-v {
  width: 1px;
}
</style>