<script setup>
import { computed, ref, watch } from "vue";
import { usePreviewStore } from "../../stores/preview.js";
import { useBlockStore } from "../../stores/blocks.js";
import { useTranslateUi } from "../../utils/translateUi.js";

const previewStore = usePreviewStore();
const blockStore = useBlockStore();
const { translateUi } = useTranslateUi();

const jsonText = ref(previewStore.rawJson);
const applyError = ref("");

// Keep local textbox synchronized with store changes
watch(() => previewStore.rawJson, (newVal) => {
    jsonText.value = newVal;
});

function handleApply() {
    applyError.value = "";
    const res = previewStore.applyData(jsonText.value);
    if (!res.success) {
        applyError.value = res.error;
    }
}

function handleClear() {
    previewStore.clearData();
    jsonText.value = "{}";
    applyError.value = "";
}

// Find all unique binding keys defined across all blocks on the canvas
// Find all unique single value binding keys
const definedSingleBindings = computed(() => {
    const keys = new Set();
    blockStore.blocks.forEach(b => {
        if (b.type !== 'item_table') {
            if (b.bindingKey) keys.add(b.bindingKey);
            if (b.titleBindingKey) keys.add(b.titleBindingKey);
            if (b.numberBindingKey) keys.add(b.numberBindingKey);
            if (b.dateBindingKey) keys.add(b.dateBindingKey);
            if (b.dueDateBindingKey) keys.add(b.dueDateBindingKey);
            if (b.refBindingKey) keys.add(b.refBindingKey);
            if (b.subtotalBindingKey) keys.add(b.subtotalBindingKey);
            if (b.discountBindingKey) keys.add(b.discountBindingKey);
            if (b.taxBindingKey) keys.add(b.taxBindingKey);
            if (b.totalBindingKey) keys.add(b.totalBindingKey);
            if (b.balanceBindingKey) keys.add(b.balanceBindingKey);
            if (b.depositBindingKey) keys.add(b.depositBindingKey);
            if (b.nameBindingKey) keys.add(b.nameBindingKey);
        }
    });
    return Array.from(keys);
});

// Find all item table array sources and their bound column fields
const itemTableBindings = computed(() => {
    const list = [];
    blockStore.blocks.forEach(b => {
        if (b.type === 'item_table' && b.arraySource) {
            const boundCols = (b.columns || [])
                .filter(c => c.id !== 'no' && c.binding)
                .map(c => c.binding);
            list.push({
                arraySource: b.arraySource,
                boundCols
            });
        }
    });
    return list;
});

// ✅ Matched fields list
const matchedFields = computed(() => {
    const list = [];
    const data = previewStore.previewData || {};

    // Single value bindings matched
    definedSingleBindings.value.forEach(k => {
        if (k in data) {
            list.push({ key: k, displayKey: k, message: 'matched' });
        }
    });

    // Array source bindings matched
    itemTableBindings.value.forEach(tb => {
        const val = data[tb.arraySource];
        if (val !== undefined && val !== null && Array.isArray(val)) {
            list.push({
                key: tb.arraySource,
                displayKey: tb.arraySource,
                message: `matched (array, ${val.length} rows)`
            });
        }
    });

    return list;
});

// ⚠️ Unused fields list
const unusedFields = computed(() => {
    const list = [];
    const data = previewStore.previewData || {};

    const singleBindings = definedSingleBindings.value;
    const arraySources = itemTableBindings.value.map(tb => tb.arraySource);

    // Unused root keys
    Object.keys(data).forEach(k => {
        if (!singleBindings.includes(k) && !arraySources.includes(k)) {
            list.push({ key: k, displayKey: k, message: 'not used' });
        }
    });

    // Unused properties inside matched arrays
    itemTableBindings.value.forEach(tb => {
        const val = data[tb.arraySource];
        if (val !== undefined && val !== null && Array.isArray(val)) {
            const arrayKeys = new Set();
            val.forEach(rowItem => {
                if (rowItem && typeof rowItem === 'object') {
                    Object.keys(rowItem).forEach(subKey => arrayKeys.add(subKey));
                }
            });

            arrayKeys.forEach(subKey => {
                if (!tb.boundCols.includes(subKey)) {
                    list.push({
                        key: `${tb.arraySource}.${subKey}`,
                        displayKey: `${tb.arraySource}.${subKey}`,
                        message: 'not bound to any column'
                    });
                }
            });
        }
    });

    return list;
});

