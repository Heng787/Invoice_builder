import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInspectorStore = defineStore('inspector', () => {
  const activeTab = ref('layout') // 'layout' | 'style' | 'text' | 'data' | 'block' | 'responsive' | 'history'

  function setTab(tab) {
    activeTab.value = tab
  }

  return { activeTab, setTab }
})
