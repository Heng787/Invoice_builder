<script setup>
import { computed } from "vue";
import { useBlockStore } from "../../../stores/blocks.js";
import { useHistoryStore } from "../../../stores/history.js";
import { usePreviewStore } from "../../../stores/preview.js";
import { useTranslateUi } from '../../../utils/translateUi.js'
const { translateUi } = useTranslateUi();

const props = defineProps({
    block: { type: Object, required: true },
});

const blockStore = useBlockStore();
const historyStore = useHistoryStore();
const previewStore = usePreviewStore();

function updateProp(prop, val) {
    blockStore.updateBlock(props.block.id, { [prop]: val });
}

function updateColumnBinding(colId, val) {
    const columns = JSON.parse(JSON.stringify(props.block.columns || []));
    const col = columns.find(c => c.id === colId);
    if (col) {
        col.binding = val;
        updateProp("columns", columns);
    }
}

function commitHistory() {
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}

function handleInput(prop, e) {
    updateProp(prop, e.target.value);
}

// Compute dynamic preview resolution helper
function getResolvedPreview(key, fallback = "") {
    if (!key) return "";
    const dataVal = previewStore.previewData[key];
    if (dataVal !== undefined && dataVal !== null && dataVal !== "") {
        return String(dataVal);
    }
    return fallback;
}
</script>

