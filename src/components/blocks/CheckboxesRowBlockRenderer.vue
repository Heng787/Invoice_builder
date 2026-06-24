<script setup>
import { computed } from 'vue'
import { useBlockStore } from '../../stores/blocks.js'

const props = defineProps({
  block: { type: Object, required: true },
  fillMode: { type: Boolean, default: false },
})
const blockStore = useBlockStore()

const options = computed(() => props.block.options ?? [
  { label: 'Cash', checked: false },
  { label: 'Transfer', checked: false },
  { label: 'Credit', checked: false },
])

function toggleOption(index) {
  const newOptions = JSON.parse(JSON.stringify(options.value))
  newOptions[index].checked = !newOptions[index].checked
  blockStore.updateBlock(props.block.id, { options: newOptions })
}

function updateOptionLabel(index, val) {
  const newOptions = JSON.parse(JSON.stringify(options.value))
  newOptions[index].label = val
  blockStore.updateBlock(props.block.id, { options: newOptions })
}

const style = computed(() => ({
  width: '100%', height: '100%',
  display: 'flex', alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  padding: `${props.block.paddingTop ?? 4}px ${props.block.paddingRight ?? 8}px ${props.block.paddingBottom ?? 4}px ${props.block.paddingLeft ?? 8}px`,
  fontFamily: props.block.fontFamily ?? 'inherit',
  fontSize: `${props.block.fontSize ?? 13}px`,
  color: props.block.color ?? '#000000',
  boxSizing: 'border-box',
}))
</script>

<template>
  <div :style="style">
    <div
      v-for="(opt, i) in options"
      :key="i"
      :style="{ display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }"
    >
      <span style="font-size: 1.1em; line-height: 1; cursor: pointer;" @click.stop="toggleOption(i)">
        {{ opt.checked ? '☑' : '☐' }}
      </span>
      <input v-if="fillMode"
        type="text"
        :value="opt.label"
        style="border: none; background: transparent; outline: none; padding: 0; font-family: inherit; font-size: inherit; color: inherit; width: 80px;"
        @input="updateOptionLabel(i, $event.target.value)"
      />
      <span v-else>{{ opt.label }}</span>
    </div>
  </div>
</template>
