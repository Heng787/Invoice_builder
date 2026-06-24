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
  gap: '2px',
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
    <!-- Shop Name -->
    <input v-if="fillMode" type="text" :value="block.shopName ?? ''" placeholder="Shop Name"
      :style="{ ...inputStyle, fontSize: `${block.titleSize ?? 16}px`, fontWeight: 'bold' }"
      @input="update('shopName', $event.target.value)" />
    <div v-else :style="{ fontSize: `${block.titleSize ?? 16}px`, fontWeight: 'bold', color: block.color ?? '#000' }">
      {{ block.shopName || 'Shop Name' }}
    </div>

    <!-- Address -->
    <input v-if="fillMode" type="text" :value="block.address ?? ''" placeholder="Address"
      :style="{ ...inputStyle, fontSize: `${block.fontSize ?? 12}px`, color: block.mutedColor ?? '#555' }"
      @input="update('address', $event.target.value)" />
    <div v-else :style="{ fontSize: `${block.fontSize ?? 12}px`, color: block.mutedColor ?? '#555' }">
      {{ block.address || 'Address' }}
    </div>

    <!-- Phone -->
    <input v-if="fillMode" type="text" :value="block.phone ?? ''" placeholder="Tel: 012 345 678"
      :style="{ ...inputStyle, fontSize: `${block.fontSize ?? 12}px`, color: block.mutedColor ?? '#555' }"
      @input="update('phone', $event.target.value)" />
    <div v-else :style="{ fontSize: `${block.fontSize ?? 12}px`, color: block.mutedColor ?? '#555' }">
      {{ block.phone || 'Tel: 012 345 678' }}
    </div>
  </div>
</template>