<template>
    <div class="tab-panel">
        <!-- 1. Text & Single Value Blocks (text, amount_in_words, receipt_header, receipt_footer) -->
        <div v-if="['text', 'amount_in_words', 'receipt_header', 'receipt_footer'].includes(block.type)" class="field-group">
            <div class="field-label">{{ translateUi('Variable Binding') }}</div>
            
            <div class="field-single" style="margin-bottom: 12px;">
                <label class="sub-label">{{ translateUi('Variable Key') }}</label>
                <input
                    type="text"
                    :value="block.bindingKey ?? ''"
                    class="inp"
                    placeholder="e.g. ComName, CusName"
                    :disabled="block.locked"
                    @input="handleInput('bindingKey', $event)"
                    @blur="commitHistory"
                />
            </div>

            <div class="field-single" style="margin-bottom: 12px;">
                <label class="sub-label">{{ translateUi('Fallback Value') }}</label>
                <input
                    type="text"
                    :value="block.bindingFallback ?? ''"
                    class="inp"
                    placeholder="Value if empty"
                    :disabled="block.locked"
                    @input="handleInput('bindingFallback', $event)"
                    @blur="commitHistory"
                />
            </div>
            
            <div class="field-single" v-if="block.bindingKey">
                <label class="sub-label">{{ translateUi('Live Preview') }}</label>
                <div class="resolved-box">
                    <span v-if="getResolvedPreview(block.bindingKey, block.bindingFallback)" class="resolved-text">
                        {{ getResolvedPreview(block.bindingKey, block.bindingFallback) }}
                    </span>
                    <span v-else class="resolved-placeholder">
                        (No value resolved)
                    </span>
                </div>
            </div>
        </div>

        <!-- 2. Document Header Block -->
        <div v-else-if="block.type === 'document_header'" class="field-group">
            <div class="field-label">{{ translateUi('Document Header Bindings') }}</div>

            <!-- Title -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Title Key</label>
                <input type="text" :value="block.titleBindingKey ?? ''" class="inp" placeholder="e.g. DocTitle" @input="handleInput('titleBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.titleBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.titleBindingKey, block.title ?? 'INVOICE') }}</div>
            </div>

            <!-- Number -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Invoice Number Key</label>
                <input type="text" :value="block.numberBindingKey ?? ''" class="inp" placeholder="e.g. InvNumber" @input="handleInput('numberBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.numberBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.numberBindingKey, block.docNumber ?? 'INV-0001') }}</div>
            </div>

            <!-- Date -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Issue Date Key</label>
                <input type="text" :value="block.dateBindingKey ?? ''" class="inp" placeholder="e.g. IssueDate" @input="handleInput('dateBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.dateBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.dateBindingKey, block.docDate ?? 'DD/MM/YYYY') }}</div>
            </div>

            <!-- Due Date -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Due Date Key</label>
                <input type="text" :value="block.dueDateBindingKey ?? ''" class="inp" placeholder="e.g. DueDate" @input="handleInput('dueDateBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.dueDateBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.dueDateBindingKey, block.dueDate ?? 'DD/MM/YYYY') }}</div>
            </div>

            <!-- Ref -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Reference No. Key</label>
                <input type="text" :value="block.refBindingKey ?? ''" class="inp" placeholder="e.g. RefNo" @input="handleInput('refBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.refBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.refBindingKey, block.docRef ?? '') }}</div>
            </div>
        </div>

        <!-- 3. Totals & Financial Blocks -->
        <div v-else-if="['totals_block', 'subtotal', 'discount', 'tax', 'grand_total', 'balance_due', 'deposit_paid'].includes(block.type)" class="field-group">
            <div class="field-label">{{ translateUi('Totals Bindings') }}</div>

            <!-- Subtotal -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Subtotal Key</label>
                <input type="text" :value="block.subtotalBindingKey ?? ''" class="inp" placeholder="e.g. Subtotal" @input="handleInput('subtotalBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.subtotalBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.subtotalBindingKey, '0.00') }}</div>
            </div>

            <!-- Discount -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Discount Key</label>
                <input type="text" :value="block.discountBindingKey ?? ''" class="inp" placeholder="e.g. Discount" @input="handleInput('discountBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.discountBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.discountBindingKey, '0.00') }}</div>
            </div>

            <!-- Tax -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Tax Key</label>
                <input type="text" :value="block.taxBindingKey ?? ''" class="inp" placeholder="e.g. Tax" @input="handleInput('taxBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.taxBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.taxBindingKey, '0.00') }}</div>
            </div>

            <!-- Total -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Grand Total Key</label>
                <input type="text" :value="block.totalBindingKey ?? ''" class="inp" placeholder="e.g. Total" @input="handleInput('totalBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.totalBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.totalBindingKey, '0.00') }}</div>
            </div>

            <!-- Balance Due -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Balance Due Key</label>
                <input type="text" :value="block.balanceBindingKey ?? ''" class="inp" placeholder="e.g. Balance" @input="handleInput('balanceBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.balanceBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.balanceBindingKey, '0.00') }}</div>
            </div>

            <!-- Deposit Paid -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Deposit Paid Key</label>
                <input type="text" :value="block.depositBindingKey ?? ''" class="inp" placeholder="e.g. Deposit" @input="handleInput('depositBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.depositBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.depositBindingKey, '0.00') }}</div>
            </div>
        </div>

        <!-- 4. Signature Block -->
        <div v-else-if="block.type === 'signature_line'" class="field-group">
            <div class="field-label">{{ translateUi('Signature Bindings') }}</div>

            <!-- Name -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Signee Name Key</label>
                <input type="text" :value="block.nameBindingKey ?? ''" class="inp" placeholder="e.g. SigneeName" @input="handleInput('nameBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.nameBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.nameBindingKey, block.label ?? '') }}</div>
            </div>

            <!-- Date -->
            <div class="field-single" style="margin-bottom: 10px;">
                <label class="sub-label">Signature Date Key</label>
                <input type="text" :value="block.dateBindingKey ?? ''" class="inp" placeholder="e.g. SignDate" @input="handleInput('dateBindingKey', $event)" @blur="commitHistory" />
                <div v-if="block.dateBindingKey" class="live-hint">resolved: {{ getResolvedPreview(block.dateBindingKey, 'DD/MM/YYYY') }}</div>
            </div>
        </div>

        <!-- 5. Item Table Block -->
        <div v-else-if="block.type === 'item_table'" class="field-group">
            <div class="field-label">{{ translateUi('Table Source & Bindings') }}</div>

            <!-- Array Source -->
            <div class="field-single" style="margin-bottom: 12px;">
                <label class="sub-label">{{ translateUi('Array Source Key') }}</label>
                <input
                    type="text"
                    :value="block.arraySource ?? ''"
                    class="inp"
                    placeholder="e.g. items, packages, tasks"
                    :disabled="block.locked"
                    @input="handleInput('arraySource', $event)"
                    @blur="commitHistory"
                />
            </div>

            <!-- Show empty rows toggle -->
            <div class="field-single" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <label class="sub-label" style="cursor: pointer; user-select: none;">
                    {{ translateUi('Show empty rows in preview') }}
                </label>
                <input
                    type="checkbox"
                    :checked="block.showEmptyRowsInPreview !== false"
                    style="width: 16px; height: 16px; accent-color: var(--color-accent); cursor: pointer;"
                    :disabled="block.locked"
                    @change="updateProp('showEmptyRowsInPreview', $event.target.checked); commitHistory()"
                />
            </div>

            <!-- Minimum Empty Rows -->
            <div v-if="block.showEmptyRowsInPreview !== false" class="field-single" style="margin-bottom: 12px;">
                <label class="sub-label">{{ translateUi('Minimum Empty Rows') }}</label>
                <input
                    type="number"
                    min="0"
                    :value="block.minEmptyRows ?? 5"
                    class="inp"
                    placeholder="5"
                    :disabled="block.locked"
                    @input="updateProp('minEmptyRows', parseInt($event.target.value) || 0)"
                    @blur="commitHistory"
                />
            </div>

            <!-- Column Bindings -->
            <div v-if="block.columns && block.columns.length > 0" class="field-single" style="margin-top: 16px;">
                <label class="sub-label" style="font-weight: 600; margin-bottom: 8px;">{{ translateUi('Column Bindings') }}</label>
                
                <div v-for="col in block.columns" :key="col.id">
                    <!-- Don't bind auto-number column "no" -->
                    <div v-if="col.id !== 'no'" class="field-single" style="margin-bottom: 10px; padding-left: 8px; border-left: 2px solid var(--color-panel-border);">
                        <label class="sub-label" style="font-size: 11px; color: var(--color-panel-text);">
                            {{ col.label || col.id }} ({{ col.id }})
                        </label>
                        <input
                            type="text"
                            :value="col.binding ?? ''"
                            class="inp"
                            style="margin-top: 4px;"
                            placeholder="e.g. name, qty, price"
                            :disabled="block.locked"
                            @input="updateColumnBinding(col.id, $event.target.value)"
                            @blur="commitHistory"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.resolved-box {
    background: rgba(255, 255, 255, 0.05);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    border: 1px solid var(--color-panel-border);
    word-break: break-all;
    min-height: 32px;
    display: flex;
    align-items: center;
    color: var(--color-panel-text);
}
.resolved-text {
    color: var(--color-accent);
    font-weight: 500;
}
.resolved-placeholder {
    color: var(--color-panel-muted);
    font-style: italic;
}
.live-hint {
    font-size: 10px;
    color: var(--color-accent);
    margin-top: 2px;
    font-style: italic;
    opacity: 0.85;
}
</style>
