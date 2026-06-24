<script setup>
import { computed } from 'vue'
import BlockItem from './BlockItem.vue'
import { BLOCK_META } from '../../constants/blockMeta.js'
import { ChevronDown, ChevronRight } from '@lucide/vue'
import * as icons from '@lucide/vue'

const props = defineProps({
  category: { type: Object, required: true },
  collapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

// Resolve the category icon component dynamically
const CategoryIcon = computed(() => icons[props.category.icon] ?? icons.Box)

// Get blocks that have meta definitions
const visibleBlocks = computed(() =>
  props.category.blocks.filter(t => BLOCK_META[t])
)
</script>

<template>
  <div>
    <!-- Category header -->
    <button
      class="block-item"
      style="
        width: 100%;
        border-radius: 0;
        padding: 7px 12px;
        border-bottom: 1px solid var(--color-panel-border);
        background: rgba(0,0,0,0.15);
        cursor: pointer;
      "
      @click="emit('toggle')"
    >
      <component :is="CategoryIcon" :size="13" style="color: var(--color-accent); flex-shrink: 0" />
      <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; flex: 1; color: var(--color-panel-muted); text-align: left">
        {{ category.label }}
      </span>
      <ChevronDown v-if="!collapsed" :size="12" style="color: var(--color-panel-muted)" />
      <ChevronRight v-else :size="12" style="color: var(--color-panel-muted)" />
    </button>

    <!-- Block items -->
    <div v-if="!collapsed">
      <BlockItem
        v-for="blockType in visibleBlocks"
        :key="blockType"
        :block-type="blockType"
        :meta="BLOCK_META[blockType]"
      />
    </div>
  </div>
</template>
