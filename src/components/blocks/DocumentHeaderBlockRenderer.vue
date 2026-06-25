<script setup>
import { computed } from 'vue'
import { useBlockStore } from '../../stores/blocks.js'
import { usePreviewStore } from '../../stores/preview.js'

const previewStore = usePreviewStore()

function getFieldValue(bindingKey, designFallback, previewFallback = '') {
  if (previewStore.isPreviewMode) {
    if (!bindingKey) return designFallback;
    const dataVal = previewStore.previewData[bindingKey];
    if (dataVal !== undefined && dataVal !== null && dataVal !== '') {
      return String(dataVal);
    }
    return previewFallback || designFallback;
  }
  return designFallback;
}

const props = defineProps({
  block: { type: Object, required: true },
  fillMode: { type: Boolean, default: false },
})
const blockStore = useBlockStore()

const getPlaceholder = (key) => key ? `{{${key}}}` : "";

function update(prop, val) {
  blockStore.updateBlock(props.block.id, { [prop]: val })
}

const titleStyle = computed(() => ({
  fontFamily: props.block.fontFamily ?? 'inherit',
  fontSize: `${props.block.titleSize ?? 24}px`,
  fontWeight: 'bold',
  color: props.block.titleColor ?? '#1a1a2e',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '6px',
  width: '100%',
}))

const metaStyle = computed(() => ({
  fontFamily: props.block.fontFamily ?? 'inherit',
  fontSize: `${props.block.fontSize ?? 12}px`,
  color: props.block.color ?? '#333333',
  width: '100%',
  display: 'flex',
  gap: '4px',
  marginBottom: '2px',
}))

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  padding: `${props.block.paddingTop ?? 4}px ${props.block.paddingRight ?? 8}px ${props.block.paddingBottom ?? 4}px ${props.block.paddingLeft ?? 8}px`,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: props.block.backgroundColor ?? 'transparent',
}))
</script>

