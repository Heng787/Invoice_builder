<script setup>
import { computed } from 'vue'
import { useBlockStore } from '../../stores/blocks.js'

const props = defineProps({
  block: { type: Object, required: true },
  fillMode: { type: Boolean, default: false },
})
const blockStore = useBlockStore()

const style = computed(() => ({
  width: '100%', height: '100%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: props.block.fontFamily ?? 'inherit',
  fontSize: `${props.block.fontSize ?? 14}px`,
  fontWeight: 'bold',
  color: props.block.color ?? '#000000',
  border: `2px solid ${props.block.color ?? '#000000'}`,
  borderRadius: `${props.block.borderRadius ?? 4}px`,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  boxSizing: 'border-box',
  backgroundColor: props.block.backgroundColor ?? 'transparent',
}))
</script>

<template>
  <div :style="style">
    <input v-if="fillMode"
      type="text"
      :value="block.content ?? 'ORIGINAL'"
      style="border: none; background: transparent; outline: none; padding: 0; font-family: inherit; font-size: inherit; color: inherit; font-weight: inherit; text-transform: uppercase; text-align: center; width: 100%;"
      @input="blockStore.updateBlock(block.id, { content: $event.target.value })"
    />
    <span v-else>{{ block.content ?? 'ORIGINAL' }}</span>
  </div>
</template>
