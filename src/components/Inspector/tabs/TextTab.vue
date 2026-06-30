<script setup>
import { computed } from "vue";
import { useBlockStore } from "../../../stores/blocks.js";
import { useHistoryStore } from "../../../stores/history.js";
import { useSettingsStore } from "../../../stores/settings.js";
import { useTranslateUi } from '../../../utils/translateUi.js'
const { translateUi } = useTranslateUi();
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "@lucide/vue";

const props = defineProps({
    block: { type: Object, required: true },
});

const blockStore = useBlockStore();
const historyStore = useHistoryStore();
const settingsStore = useSettingsStore();

function updateProp(prop, val) {
    blockStore.updateBlock(props.block.id, { [prop]: val });
}

function commitHistory() {
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}

function handleInput(prop, e, isNum = true) {
    const val = isNum ? parseFloat(e.target.value) : e.target.value;
    if (!isNaN(val) || !isNum) {
        updateProp(prop, val);
    }
}
</script>

<template>
    <div class="tab-panel">
        <!-- Content (Keep only structural controls) -->
        <div v-if="['field_row', 'issue_date', 'due_date', 'reference_number'].includes(block.type)" class="field-group">
            <div class="field-label">{{ translateUi('Layout') }}</div>
            <div class="field-single">
                <label class="sub-label">{{ translateUi('Label Width %') }}</label>
                <div class="field-unit">
                    <input
                        type="number"
                        :value="block.labelWidth ?? 40"
                        class="inp"
                        min="0"
                        max="90"
                        :disabled="block.locked"
                        @input="handleInput('labelWidth', $event)"
                        @blur="commitHistory"
                    />
                    <span class="field-unit-label">{{ translateUi('%') }}</span>
                </div>
            </div>
        </div>

        <!-- Font Family & Size -->
        <div class="field-group">
            <div class="field-label">{{ translateUi('Typography') }}</div>
            <div class="field-single">
                <label
                    style="
                        font-size: 10px;
                        color: var(--color-panel-muted);
                        display: block;
                        margin-bottom: 2px;
                    "
                    >{{ translateUi('Font Family') }}</label>
                <select
                    :value="block.fontFamily ?? 'inherit'"
                    class="inp"
                    :disabled="block.locked"
                    @change="handleInput('fontFamily', $event, false)"
                    @blur="commitHistory"
                >
                    <option value="inherit">
                        {{ translateUi('Use Global Font') }} ({{
                            settingsStore.fonts.find(
                                (f) => f.value === settingsStore.globalFont,
                            )?.name ?? "Noto Sans"
                        }})
                    </option>
                    <option
                        v-for="font in settingsStore.fonts"
                        :key="font.value"
                        :value="font.value"
                    >
                        {{ font.name }}
                    </option>
                </select>
            </div>

            <div class="field-row" style="margin-top: 8px">
                <div>
                    <label
                        style="
                            font-size: 10px;
                            color: var(--color-panel-muted);
                            display: block;
                            margin-bottom: 2px;
                        "
                        >{{ translateUi('Font Size') }}</label>
                    <div class="field-unit">
                        <input
                            type="number"
                            :value="block.fontSize ?? 13"
                            class="inp"
                            min="6"
                            max="144"
                            :disabled="block.locked"
                            @input="handleInput('fontSize', $event)"
                            @blur="commitHistory"
                        />
                        <span class="field-unit-label">{{ translateUi('px') }}</span>
                    </div>
                </div>
                <div>
                    <label
                        style="
                            font-size: 10px;
                            color: var(--color-panel-muted);
                            display: block;
                            margin-bottom: 2px;
                        "
                        >{{ translateUi('Font Weight') }}</label>
                    <select
                        :value="block.fontWeight ?? 'normal'"
                        class="inp"
                        :disabled="block.locked"
                        @change="handleInput('fontWeight', $event, false)"
                        @blur="commitHistory"
                    >
                        <option value="normal">{{ translateUi('Normal (400)') }}</option>
                        <option value="bold">{{ translateUi('Bold (700)') }}</option>
                        <option value="300">{{ translateUi('Light (300)') }}</option>
                        <option value="500">{{ translateUi('Medium (500)') }}</option>
                        <option value="600">{{ translateUi('Semi-Bold (600)') }}</option>
                        <option value="800">{{ translateUi('Extra-Bold (800)') }}</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Style, Color & Alignment -->
        <div class="field-group">
            <div class="field-label">{{ translateUi('Color & Alignment') }}</div>

            <div class="field-single" style="margin-bottom: 10px">
                <label
                    style="
                        font-size: 10px;
                        color: var(--color-panel-muted);
                        display: block;
                        margin-bottom: 4px;
                    "
                    >{{ translateUi('Text Color') }}</label>
                <div style="display: flex; gap: 8px; align-items: center">
                    <input
                        type="color"
                        :value="
                            block.color && block.color.startsWith('#')
                                ? block.color
                                : '#000000'
                        "
                        class="color-picker-input"
                        :disabled="block.locked"
                        @input="updateProp('color', $event.target.value)"
                        @change="commitHistory"
                    />
                    <input
                        type="text"
                        :value="block.color ?? '#000000'"
                        class="inp"
                        :placeholder="translateUi('#000000')"
                        :disabled="block.locked"
                        @input="updateProp('color', $event.target.value)"
                        @blur="commitHistory"
                    />
                </div>
            </div>

            <div class="field-single">
                <label
                    style="
                        font-size: 10px;
                        color: var(--color-panel-muted);
                        display: block;
                        margin-bottom: 4px;
                    "
                    >{{ translateUi('Alignment') }}</label>
                <div
                    style="
                        display: flex;
                        gap: 2px;
                        background: rgba(0, 0, 0, 0.15);
                        padding: 2px;
                        border-radius: 6px;
                        border: 1px solid var(--color-panel-border);
                    "
                >
                    <button
                        v-for="align in ['left', 'center', 'right', 'justify']"
                        :key="align"
                        class="align-btn"
                        :class="{
                            active: (block.textAlign || 'left') === align,
                        }"
                        :disabled="block.locked"
                        @click="
                            updateProp('textAlign', align);
                            commitHistory();
                        "
                    >
                        <component
                            :is="
                                align === 'left'
                                    ? AlignLeft
                                    : align === 'center'
                                      ? AlignCenter
                                      : align === 'right'
                                        ? AlignRight
                                        : AlignJustify
                            "
                            :size="14"
                        />
                    </button>
                </div>
            </div>

            <div class="field-single" style="margin-top: 10px">
                <label
                    style="
                        font-size: 10px;
                        color: var(--color-panel-muted);
                        display: block;
                        margin-bottom: 4px;
                    "
                    >{{ translateUi('Vertical Alignment') }}</label>
                <div
                    style="
                        display: flex;
                        gap: 2px;
                        background: rgba(0, 0, 0, 0.15);
                        padding: 2px;
                        border-radius: 6px;
                        border: 1px solid var(--color-panel-border);
                    "
                >
                    <button
                        v-for="vAlign in ['top', 'middle', 'bottom']"
                        :key="vAlign"
                        class="align-btn"
                        :class="{
                            active: (block.verticalAlign || (block.type === 'box' ? 'middle' : 'top')) === vAlign,
                        }"
                        :disabled="block.locked"
                        style="font-size: 10px; font-weight: 500; text-transform: capitalize; padding: 4px 6px;"
                        @click="
                            updateProp('verticalAlign', vAlign);
                            commitHistory();
                        "
                    >
                        {{ translateUi(vAlign) }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Spacing & Advanced -->
        <div class="field-group">
            <div class="field-label">{{ translateUi('Spacing & Formatting') }}</div>

            <div class="field-row">
                <div>
                    <label
                        style="
                            font-size: 10px;
                            color: var(--color-panel-muted);
                            display: block;
                            margin-bottom: 2px;
                        "
                        >{{ translateUi('Line Height') }}</label>
                    <input
                        type="number"
                        :value="block.lineHeight ?? 1.5"
                        class="inp"
                        step="0.1"
                        min="0.5"
                        max="3"
                        :disabled="block.locked"
                        @input="handleInput('lineHeight', $event)"
                        @blur="commitHistory"
                    />
                </div>
                <div>
                    <label
                        style="
                            font-size: 10px;
                            color: var(--color-panel-muted);
                            display: block;
                            margin-bottom: 2px;
                        "
                        >{{ translateUi('Letter Spacing') }}</label>
                    <div class="field-unit">
                        <input
                            type="number"
                            :value="block.letterSpacing ?? 0"
                            class="inp"
                            step="0.5"
                            :disabled="block.locked"
                            @input="handleInput('letterSpacing', $event)"
                            @blur="commitHistory"
                        />
                        <span class="field-unit-label">{{ translateUi('px') }}</span>
                    </div>
                </div>
            </div>

            <div class="field-row" style="margin-top: 8px">
                <div>
                    <label
                        style="
                            font-size: 10px;
                            color: var(--color-panel-muted);
                            display: block;
                            margin-bottom: 2px;
                        "
                        >{{ translateUi('Decoration') }}</label>
                    <select
                        :value="block.textDecoration ?? 'none'"
                        class="inp"
                        :disabled="block.locked"
                        @change="handleInput('textDecoration', $event, false)"
                        @blur="commitHistory"
                    >
                        <option value="none">{{ translateUi('None') }}</option>
                        <option value="underline">{{ translateUi('Underline') }}</option>
                        <option value="line-through">{{ translateUi('Line Through') }}</option>
                    </select>
                </div>
                <div>
                    <label
                        style="
                            font-size: 10px;
                            color: var(--color-panel-muted);
                            display: block;
                            margin-bottom: 2px;
                        "
                        >{{ translateUi('Transform') }}</label>
                    <select
                        :value="block.textTransform ?? 'none'"
                        class="inp"
                        :disabled="block.locked"
                        @change="handleInput('textTransform', $event, false)"
                        @blur="commitHistory"
                    >
                        <option value="none">{{ translateUi('Normal') }}</option>
                        <option value="uppercase">{{ translateUi('UPPERCASE') }}</option>
                        <option value="lowercase">{{ translateUi('lowercase') }}</option>
                        <option value="capitalize">{{ translateUi('Capitalize') }}</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tab-panel {
    display: flex;
    flex-direction: column;
}

.sub-label {
    font-size: 10px;
    color: var(--color-panel-muted);
    display: block;
    margin-bottom: 2px;
}

.content-textarea {
    height: 72px;
    resize: vertical;
}

.color-picker-input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--color-panel-border);
    background: none;
    cursor: pointer;
    padding: 0;
}
.color-picker-input::-webkit-color-swatch-wrapper {
    padding: 0;
}
.color-picker-input::-webkit-color-swatch {
    border: none;
    border-radius: 5px;
}
.align-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    background: transparent;
    border: none;
    color: var(--color-panel-muted);
    cursor: pointer;
    border-radius: 4px;
    transition: all var(--transition-fast);
}
.align-btn:hover {
    background: var(--color-panel-hover);
    color: #fff;
}
.align-btn.active {
    background: var(--color-accent-dim);
    color: var(--color-accent);
}
</style>
