<script setup>
import { computed } from 'vue'
import { useBlockStore } from '../../../stores/blocks.js'
import { useHistoryStore } from '../../../stores/history.js'

const props = defineProps({
  block: { type: Object, required: true }
})

const blockStore = useBlockStore()
const historyStore = useHistoryStore()

function updateProp(prop, val) {
  blockStore.updateBlock(props.block.id, { [prop]: val })
}

function commitHistory() {
  historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)))
}

function handleInput(prop, e, isNum = true) {
  const val = isNum ? parseFloat(e.target.value) : e.target.value
  if (!isNaN(val) || !isNum) {
    updateProp(prop, val)
  }
}

function handleCheckbox(prop, e) {
  updateProp(prop, e.target.checked)
  commitHistory()
}
</script>

<template>
  <div class="tab-panel">
    <!-- Position & Dimensions -->
    <div class="field-group">
      <div class="field-label">Position & Size</div>
      <div class="field-row">
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">X Position</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.x"
              class="inp"
              :disabled="block.locked"
              @input="handleInput('x', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">Y Position</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.y"
              class="inp"
              :disabled="block.locked"
              @input="handleInput('y', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
      </div>

      <div class="field-row" style="margin-top: 8px">
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">Width</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.width"
              class="inp"
              min="10"
              :disabled="block.locked"
              @input="handleInput('width', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">Height</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.height"
              class="inp"
              min="10"
              :disabled="block.locked"
              @input="handleInput('height', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Transform -->
    <div class="field-group">
      <div class="field-label">Transform</div>
      <div class="field-row">
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">Rotation</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.rotation ?? 0"
              class="inp"
              min="-360"
              max="360"
              :disabled="block.locked"
              @input="handleInput('rotation', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">°</span>
          </div>
        </div>
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">Layer Order</label>
          <input
            type="number"
            :value="block.zIndex ?? 0"
            class="inp"
            disabled
            style="opacity: 0.65"
          />
        </div>
      </div>

      <div class="field-single" style="margin-top: 10px">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
          <span style="font-size: 10px; color: var(--color-panel-muted)">Rotation Slider</span>
          <span style="font-size: 11px">{{ block.rotation ?? 0 }}°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          :value="block.rotation ?? 0"
          class="slider"
          :disabled="block.locked"
          @input="handleInput('rotation', $event)"
          @change="commitHistory"
        />
      </div>
    </div>

    <!-- Visibility & States -->
    <div class="field-group">
      <div class="field-label">Visibility & State</div>
      
      <!-- Opacity -->
      <div class="field-single" style="margin-bottom: 14px">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
          <span style="font-size: 10px; color: var(--color-panel-muted)">Opacity</span>
          <span style="font-size: 11px">{{ Math.round((block.opacity ?? 1) * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          :value="block.opacity ?? 1"
          class="slider"
          :disabled="block.locked"
          @input="handleInput('opacity', $event)"
          @change="commitHistory"
        />
      </div>

      <!-- Toggles -->
      <div style="display: flex; flex-direction: column; gap: 10px">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <div>
            <span style="font-weight: 500; display: block">Lock Position</span>
            <span style="font-size: 11px; color: var(--color-panel-muted)">Disable resizing and dragging</span>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              :checked="block.locked"
              @change="handleCheckbox('locked', $event)"
            />
            <span class="toggle-track" />
          </label>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between">
          <div>
            <span style="font-weight: 500; display: block">Hide on Print</span>
            <span style="font-size: 11px; color: var(--color-panel-muted)">Exclude this block from exports</span>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              :checked="block.hideOnPrint"
              @change="handleCheckbox('hideOnPrint', $event)"
            />
            <span class="toggle-track" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-panel {
  display: flex;
  flex-direction: column;
}
</style>