<template>
  <div :style="containerStyle">
    <!-- Document Title -->
    <template v-if="fillMode">
      <input
        type="text"
        :value="block.title ?? 'INVOICE'"
        :style="{ ...titleStyle, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(0,180,216,0.4)', outline: 'none', boxSizing: 'border-box' }"
        @input="update('title', $event.target.value)"
      />
    </template>
    <template v-else>
      <template v-if="block.titleBindingKey">
        <div class="design-binding-only" :style="titleStyle">
          <span style="color: #00b4d8;">{{ getPlaceholder(block.titleBindingKey) }}</span>
          <div style="font-size: 10px; color: #718096; text-transform: none; font-weight: normal; font-style: italic; letter-spacing: 0; margin-top: 1px;">
            fallback: {{ block.title ?? 'INVOICE' }}
          </div>
        </div>
        <div class="preview-binding-only" :style="titleStyle">
          {{ getFieldValue(block.titleBindingKey, block.title ?? 'INVOICE') }}
        </div>
      </template>
      <div v-else :style="titleStyle">
        {{ block.title ?? 'INVOICE' }}
      </div>
    </template>

    <!-- Meta fields: Number, Date, Due Date, Ref -->
    <div v-if="block.showNumber !== false" :style="metaStyle">
      <span style="font-weight: 600; min-width: 80px; opacity: 0.7">No:</span>
      <template v-if="fillMode">
        <input type="text" :value="block.docNumber ?? 'INV-0001'"
          style="flex:1; background:transparent; border:none; border-bottom:1px solid rgba(0,180,216,0.4); outline:none; font-family:inherit; font-size:inherit; color:inherit;"
          @input="update('docNumber', $event.target.value)" />
      </template>
      <template v-else>
        <template v-if="block.numberBindingKey">
          <div class="design-binding-only" style="display: flex; flex-direction: column;">
            <span style="color: #00b4d8; font-weight: 600;">{{ getPlaceholder(block.numberBindingKey) }}</span>
            <span style="font-size: 9px; color: #718096; font-style: italic;">fallback: {{ block.docNumber ?? 'INV-0001' }}</span>
          </div>
          <span class="preview-binding-only">
            {{ getFieldValue(block.numberBindingKey, block.docNumber ?? 'INV-0001') }}
          </span>
        </template>
        <span v-else>{{ block.docNumber ?? 'INV-0001' }}</span>
      </template>
    </div>

    <div v-if="block.showDate !== false" :style="metaStyle">
      <span style="font-weight: 600; min-width: 80px; opacity: 0.7">Date:</span>
      <template v-if="fillMode">
        <input type="text" :value="block.docDate ?? ''"
          placeholder="DD/MM/YYYY"
          style="flex:1; background:transparent; border:none; border-bottom:1px solid rgba(0,180,216,0.4); outline:none; font-family:inherit; font-size:inherit; color:inherit;"
          @input="update('docDate', $event.target.value)" />
      </template>
      <template v-else>
        <template v-if="block.dateBindingKey">
          <div class="design-binding-only" style="display: flex; flex-direction: column;">
            <span style="color: #00b4d8; font-weight: 600;">{{ getPlaceholder(block.dateBindingKey) }}</span>
            <span style="font-size: 9px; color: #718096; font-style: italic;">fallback: {{ block.docDate || 'DD/MM/YYYY' }}</span>
          </div>
          <span class="preview-binding-only">
            {{ getFieldValue(block.dateBindingKey, block.docDate || 'DD/MM/YYYY') }}
          </span>
        </template>
        <span v-else>{{ block.docDate || 'DD/MM/YYYY' }}</span>
      </template>
    </div>

    <div v-if="block.showDueDate !== false" :style="metaStyle">
      <span style="font-weight: 600; min-width: 80px; opacity: 0.7">Due:</span>
      <template v-if="fillMode">
        <input type="text" :value="block.dueDate ?? ''"
          placeholder="DD/MM/YYYY"
          style="flex:1; background:transparent; border:none; border-bottom:1px solid rgba(0,180,216,0.4); outline:none; font-family:inherit; font-size:inherit; color:inherit;"
          @input="update('dueDate', $event.target.value)" />
      </template>
      <template v-else>
        <template v-if="block.dueDateBindingKey">
          <div class="design-binding-only" style="display: flex; flex-direction: column;">
            <span style="color: #00b4d8; font-weight: 600;">{{ getPlaceholder(block.dueDateBindingKey) }}</span>
            <span style="font-size: 9px; color: #718096; font-style: italic;">fallback: {{ block.dueDate || 'DD/MM/YYYY' }}</span>
          </div>
          <span class="preview-binding-only">
            {{ getFieldValue(block.dueDateBindingKey, block.dueDate || 'DD/MM/YYYY') }}
          </span>
        </template>
        <span v-else>{{ block.dueDate || 'DD/MM/YYYY' }}</span>
      </template>
    </div>

    <div v-if="block.showRef !== false && (block.docRef || fillMode || block.refBindingKey)" :style="metaStyle">
      <span style="font-weight: 600; min-width: 80px; opacity: 0.7">Ref:</span>
      <template v-if="fillMode">
        <input type="text" :value="block.docRef ?? ''"
          style="flex:1; background:transparent; border:none; border-bottom:1px solid rgba(0,180,216,0.4); outline:none; font-family:inherit; font-size:inherit; color:inherit;"
          @input="update('docRef', $event.target.value)" />
      </template>
      <template v-else>
        <template v-if="block.refBindingKey">
          <div class="design-binding-only" style="display: flex; flex-direction: column;">
            <span style="color: #00b4d8; font-weight: 600;">{{ getPlaceholder(block.refBindingKey) }}</span>
            <span style="font-size: 9px; color: #718096; font-style: italic;">fallback: {{ block.docRef || '(none)' }}</span>
          </div>
          <span class="preview-binding-only">
            {{ getFieldValue(block.refBindingKey, block.docRef ?? '') }}
          </span>
        </template>
        <span v-else>{{ block.docRef }}</span>
      </template>
    </div>
  </div>
</template>
