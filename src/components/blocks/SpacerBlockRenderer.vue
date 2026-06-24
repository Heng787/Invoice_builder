<script setup>
const props = defineProps({ block: { type: Object, required: true } })
</script>

<template>
  <div
    :style="{
      width: '100%',
      height: '100%',
      background: block.backgroundColor ?? 'transparent',
    }"
  />
</template>
