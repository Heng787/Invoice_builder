import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const MAX_HISTORY = 50

export const useHistoryStore = defineStore('history', () => {
  const stack = ref([])   // past states
  const future = ref([])  // redo states

  const canUndo = computed(() => stack.value.length > 1)
  const canRedo = computed(() => future.value.length > 0)

  /**
   * Push a new snapshot to history
   * @param {any} snapshot — serializable state (e.g. JSON.stringify of blocks array)
   */
  function push(snapshot) {
    stack.value.push(snapshot)
    if (stack.value.length > MAX_HISTORY) {
      stack.value.shift()
    }
    future.value = [] // clear redo on new action
  }

  /**
   * Undo: returns the previous snapshot to restore
   */
  function undo() {
    if (!canUndo.value) return null
    const current = stack.value.pop()
    future.value.push(current)
    return stack.value[stack.value.length - 1] ?? null
  }

  /**
   * Redo: returns the next snapshot to restore
   */
  function redo() {
    if (!canRedo.value) return null
    const next = future.value.pop()
    stack.value.push(next)
    return next
  }

  function clear() {
    stack.value = []
    future.value = []
  }

  return { stack, future, canUndo, canRedo, push, undo, redo, clear }
})
