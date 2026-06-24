<script setup>
import { computed } from 'vue'
import { useBlockStore } from '../../stores/blocks.js'

const props = defineProps({
  block: { type: Object, required: true },
  fillMode: { type: Boolean, default: false },
})
const blockStore = useBlockStore()

function update(prop, val) {
  blockStore.updateBlock(props.block.id, { [prop]: val })
}

const containerStyle = computed(() => ({
  width: '100%', height: '100%',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: `${props.block.paddingTop ?? 4}px ${props.block.paddingRight ?? 8}px ${props.block.paddingBottom ?? 4}px ${props.block.paddingLeft ?? 8}px`,
  boxSizing: 'border-box',
  fontFamily: props.block.fontFamily ?? 'inherit',
  textAlign: 'center',
  gap: '3px',
  backgroundColor: props.block.backgroundColor ?? 'transparent',
}))

const inputStyle = {
  background: 'transparent', border: 'none',
  borderBottom: '1px solid rgba(0,180,216,0.4)',
  outline: 'none', textAlign: 'center', width: '100%',
  fontFamily: 'inherit', boxSizing: 'border-box',
}
</script>

<template>
  <div :style="containerStyle">
    <input v-if="fillMode" type="text" :value="block.message ?? ''" placeholder="Thank you for your purchase!"
      :style="{ ...inputStyle, fontSize: `${block.fontSize ?? 11}px`, fontWeight: '500', color: block.color ?? '#000' }"
      @input="update('message', $event.target.value)" />
    <div v-else :style="{ fontSize: `${block.fontSize ?? 11}px`, fontWeight: '500', color: block.color ?? '#000' }">
      {{ block.message || 'Thank you for your purchase!' }}
    </div>

    <input v-if="fillMode" type="text" :value="block.policy ?? ''" placeholder="No returns after 7 days"
      :style="{ ...inputStyle, fontSize: `${block.smallFontSize ?? 10}px`, color: block.mutedColor ?? '#888' }"
      @input="update('policy', $event.target.value)" />
    <div v-else :style="{ fontSize: `${block.smallFontSize ?? 10}px`, color: block.mutedColor ?? '#888' }">
      {{ block.policy || 'No returns after 7 days' }}
    </div>
  </div>
</template>
