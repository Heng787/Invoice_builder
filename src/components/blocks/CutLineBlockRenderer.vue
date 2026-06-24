<script setup>
const props = defineProps({ block: { type: Object, required: true } })
</script>

<template>
  <div
    class="print-hidden"
    style="width: 100%; height: 100%; display: flex; align-items: center; position: relative; pointer-events: none"
  >
    <div style="position: absolute; left: 0; right: 0; border-top: 1px dashed #aaaaaa;" />
    <span style="position: absolute; left: 2px; background: white; padding: 0 4px; font-size: 14px; line-height: 1">✂</span>
    <span v-if="block.showLabel !== false" style="position: absolute; left: 50%; transform: translateX(-50%); background: white; padding: 0 6px; font-size: 9px; color: #aaaaaa; text-transform: uppercase; letter-spacing: 0.06em">Cut Here</span>
  </div>
</template>
