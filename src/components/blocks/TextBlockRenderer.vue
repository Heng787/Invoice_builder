<script setup>
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { useBlockStore } from "../../stores/blocks.js";
import { usePreviewStore } from "../../stores/preview.js";
import { useSettingsStore } from "../../stores/settings.js";
import { formatValue } from "../../utils/formatValue.js";

const props = defineProps({
    block: { type: Object, required: true },
    fillMode: { type: Boolean, default: false },
});

const blockStore = useBlockStore();
const previewStore = usePreviewStore();
const settingsStore = useSettingsStore();

// Display and binding state
const displayText = computed(() => props.block.content ?? "");
const isBound = computed(() => !!props.block.bindingKey);

// Resolve bound value
const resolvedValue = computed(() => {
    if (!isBound.value) return displayText.value;
    const key = props.block.bindingKey;
    const dataVal = previewStore.previewData[key];
    if (dataVal !== undefined && dataVal !== null && dataVal !== "") {
        return String(dataVal);
    }
    return props.block.bindingFallback ?? "";
});

// Format resolved value
const formattedValue = computed(() => {
    const val = resolvedValue.value;
    const fmt = props.block.format;
    if (!fmt || fmt.type === 'general') return val;
    
    const resolvedFmt = {
        ...fmt,
        symbol: fmt.symbol || settingsStore.globalFormat.currencySymbol
    };
    return formatValue(val, resolvedFmt);
});

// Format hint for design mode
const formatHintText = computed(() => {
    const fmt = props.block.format;
    if (!fmt || fmt.type === 'general') return '';
    
    const typeCapitalized = fmt.type.charAt(0).toUpperCase() + fmt.type.slice(1);
    if (fmt.type === 'currency' || fmt.type === 'accounting') {
        const sym = fmt.symbol || settingsStore.globalFormat.currencySymbol || '$';
        return `${typeCapitalized} (${sym})`;
    }
    if (fmt.type === 'percentage') {
        const mode = fmt.isDecimal ? 'Decimal' : 'Percent';
        return `${typeCapitalized} (${mode})`;
    }
    if (fmt.type === 'number') {
        return `${typeCapitalized} (${fmt.decimals ?? 2} dec)`;
    }
    if (fmt.type === 'date') {
        return `${typeCapitalized} (${fmt.dateFormat || 'DD/MM/YYYY'})`;
    }
    return typeCapitalized;
});

// Accounting format split helper
function formatAccountingParts(value, format, fallbackSymbol = '$') {
  const num = parseFloat(value)
  if (isNaN(num)) return { left: '', right: String(value) }
  
  const symbol = format.symbol || fallbackSymbol
  const decimals = format.decimals ?? 2
  
  if (num < 0) {
    const abs = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return { left: `(${symbol}`, right: `${abs})` }
  }
  
  const pos = num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  return { left: symbol, right: pos }
}

// Placeholder for binding key
const getPlaceholder = (key) => key ? `{{${key}}}` : "";

// Computed style for display mode
const style = computed(() => {
    const isBox = props.block.type === 'box';
    const vAlign = props.block.verticalAlign || (isBox ? 'middle' : 'top');
    return {
        width: "100%",
        height: "100%",
        padding: `${props.block.paddingTop ?? 2}px ${props.block.paddingRight ?? 4}px ${props.block.paddingBottom ?? 2}px ${props.block.paddingLeft ?? 4}px`,
        fontFamily: props.block.fontFamily ?? "inherit",
        fontSize: `${props.block.fontSize ?? 13}px`,
        fontWeight: props.block.fontWeight ?? "normal",
        fontStyle: props.block.fontStyle ?? "normal",
        color: props.block.color ?? "#000000",
        lineHeight: props.block.lineHeight ?? 1.5,
        letterSpacing: `${props.block.letterSpacing ?? 0}px`,
        textAlign: props.block.textAlign ?? "left",
        textDecoration: props.block.textDecoration ?? "none",
        textTransform: props.block.textTransform ?? "none",
        backgroundColor: props.block.backgroundColor ?? "transparent",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflow: "hidden",
        boxSizing: "border-box",
        border: props.block.borderWidth
            ? `${props.block.borderWidth}px ${props.block.borderStyle ?? "solid"} ${props.block.borderColor ?? "#000"}`
            : "none",
        borderRadius: `${props.block.borderRadius ?? 0}px`,
        
        display: "flex",
        flexDirection: "column",
        justifyContent: vAlign === 'top' ? 'flex-start' : (vAlign === 'bottom' ? 'flex-end' : 'center'),
        alignItems: "stretch",
    };
});

