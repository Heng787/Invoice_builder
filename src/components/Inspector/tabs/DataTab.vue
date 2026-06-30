<script setup>
import { computed } from "vue";
import { useBlockStore } from "../../../stores/blocks.js";
import { useHistoryStore } from "../../../stores/history.js";
import { useTranslateUi } from '../../../utils/translateUi.js'
const { translateUi } = useTranslateUi();

const props = defineProps({
    block: { type: Object, required: true },
});

const blockStore = useBlockStore();
const historyStore = useHistoryStore();

function updateProp(prop, val) {
    blockStore.updateBlock(props.block.id, { [prop]: val });
}

function commitHistory() {
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}
</script>

<template>
    <div class="tab-panel">
        <!-- Branch 1 — item_table: Friendly guidance -->
        <template v-if="block.type === 'item_table'">
            <div class="field-group">
                <div class="field-label">{{ translateUi('Table Data') }}</div>
                <p
                    style="
                        font-size: 11px;
                        color: var(--color-panel-muted);
                        line-height: 1.65;
                        margin-bottom: 10px;
                    "
                >
                    {{ translateUi('Edit rows, quantities, and prices directly in the table on the canvas.') }}
                </p>
                <p
                    style="
                        font-size: 11px;
                        color: var(--color-panel-muted);
                        line-height: 1.65;
                    "
                >
                    {{ translateUi('Use right-click context menu on cell, row numbers, or column headers to insert, delete, or merge cells and rows.') }}
                </p>
            </div>
        </template>

        <!-- Branch 2 — totals_block: Read-only info panel -->
        <template v-else-if="block.type === 'totals_block'">
            <div class="field-group">
                <div class="field-label">{{ translateUi('Auto Calculation') }}</div>
                <p
                    style="
                        font-size: 11px;
                        color: var(--color-panel-muted);
                        line-height: 1.65;
                        margin-bottom: 10px;
                    "
                >
                    {{ translateUi('Totals are automatically calculated from the Item Table on this canvas. Adjust tax rate and discount settings in the Block tab.') }}
                </p>
                <p
                    style="
                        font-size: 11px;
                        color: var(--color-panel-muted);
                        line-height: 1.65;
                    "
                >
                    {{ translateUi('Subtotal, tax and grand total update live as you edit items.') }}
                </p>
            </div>
        </template>

        <!-- Branch 3 — fallback: no variable binding UI -->
        <template v-else>
            <div
                style="
                    padding: 20px 14px;
                    text-align: center;
                    color: var(--color-panel-muted);
                    font-size: 11px;
                    line-height: 1.6;
                "
            >
                {{ translateUi('Select an Item Table block to manage rows, or a Totals block to see calculation info.') }}
            </div>
        </template>
    </div>
</template>

<style scoped>
.tab-panel {
    display: flex;
    flex-direction: column;
}
</style>
