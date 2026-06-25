<script setup>
import { computed, ref } from 'vue'
import { useHistoryStore } from '../../../stores/history.js'
import { useBlockStore } from '../../../stores/blocks.js'
import { RotateCcw, RotateCw, Trash2, HelpCircle } from '@lucide/vue'
import ConfirmModal from '../../common/ConfirmModal.vue'
import { useTranslateUi } from '../../../utils/translateUi.js'
const { translateUi } = useTranslateUi()

const historyStore = useHistoryStore()
const blockStore = useBlockStore()
const showClearConfirm = ref(false)

const undoCount = computed(() => historyStore.stack.length - 1)
const redoCount = computed(() => historyStore.future.length)

function handleUndo() {
  const snapshot = historyStore.undo()
  if (snapshot) blockStore.setBlocks(snapshot)
}

function handleRedo() {
  const snapshot = historyStore.redo()
  if (snapshot) blockStore.setBlocks(snapshot)
}

function handleClearAll() {
  showClearConfirm.value = true
}

function confirmClearAll() {
  blockStore.clearAll()
  historyStore.clear()
  historyStore.push([])
  showClearConfirm.value = false
}
</script>

<template>
  <div class="tab-panel">
    <div class="field-group">
      <div class="field-label">{{ translateUi('History Management') }}</div>
      <p style="font-size: 11px; color: var(--color-panel-muted); margin-bottom: 12px; line-height: 1.4">
        {{ translateUi('Undo or redo recently made changes. The builder stores up to 50 edits.') }}
      </p>

      <!-- Quick Actions -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px">
        <button
          class="btn btn-panel"
          style="flex: 1"
          :disabled="!historyStore.canUndo"
          @click="handleUndo"
        >
          <RotateCcw :size="13" />
          <span>{{ translateUi('Undo') }} ({{ undoCount > 0 ? undoCount : 0 }})</span>
        </button>
        <button
          class="btn btn-panel"
          style="flex: 1"
          :disabled="!historyStore.canRedo"
          @click="handleRedo"
        >
          <RotateCw :size="13" />
          <span>{{ translateUi('Redo') }} ({{ redoCount }})</span>
        </button>
      </div>

      <div class="divider" />
      
      <!-- Reset Action -->
      <div style="margin-top: 12px">
        <button
          class="btn btn-danger"
          style="display: flex; gap: 6px; width: 100%; justify-content: center"
          @click="handleClearAll"
        >
          <Trash2 :size="13" />
          <span>{{ translateUi('Clear Canvas Template') }}</span>
        </button>
      </div>
    </div>

    <!-- Info Box -->
    <div class="field-group" style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; border: none">
      <div
        style="
          background: rgba(0,180,216,0.05);
          border: 1px solid var(--color-panel-border);
          border-radius: 6px;
          padding: 10px;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        "
      >
        <HelpCircle :size="16" class="text-[var(--color-accent)]" style="flex-shrink: 0; margin-top: 1px" />
        <div style="font-size: 11px; line-height: 1.4; color: var(--color-panel-text)">
          <strong style="display: block; margin-bottom: 2px">{{ translateUi('Keyboard Shortcuts') }}</strong>
          <ul style="margin: 0; padding-left: 14px">
            <li>{{ translateUi('Undo') }}: <code style="color: var(--color-accent)">Ctrl + Z</code></li>
            <li>{{ translateUi('Redo') }}: <code style="color: var(--color-accent)">Ctrl + Y</code> or <code style="color: var(--color-accent)">Ctrl + Shift + Z</code></li>
            <li>{{ translateUi('Duplicate Block') }}: <code style="color: var(--color-accent)">Ctrl + D</code></li>
            <li>{{ translateUi('Delete Block') }}: <code style="color: var(--color-accent)">Delete</code></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmModal
      :show="showClearConfirm"
      :title="translateUi('Clear Canvas')"
      :message="translateUi('Are you sure you want to clear the entire canvas? This cannot be undone.')"
      :confirm-text="translateUi('Clear All')"
      type="danger"
      @confirm="confirmClearAll"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<style scoped>
.tab-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
