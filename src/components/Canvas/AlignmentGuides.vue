<script setup>
import { computed } from 'vue'
import { guideLines } from '../../composables/useAlignmentGuides.js'
import { useCanvasStore } from '../../stores/canvas.js'

const canvasStore = useCanvasStore()
const z = computed(() => canvasStore.zoom)
const dims = computed(() => canvasStore.paperDimensions)
</script>

<template>
  <template v-for="(line, i) in guideLines" :key="i">
    <!-- Horizontal guide — spans full paper width -->
    <div
      v-if="line.orientation === 'h'"
      class="guide-line guide-line-h"
      :style="{
        top: `${line.position * z}px`,
        width: `${dims.width * z}px`,
      }"
    />
    <!-- Vertical guide — spans full paper height -->
    <div
      v-else
      class="guide-line guide-line-v"
      :style="{
        left: `${line.position * z}px`,
        height: `${dims.height * z}px`,
      }"
    />
  </template>
</template>

<style scoped>
.guide-line {
  position: absolute;
  pointer-events: none;
  z-index: 9999;
}

/* Horizontal line — full width, 1px tall */
.guide-line-h {
  left: 0;
  height: 1px;
  background-color: #00b4d8;
  box-shadow: 0 0 3px rgba(0, 180, 216, 0.6);
}

/* Vertical line — full height, 1px wide */
.guide-line-v {
  top: 0;
  width: 1px;
  background-color: #00b4d8;
  box-shadow: 0 0 3px rgba(0, 180, 216, 0.6);
}
</style>