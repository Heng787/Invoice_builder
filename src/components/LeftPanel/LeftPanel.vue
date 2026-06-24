<script setup>
import { ref } from 'vue'
import BlockLibrary from './BlockLibrary.vue'
import LayersPanel from './LayersPanel.vue'
import { Layers, Library } from '@lucide/vue'

const activeTab = ref('blocks') // 'blocks' | 'layers'
</script>

<template>
  <aside class="panel" style="
    width: 240px;
    min-width: 240px;
    max-width: 240px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--color-panel-border);
    box-shadow: var(--shadow-panel);
    overflow: hidden;
  ">
    <!-- Tab switcher -->
    <div style="
      display: flex;
      border-bottom: 1px solid var(--color-panel-border);
      padding: 4px 6px;
      gap: 2px;
    ">
      <button
        class="inspector-tab"
        :class="{ active: activeTab === 'blocks' }"
        style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px"
        @click="activeTab = 'blocks'"
      >
        <Library :size="12" />
        Blocks
      </button>
      <button
        class="inspector-tab"
        :class="{ active: activeTab === 'layers' }"
        style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px"
        @click="activeTab = 'layers'"
      >
        <Layers :size="12" />
        Layers
      </button>
    </div>

    <!-- Content -->
    <div style="flex: 1; overflow-y: auto; overflow-x: hidden">
      <BlockLibrary v-if="activeTab === 'blocks'" />
      <LayersPanel v-else />
    </div>
  </aside>
</template>
