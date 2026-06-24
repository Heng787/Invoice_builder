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
    <!-- Horizontal guide -->
    <div
      v-if="line.orientation === 'h'"
      class="guide-line guide-line-h"
      :style="{ top: `${line.position * z}px` }"
    />
    <!-- Vertical guide -->
    <div
      v-else
      class="guide-line guide-line-v"
      :style="{ left: `${line.position * z}px` }"
    />
  </template>
</template>
