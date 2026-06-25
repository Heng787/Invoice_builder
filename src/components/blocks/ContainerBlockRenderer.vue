<script setup>
import { usePreviewStore } from "../../stores/preview.js";

const props = defineProps({ block: { type: Object, required: true } })
const previewStore = usePreviewStore();
</script>

<template>
  <div
    class="container-renderer"
    :class="{ 'no-custom-border': !block.borderWidth }"
    :style="{
      width: '100%',
      height: '100%',
      backgroundColor: block.backgroundColor ?? 'transparent',
      border: block.borderWidth ? `${block.borderWidth}px ${block.borderStyle ?? 'solid'} ${block.borderColor ?? '#ccc'}` : (previewStore.isPreviewMode ? 'none' : '1px dashed rgba(0,180,216,0.3)'),
      borderRadius: `${block.borderRadius ?? 0}px`,
      padding: `${block.paddingTop ?? 0}px ${block.paddingRight ?? 0}px ${block.paddingBottom ?? 0}px ${block.paddingLeft ?? 0}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }"
  >
    <span
      v-if="!previewStore.isPreviewMode"
      class="container-helper-label"
      style="position: absolute; top: 4px; left: 6px; font-size: 9px; opacity: 0.3; text-transform: uppercase; letter-spacing: 0.05em; color: #000"
    >
      Container
    </span>
  </div>
</template>
