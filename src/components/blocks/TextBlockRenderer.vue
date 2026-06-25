<script setup>
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { useBlockStore } from "../../stores/blocks.js";
import { usePreviewStore } from "../../stores/preview.js";

const props = defineProps({
    block: { type: Object, required: true },
    fillMode: { type: Boolean, default: false },
});

const blockStore = useBlockStore();
const previewStore = usePreviewStore();

const displayText = computed(() => props.block.content ?? "");

const isBound = computed(() => !!props.block.bindingKey);

const resolvedValue = computed(() => {
    if (!isBound.value) return displayText.value;
    const key = props.block.bindingKey;
    const dataVal = previewStore.previewData[key];
    if (dataVal !== undefined && dataVal !== null && dataVal !== "") {
        return String(dataVal);
    }
    return props.block.bindingFallback ?? "";
});

const getPlaceholder = (key) => key ? `{{${key}}}` : "";

const style = computed(() => ({
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
}));

const fillTextareaStyle = computed(() => ({
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
}));

const editRef = ref(null);

function updateContent(val) {
    blockStore.updateBlock(props.block.id, { content: val });
}

onMounted(() => {
    if (editRef.value) {
        editRef.value.innerHTML = props.block.content ?? "";
    }
});

watch(
    () => props.block.content,
    (newVal) => {
        if (editRef.value && editRef.value.innerHTML !== newVal) {
            editRef.value.innerHTML = newVal ?? "";
        }
    }
);

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
                    range.collapse(false); // cursor to the end
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
                <div style="font-size: 10px; color: #718096; margin-top: 2px; font-weight: normal; font-style: italic; line-height: 1.2;">
                    fallback: {{ props.block.bindingFallback || '(none)' }}
                </div>
            </div>
            <div class="preview-binding-only">
                {{ resolvedValue }}
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
