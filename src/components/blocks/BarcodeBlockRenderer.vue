<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import JsBarcode from 'jsbarcode';
import { usePreviewStore } from '../../stores/preview.js';
import { useTranslateUi } from '../../utils/translateUi.js';

const props = defineProps({
  block: { type: Object, required: true }
});

const previewStore = usePreviewStore();
const { translateUi } = useTranslateUi();

const barcodeDataUrl = ref('');
const errorMsg = ref(null);

// Determine the value to encode based on mode and binding key
const valueToEncode = computed(() => {
  const bindingKey = props.block.bindingKey;
  
  if (previewStore.isPreviewMode) {
    if (bindingKey) {
      const dataVal = previewStore.previewData[bindingKey];
      if (dataVal !== undefined && dataVal !== null && dataVal !== '') {
        return String(dataVal);
      }
      return props.block.bindingFallback || props.block.content || '';
    }
    return props.block.content || '';
  } else {
    // Design mode
    if (bindingKey) {
      return props.block.bindingFallback || props.block.content || '';
    }
    return props.block.content || '';
  }
});

// Helper to provide descriptive validation errors
const getDetailedError = (format, val, originalError) => {
  const cleanFormat = (format || "CODE128").toUpperCase();
  const rawMsg = originalError?.message || "";
  
  if (cleanFormat === "EAN13") {
    if (!/^\d+$/.test(val)) return "Invalid value for EAN13 — requires numeric digits only";
    if (val.length !== 12 && val.length !== 13) {
      return "Invalid value for EAN13 — requires 12 or 13 digits";
    }
  }
  if (cleanFormat === "EAN8") {
    if (!/^\d+$/.test(val)) return "Invalid value for EAN8 — requires numeric digits only";
    if (val.length !== 7 && val.length !== 8) {
      return "Invalid value for EAN8 — requires 7 or 8 digits";
    }
  }
  if (cleanFormat === "UPC") {
    if (!/^\d+$/.test(val)) return "Invalid value for UPC — requires numeric digits only";
    if (val.length !== 11 && val.length !== 12) {
      return "Invalid value for UPC — requires 11 or 12 digits";
    }
  }
  if (cleanFormat === "ITF14") {
    if (!/^\d+$/.test(val)) return "Invalid value for ITF-14 — requires numeric digits only";
    if (val.length !== 13 && val.length !== 14) {
      return "Invalid value for ITF-14 — requires 13 or 14 digits";
    }
  }
  if (cleanFormat === "PHARMACODE") {
    if (!/^\d+$/.test(val)) return "Invalid value for Pharmacode — requires numbers only";
    const num = parseInt(val, 10);
    if (num < 3 || num > 131070) {
      return "Invalid value for Pharmacode — value must be between 3 and 131070";
    }
  }
  
  if (rawMsg.includes("is not a valid value")) {
    return `Barcode error: "${val}" is not valid for ${format}`;
  }
  
  return `Barcode error: check value format (${rawMsg || 'invalid input'})`;
};

// Generate barcode using JsBarcode offscreen
const generate = () => {
  const value = valueToEncode.value;
  if (!value) {
    barcodeDataUrl.value = '';
    errorMsg.value = 'Empty barcode value';
    return;
  }

  try {
    const canvas = document.createElement('canvas');
    const format = props.block.format || "CODE128";
    
    JsBarcode(canvas, value, {
      format: format,
      width: props.block.barWidth || 2,
      height: props.block.barHeight || 50,
      displayValue: props.block.displayValue !== false,
      fontSize: props.block.fontSize || 12,
      font: "monospace",
      background: props.block.backgroundColor === 'transparent' ? 'rgba(0,0,0,0)' : (props.block.backgroundColor || '#ffffff'),
      lineColor: props.block.lineColor || props.block.barcodeColor || '#000000',
      margin: props.block.margin ?? 10,
    });
    
    barcodeDataUrl.value = canvas.toDataURL("image/png");
    errorMsg.value = null;
  } catch (err) {
    barcodeDataUrl.value = '';
    errorMsg.value = getDetailedError(props.block.format, value, err);
  }
};

// Watch all relevant props to regenerate
watch(
  [
    valueToEncode,
    () => props.block.format,
    () => props.block.barWidth,
    () => props.block.barHeight,
    () => props.block.displayValue,
    () => props.block.fontSize,
    () => props.block.backgroundColor,
    () => props.block.lineColor,
    () => props.block.barcodeColor,
    () => props.block.margin
  ],
  generate,
  { immediate: true }
);

onMounted(generate);
</script>

<template>
  <div class="barcode-container">
    <!-- Visual tag in editor to show the variable binding key -->
    <div
      v-if="!previewStore.isPreviewMode && props.block.bindingKey"
      class="binding-badge"
    >
      {{ props.block.bindingKey }}
    </div>

    <img
      v-if="barcodeDataUrl"
      :src="barcodeDataUrl"
      class="barcode-img"
      draggable="false"
    />
    
    <div
      v-else
      class="barcode-error-panel"
    >
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 5v14M6 5v14M8 5v14M11 5v14M13 5v14M16 5v14M18 5v14M21 5v14"/>
        <circle cx="12" cy="12" r="5" fill="var(--color-bg, #fff)" stroke="currentColor" stroke-width="1.5" />
        <path d="m10 10 4 4m0-4-4 4" stroke="currentColor" stroke-width="1.5" />
      </svg>
      <span class="error-title">{{ translateUi('Barcode Error') }}</span>
      <span class="error-desc">{{ errorMsg }}</span>
    </div>
  </div>
</template>

<style scoped>
.barcode-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

.barcode-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.binding-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-accent, #00b4d8);
  color: white;
  font-size: 9px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  letter-spacing: 0.5px;
}

.barcode-error-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(239, 71, 111, 0.05);
  border: 2px dashed rgba(239, 71, 111, 0.25);
  border-radius: 6px;
  color: #ef476f;
  font-size: 11px;
  gap: 4px;
  padding: 8px;
  text-align: center;
  box-sizing: border-box;
}

.error-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #ef476f;
}

.error-title {
  font-weight: bold;
  font-size: 11px;
}

.error-desc {
  font-size: 9px;
  line-height: 1.2;
  opacity: 0.95;
  word-break: break-word;
}
</style>
