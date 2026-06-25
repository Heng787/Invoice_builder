<script setup>
import { useBlockStore } from '../../../stores/blocks.js'
import { useHistoryStore } from '../../../stores/history.js'
import { useTranslateUi } from '../../../utils/translateUi.js'
const { translateUi } = useTranslateUi()

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
</script>

<template>
  <div class="tab-panel">
    <!-- Fill -->
    <div class="field-group">
      <div class="field-label">{{ translateUi('Fill & Background') }}</div>
      <div class="field-single">
        <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 4px">{{ translateUi('Background Color') }}</label>
        <div style="display: flex; gap: 8px; align-items: center">
          <input
            type="color"
            :value="block.backgroundColor && block.backgroundColor.startsWith('#') ? block.backgroundColor : '#ffffff'"
            class="color-picker-input"
            :disabled="block.locked"
            @input="updateProp('backgroundColor', $event.target.value)"
            @change="commitHistory"
          />
          <input
            type="text"
            :value="block.backgroundColor ?? 'transparent'"
            class="inp"
            placeholder="e.g. #ffffff, transparent"
            :disabled="block.locked"
            @input="updateProp('backgroundColor', $event.target.value)"
            @blur="commitHistory"
          />
        </div>
      </div>
    </div>

    <!-- Borders -->
    <div class="field-group">
      <div class="field-label">{{ translateUi('Borders') }}</div>
      <div class="field-row">
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">{{ translateUi('Border Width') }}</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.borderWidth ?? 0"
              class="inp"
              min="0"
              :disabled="block.locked"
              @input="handleInput('borderWidth', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">{{ translateUi('Border Style') }}</label>
          <select
            :value="block.borderStyle ?? 'solid'"
            class="inp"
            :disabled="block.locked"
            @change="handleInput('borderStyle', $event, false)"
            @blur="commitHistory"
          >
            <option value="solid">{{ translateUi('Solid') }}</option>
            <option value="dashed">{{ translateUi('Dashed') }}</option>
            <option value="dotted">{{ translateUi('Dotted') }}</option>
          </select>
        </div>
      </div>

      <div class="field-row" style="margin-top: 8px">
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 4px">{{ translateUi('Border Color') }}</label>
          <div style="display: flex; gap: 6px; align-items: center">
            <input
              type="color"
              :value="block.borderColor && block.borderColor.startsWith('#') ? block.borderColor : '#000000'"
              class="color-picker-input"
              :disabled="block.locked"
              @input="updateProp('borderColor', $event.target.value)"
              @change="commitHistory"
            />
            <input
              type="text"
              :value="block.borderColor ?? '#000000'"
              class="inp"
              placeholder="#000000"
              :disabled="block.locked"
              @input="updateProp('borderColor', $event.target.value)"
              @blur="commitHistory"
            />
          </div>
        </div>
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">{{ translateUi('Border Radius') }}</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.borderRadius ?? 0"
              class="inp"
              min="0"
              :disabled="block.locked"
              @input="handleInput('borderRadius', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Padding -->
    <div class="field-group">
      <div class="field-label">{{ translateUi('Padding (Offsets)') }}</div>
      <div class="field-row">
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">{{ translateUi('Top') }}</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.paddingTop ?? 0"
              class="inp"
              min="0"
              :disabled="block.locked"
              @input="handleInput('paddingTop', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">{{ translateUi('Right') }}</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.paddingRight ?? 0"
              class="inp"
              min="0"
              :disabled="block.locked"
              @input="handleInput('paddingRight', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
      </div>
      <div class="field-row" style="margin-top: 8px">
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">{{ translateUi('Bottom') }}</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.paddingBottom ?? 0"
              class="inp"
              min="0"
              :disabled="block.locked"
              @input="handleInput('paddingBottom', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
        </div>
        <div>
          <label style="font-size: 10px; color: var(--color-panel-muted); display: block; margin-bottom: 2px">{{ translateUi('Left') }}</label>
          <div class="field-unit">
            <input
              type="number"
              :value="block.paddingLeft ?? 0"
              class="inp"
              min="0"
              :disabled="block.locked"
              @input="handleInput('paddingLeft', $event)"
              @blur="commitHistory"
            />
            <span class="field-unit-label">px</span>
          </div>
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
.color-picker-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--color-panel-border);
  background: none;
  cursor: pointer;
  padding: 0;
}
.color-picker-input::-webkit-color-swatch-wrapper {
  padding: 0;
}
.color-picker-input::-webkit-color-swatch {
  border: none;
  border-radius: 5px;
}
</style>
