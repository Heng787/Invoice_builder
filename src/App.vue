<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import TopBar from './components/TopBar/TopBar.vue'
import LeftPanel from './components/LeftPanel/LeftPanel.vue'
import CanvasWorkspace from './components/Canvas/CanvasWorkspace.vue'
import InspectorPanel from './components/Inspector/InspectorPanel.vue'
import PreviewDataPanel from './components/Inspector/PreviewDataPanel.vue'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts.js'
import { useExport } from './composables/useExport.js'
import { useHistoryStore } from './stores/history.js'
import { useBlockStore } from './stores/blocks.js'
import { useCanvasStore } from './stores/canvas.js'
import { useSettingsStore } from './stores/settings.js'
import { useTemplateStore } from './stores/template.js'
import { usePreviewStore } from './stores/preview.js'

useKeyboardShortcuts()
useExport()

const historyStore = useHistoryStore()
const blockStore = useBlockStore()
const canvasStore = useCanvasStore()
const settingsStore = useSettingsStore()
const templateStore = useTemplateStore()
const previewStore = usePreviewStore()

let originalPreviewMode = false
let originalZoom = 1
let originalFillMode = false

const handleBeforePrint = () => {
  originalPreviewMode = previewStore.isPreviewMode
  originalZoom = canvasStore.zoom
  originalFillMode = canvasStore.fillMode

  previewStore.setPreviewMode(true)
  canvasStore.setZoom(1)
  canvasStore.setFillMode(false)
}

const handleAfterPrint = () => {
  previewStore.setPreviewMode(originalPreviewMode)
  canvasStore.setZoom(originalZoom)
  canvasStore.setFillMode(originalFillMode)
}

onMounted(() => {
  window.addEventListener('beforeprint', handleBeforePrint)
  window.addEventListener('afterprint', handleAfterPrint)

  // Load draft from localStorage if it exists
  const draftStr = localStorage.getItem('invoice_builder_draft')
  let loaded = false
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr)
      if (draft && Array.isArray(draft.blocks)) {
        blockStore.setBlocks(draft.blocks)
        if (draft.format) canvasStore.setFormat(draft.format)
        if (draft.orientation) canvasStore.setOrientation(draft.orientation)
        if (draft.name) templateStore.currentTemplateName = draft.name
        if (draft.templateId) templateStore.currentTemplateId = draft.templateId
        if (draft.settings) {
          if (draft.settings.company) settingsStore.setCompany(draft.settings.company)
          if (draft.settings.documentType) settingsStore.setDocumentType(draft.settings.documentType)
          if (draft.settings.currency) settingsStore.setCurrency(draft.settings.currency)
          if (draft.settings.globalFont) settingsStore.setGlobalFont(draft.settings.globalFont)
          if (draft.settings.globalFontSize) settingsStore.setGlobalFontSize(draft.settings.globalFontSize)
        }
        loaded = true
      }
    } catch (e) {
      console.error('Failed to load draft from localStorage:', e)
    }
  }

  // Load default layout on initial load if no draft loaded and canvas is blank
  if (!loaded && blockStore.blocks.length === 0) {
    const { width, height } = canvasStore.paperDimensions
    blockStore.loadPreset('Custom', width, height)
  }

  // Push initial state to history
  historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)))

  // Listen for save shortcut event
  document.addEventListener('app:save', () => {
    document.dispatchEvent(new CustomEvent('app:do-save'))
  })
})

onUnmounted(() => {
  window.removeEventListener('beforeprint', handleBeforePrint)
  window.removeEventListener('afterprint', handleAfterPrint)
})

// Auto-save watch
watch(
  [
    () => blockStore.blocks,
    () => canvasStore.formatId,
    () => canvasStore.orientation,
    () => settingsStore.company,
    () => settingsStore.documentType,
    () => settingsStore.currency,
    () => settingsStore.globalFont,
    () => settingsStore.globalFontSize,
    () => templateStore.currentTemplateName,
    () => templateStore.currentTemplateId,
  ],
  () => {
    const schema = {
      name: templateStore.currentTemplateName,
      templateId: templateStore.currentTemplateId,
      format: canvasStore.formatId,
      orientation: canvasStore.orientation,
      blocks: JSON.parse(JSON.stringify(blockStore.blocks)),
      settings: {
        company: settingsStore.company,
        documentType: settingsStore.documentType,
        currency: settingsStore.currency,
        globalFont: settingsStore.globalFont,
        globalFontSize: settingsStore.globalFontSize,
      },
    }
    localStorage.setItem('invoice_builder_draft', JSON.stringify(schema))
  },
  { deep: true }
)
</script>

<template>
  <div class="app-layout" :class="{ 'preview-mode-active': previewStore.isPreviewMode }">
    <TopBar />
    <div class="app-main">
      <LeftPanel v-if="!previewStore.isPreviewMode" />
      <CanvasWorkspace />
      <PreviewDataPanel v-if="previewStore.isPreviewMode" />
      <InspectorPanel v-else />
    </div>
  </div>
</template>
