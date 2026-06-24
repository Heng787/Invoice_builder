<script setup>
const props = defineProps({ block: { type: Object, required: true } })
</script>

<template>
  <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden">
    <img
      v-if="block.src"
      :src="block.src"
      :style="{
        width: '100%',
        height: '100%',
        objectFit: block.fitMode ?? 'contain',
        borderRadius: `${block.borderRadius ?? 0}px`,
      }"
      draggable="false"
    />
    <div
      v-else
      style="
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: rgba(0,180,216,0.06);
        border: 2px dashed rgba(0,180,216,0.3);
        border-radius: 6px;
        color: rgba(0,180,216,0.6);
        font-size: 11px;
        gap: 6px;
      "
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
      </svg>
      <span>Click to upload image</span>
    </div>
  </div>
</template>