// ❌ Missing fields list
const missingFields = computed(() => {
    const list = [];
    const data = previewStore.previewData || {};

    // Single value bindings missing
    definedSingleBindings.value.forEach(k => {
        if (!(k in data)) {
            list.push({ key: k, displayKey: k, message: 'no data' });
        }
    });

    // Array sources missing or invalid
    itemTableBindings.value.forEach(tb => {
        const val = data[tb.arraySource];
        if (val === undefined || val === null || !Array.isArray(val)) {
            list.push({ key: tb.arraySource, displayKey: tb.arraySource, message: 'no data found' });
        }
    });

    return list;
});
</script>

<template>
    <aside
        class="panel"
        style="
            width: 320px;
            border-left: 1px solid var(--color-panel-border);
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            flex-shrink: 0;
            background: var(--color-panel);
        "
    >
        <div class="panel-header">{{ translateUi('Preview Data') }}</div>
        
        <div style="flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 14px;">
            <!-- JSON Input Area -->
            <div class="field-group">
                <label class="field-label">{{ translateUi('Paste JSON Data') }}</label>
                <textarea
                    v-model="jsonText"
                    class="inp font-mono"
                    style="width: 100%; height: 160px; resize: vertical; font-size: 11px; padding: 8px; line-height: 1.4; border-radius: 6px; background: rgba(0,0,0,0.2); color: #fff;"
                    placeholder='{ "key": "value" }'
                ></textarea>
                <div v-if="applyError" style="font-size: 10px; color: var(--color-danger); margin-top: 4px; word-break: break-all;">
                    ⚠️ {{ applyError }}
                </div>
                
                <div class="flex gap-2" style="margin-top: 8px">
                    <button class="btn btn-ghost" style="flex: 1; font-size: 11px; background: var(--color-accent-dim); color: var(--color-accent);" @click="handleApply">
                        {{ translateUi('Apply Data') }}
                    </button>
                    <button class="btn btn-ghost" style="font-size: 11px;" @click="handleClear">
                        {{ translateUi('Clear') }}
                    </button>
                </div>
            </div>
            
            <!-- Field Status Area -->
            <div class="field-group" style="flex: 1; display: flex; flex-direction: column;">
                <label class="field-label" style="margin-bottom: 8px;">{{ translateUi('Field Status') }}</label>
                
                <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; overflow-y: auto; max-height: 320px; padding-right: 4px;">
                    <!-- Empty status state -->
                    <div v-if="matchedFields.length === 0 && unusedFields.length === 0 && missingFields.length === 0" style="font-size: 11px; color: var(--color-panel-muted); font-style: italic; text-align: center; margin-top: 16px;">
                        No variable bindings configured.
                    </div>
                    
                    <!-- Matched fields -->
                    <div v-for="f in matchedFields" :key="f.key" style="display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 6px 10px; border-radius: 5px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); color: #e2e8f0;">
                        <span>✅</span>
                        <span class="font-mono text-success font-semibold" style="flex: 1; font-size: 11px; word-break: break-all;">{{ f.displayKey }}</span>
                        <span style="font-size: 10px; color: var(--color-panel-muted); white-space: nowrap;">{{ f.message }}</span>
                    </div>

                    <!-- Unused fields -->
                    <div v-for="f in unusedFields" :key="f.key" style="display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 6px 10px; border-radius: 5px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); color: #e2e8f0;">
                        <span>⚠️</span>
                        <span class="font-mono text-warning font-semibold" style="flex: 1; font-size: 11px; word-break: break-all;">{{ f.displayKey }}</span>
                        <span style="font-size: 10px; color: var(--color-panel-muted); white-space: nowrap;">{{ f.message }}</span>
                    </div>

                    <!-- Missing/No Data fields -->
                    <div v-for="f in missingFields" :key="f.key" style="display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 6px 10px; border-radius: 5px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: #e2e8f0;">
                        <span>❌</span>
                        <span class="font-mono text-danger font-semibold" style="flex: 1; font-size: 11px; word-break: break-all;">{{ f.displayKey }}</span>
                        <span style="font-size: 10px; color: var(--color-panel-muted); white-space: nowrap;">{{ f.message }}</span>
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>
