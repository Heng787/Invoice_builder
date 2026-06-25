<script setup>
import { computed } from 'vue'
import { useCanvasStore } from '../../stores/canvas.js'
import { ZoomIn, ZoomOut, Maximize2 } from '@lucide/vue'

const canvasStore = useCanvasStore()

const zoomPercent = computed(() => Math.round(canvasStore.zoom * 100))
</script>

<template>
  <div class="zoom-controls">
    <button class="btn btn-ghost btn-icon" data-tooltip="Zoom Out" @click="canvasStore.zoomOut()">
      <ZoomOut :size="13" />
    </button>
    <span class="zoom-value">{{ zoomPercent }}%</span>
    <button class="btn btn-ghost btn-icon" data-tooltip="Zoom In" @click="canvasStore.zoomIn()">
      <ZoomIn :size="13" />
    </button>
    <button class="btn btn-ghost btn-icon" data-tooltip="Reset Zoom" @click="canvasStore.resetZoom()" style="margin-left: 2px">
      <Maximize2 :size="12" />
    </button>
  </div>
</template>