// Computed style for fill mode editable area
const fillTextareaStyle = computed(() => {
    const isBox = props.block.type === 'box';
    const vAlign = props.block.verticalAlign || (isBox ? 'middle' : 'top');
    return {
        width: "100%",
        height: "100%",
        padding: `${props.block.paddingTop ?? 2}px ${props.block.paddingRight ?? 4}px ${props.block.paddingBottom ?? 2}px ${props.block.paddingLeft ?? 4}px`,
        fontFamily: props.block.fontFamily ?? "inherit",
        fontSize: `${props.block.fontSize ?? 13}px`,
        fontWeight: props.block.fontWeight ?? "normal",
        fontStyle: props.block.fontStyle ?? "normal",
        color: props.block.color ?? "#000000",
        lineHeight: props.block.lineHeight ?? 1.5,
        letterSpacing: `${props.block.letterSpacing ?? 0}px`,
        textAlign: props.block.textAlign ?? "left",
        textDecoration: props.block.textDecoration ?? "none",
        textTransform: props.block.textTransform ?? "none",
        background: "transparent",
        border: "1px solid rgba(0, 180, 216, 0.4)",
        borderRadius: `${props.block.borderRadius ?? 0}px`,
        outline: "none",
        resize: "none",
        boxSizing: "border-box",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflow: "auto",
        
        display: "flex",
        flexDirection: "column",
        justifyContent: vAlign === 'top' ? 'flex-start' : (vAlign === 'bottom' ? 'flex-end' : 'center'),
        alignItems: "stretch",
    };
});

const editRef = ref(null);

// Update block content
function updateContent(val) {
    blockStore.updateBlock(props.block.id, { content: val });
}

// Initialize content on mount
onMounted(() => {
    if (editRef.value) {
        editRef.value.innerHTML = props.block.content ?? "";
    }
});

// Sync content when prop changes
watch(
    () => props.block.content,
    (newVal) => {
        if (editRef.value && editRef.value.innerHTML !== newVal) {
            editRef.value.innerHTML = newVal ?? "";
        }
    }
);

// Focus and set cursor when fill mode activates
watch(
    () => props.fillMode,
    (newVal) => {
        if (newVal) {
            nextTick(() => {
                if (editRef.value) {
                    editRef.value.focus();
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(editRef.value);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            });
        }
    }
);
</script>

<template>
    <div
        v-if="fillMode"
        ref="editRef"
        contenteditable="true"
        :style="fillTextareaStyle"
        placeholder="Click to type..."
        class="rich-text-editor"
        @input="updateContent($event.target.innerHTML)"
    />
    <div v-else :style="style">
        <div v-if="isBound">
            <div class="design-binding-only">
                <span style="color: #00b4d8; font-weight: 600;">{{ getPlaceholder(props.block.bindingKey) }}</span>
                <div v-if="formatHintText" style="font-size: 10px; color: #4a5568; margin-top: 2px; font-weight: 600;">
                    Format: {{ formatHintText }}
                </div>
                <div style="font-size: 10px; color: #718096; margin-top: 2px; font-weight: normal; font-style: italic; line-height: 1.2;">
                    fallback: {{ props.block.bindingFallback || '(none)' }}
                </div>
            </div>
            <div class="preview-binding-only" style="width: 100%;">
                <div v-if="props.block.format?.type === 'accounting'" style="display: flex; justify-content: space-between; width: 100%; box-sizing: border-box;">
                    <span>{{ formatAccountingParts(resolvedValue, props.block.format, settingsStore.globalFormat.currencySymbol).left }}</span>
                    <span>{{ formatAccountingParts(resolvedValue, props.block.format, settingsStore.globalFormat.currencySymbol).right }}</span>
                </div>
                <template v-else>
                    {{ formattedValue }}
                </template>
            </div>
        </div>
        <div v-else v-html="displayText"></div>
    </div>
</template>

<style scoped>
.rich-text-editor {
    outline: none;
}
.rich-text-editor:empty::before {
    content: attr(placeholder);
    color: #a0aec0;
    pointer-events: none;
}
</style>