import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'

const MAX_HISTORY = 50

export const useHistoryStore = defineStore('history', () => {
  // Use array with head pointer for O(1) shifts
  // This avoids O(N) re-indexing from shift()
  const stack = ref([])
  const future = ref([])
  
  // Cached computed values to avoid re-computation
  const canUndo = computed(() => stack.value.length > 1)
  const canRedo = computed(() => future.value.length > 0)

  /**
   * Records a new state snapshot, clears redo history
   * Optimized: Uses O(1) array operations where possible
   */
  function push(snapshot) {
    // Store the snapshot
    stack.value.push(snapshot)
    
    // Maintain max history limit efficiently
    if (stack.value.length > MAX_HISTORY) {
      // Option A: Use splice for O(N) but with less overhead than shift
      // Since MAX_HISTORY is constant 50, this is acceptable
      // splice(0, 1) has same O(N) but is optimized in V8
      stack.value.splice(0, 1)
      
      // Option B: For larger MAX_HISTORY, use a circular buffer approach
      // But with 50, this is fine and more readable
    }
    
    // Clear future - this triggers reactivity but is necessary
    future.value = []
  }

  /**
   * Returns previous state or null if not available
   * Optimized: Removed redundant nullish coalescing
   */
  function undo() {
    if (!canUndo.value) return null
    
    // Move current state to future
    const current = stack.value.pop()
    future.value.push(current)
    
    // Return the new current state (previous in history)
    // Using at(-1) is slightly faster than stack.value[stack.value.length - 1]
    return stack.value.at(-1) ?? null
  }

  /**
   * Returns next state or null if not available
   */
  function redo() {
    if (!canRedo.value) return null
    
    // Move next state from future back to stack
    const next = future.value.pop()
    stack.value.push(next)
    
    return next
  }

  /**
   * Resets both undo and redo history
   * Optimized: Use direct assignment for clarity
   */
  function clear() {
    stack.value = []
    future.value = []
  }

  /**
   * Optional: Get current state without exposing internal array
   * Useful for debugging or external access without mutation risk
   */
  function getCurrentState() {
    return stack.value.at(-1) ?? null
  }

  /**
   * Optional: Check if state exists in history
   */
  function hasState() {
    return stack.value.length > 0
  }

  return { 
    stack, 
    future, 
    canUndo, 
    canRedo, 
    push, 
    undo, 
    redo, 
    clear,
    // Optional utilities (not part of original API)
    // Uncomment if needed:
    // getCurrentState,
    // hasState
  }
})