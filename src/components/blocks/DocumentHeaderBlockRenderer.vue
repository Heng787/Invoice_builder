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

const titleStyle = computed(() => ({
  fontFamily: props.block.fontFamily ?? 'inherit',
  fontSize: `${props.block.titleSize ?? 24}px`,
  fontWeight: 'bold',
  color: props.block.titleColor ?? '#1a1a2e',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '6px',
  width: '100%',
}))

const metaStyle = computed(() => ({
  fontFamily: props.block.fontFamily ?? 'inherit',
  fontSize: `${props.block.fontSize ?? 12}px`,
  color: props.block.color ?? '#333333',
  width: '100%',
  display: 'flex',
  gap: '4px',
  marginBottom: '2px',
}))

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  padding: `${props.block.paddingTop ?? 4}px ${props.block.paddingRight ?? 8}px ${props.block.paddingBottom ?? 4}px ${props.block.paddingLeft ?? 8}px`,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: props.block.backgroundColor ?? 'transparent',
}))
</script>

<template>
  <div :style="containerStyle">
    <!-- Document Title -->
    <template v-if="fillMode">
      <input
        type="text"
        :value="block.title ?? 'INVOICE'"
        :style="{ ...titleStyle, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(0,180,216,0.4)', outline: 'none', boxSizing: 'border-box' }"
        @input="update('title', $event.target.value)"
      />
    </template>
    <template v-else>
      <div :style="titleStyle">{{ block.title ?? 'INVOICE' }}</div>
    </template>

    <!-- Meta fields: Number, Date, Due Date, Ref -->
    <div v-if="block.showNumber !== false" :style="metaStyle">
      <span style="font-weight: 600; min-width: 80px; opacity: 0.7">No:</span>
      <input v-if="fillMode" type="text" :value="block.docNumber ?? 'INV-0001'"
        style="flex:1; background:transparent; border:none; border-bottom:1px solid rgba(0,180,216,0.4); outline:none; font-family:inherit; font-size:inherit; color:inherit;"
        @input="update('docNumber', $event.target.value)" />
      <span v-else>{{ block.docNumber ?? 'INV-0001' }}</span>
    </div>

    <div v-if="block.showDate !== false" :style="metaStyle">
      <span style="font-weight: 600; min-width: 80px; opacity: 0.7">Date:</span>
      <input v-if="fillMode" type="text" :value="block.docDate ?? ''"
        placeholder="DD/MM/YYYY"
        style="flex:1; background:transparent; border:none; border-bottom:1px solid rgba(0,180,216,0.4); outline:none; font-family:inherit; font-size:inherit; color:inherit;"
        @input="update('docDate', $event.target.value)" />
      <span v-else>{{ block.docDate || 'DD/MM/YYYY' }}</span>
    </div>

    <div v-if="block.showDueDate !== false" :style="metaStyle">
      <span style="font-weight: 600; min-width: 80px; opacity: 0.7">Due:</span>
      <input v-if="fillMode" type="text" :value="block.dueDate ?? ''"
        placeholder="DD/MM/YYYY"
        style="flex:1; background:transparent; border:none; border-bottom:1px solid rgba(0,180,216,0.4); outline:none; font-family:inherit; font-size:inherit; color:inherit;"
        @input="update('dueDate', $event.target.value)" />
      <span v-else>{{ block.dueDate || 'DD/MM/YYYY' }}</span>
    </div>

    <div v-if="block.showRef !== false && (block.docRef || fillMode)" :style="metaStyle">
      <span style="font-weight: 600; min-width: 80px; opacity: 0.7">Ref:</span>
      <input v-if="fillMode" type="text" :value="block.docRef ?? ''"
        style="flex:1; background:transparent; border:none; border-bottom:1px solid rgba(0,180,216,0.4); outline:none; font-family:inherit; font-size:inherit; color:inherit;"
        @input="update('docRef', $event.target.value)" />
      <span v-else>{{ block.docRef }}</span>
    </div>
  </div>
</template>
