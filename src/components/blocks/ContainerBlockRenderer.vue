<script setup>
const props = defineProps({ block: { type: Object, required: true } })
</script>

<template>
  <div
    :style="{
      width: '100%',
      height: '100%',
      backgroundColor: block.backgroundColor ?? 'transparent',
      border: block.borderWidth ? `${block.borderWidth}px ${block.borderStyle ?? 'solid'} ${block.borderColor ?? '#ccc'}` : '1px dashed rgba(0,180,216,0.3)',
      borderRadius: `${block.borderRadius ?? 0}px`,
      padding: `${block.paddingTop ?? 0}px ${block.paddingRight ?? 0}px ${block.paddingBottom ?? 0}px ${block.paddingLeft ?? 0}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }"
  >
    <span style="position: absolute; top: 4px; left: 6px; font-size: 9px; opacity: 0.3; text-transform: uppercase; letter-spacing: 0.05em; color: #000">
      Container
    </span>
  </div>
</template>
