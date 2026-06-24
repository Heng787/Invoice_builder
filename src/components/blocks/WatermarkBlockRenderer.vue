<script setup>
import { computed } from 'vue'
import { useBlockStore } from '../../stores/blocks.js'

const props = defineProps({
  block: { type: Object, required: true },
  fillMode: { type: Boolean, default: false },
})

const blockStore = useBlockStore()

const style = computed(() => ({
  width: '100%',
  height: '100%',
  padding: `${props.block.paddingTop ?? 4}px ${props.block.paddingRight ?? 8}px ${props.block.paddingBottom ?? 4}px ${props.block.paddingLeft ?? 8}px`,
  fontFamily: props.block.fontFamily ?? 'inherit',
  fontSize: `${props.block.fontSize ?? 72}px`,
  fontWeight: props.block.fontWeight ?? 'bold',
  fontStyle: props.block.fontStyle ?? 'normal',
  color: props.block.color ?? 'rgba(200,200,200,0.3)',
  backgroundColor: props.block.backgroundColor ?? 'transparent',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  pointerEvents: props.fillMode ? 'auto' : 'none', // Allow clicking/editing when fillMode is true
  userSelect: 'none',
  border: props.block.borderWidth
    ? `${props.block.borderWidth}px ${props.block.borderStyle ?? 'solid'} ${props.block.borderColor ?? '#000'}`
    : 'none',
  borderRadius: `${props.block.borderRadius ?? 0}px`,
}))
</script>

<template>
  <div :style="style">
    <input v-if="fillMode"
      type="text"
      :value="block.content ?? 'DRAFT'"
      style="border: none; background: transparent; outline: none; padding: 0; font-family: inherit; font-size: inherit; color: inherit; font-weight: inherit; text-transform: uppercase; text-align: center; width: 100%;"
      @input="blockStore.updateBlock(block.id, { content: $event.target.value })"
    />
    <span v-else style="display: block; white-space: nowrap">
      {{ block.content || 'DRAFT' }}
    </span>
  </div>
</template>
