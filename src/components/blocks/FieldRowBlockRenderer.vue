<script setup>
import { useBlockStore } from "../../stores/blocks.js";

const props = defineProps({
    block: { type: Object, required: true },
    fillMode: { type: Boolean, default: false },
});

const blockStore = useBlockStore();
</script>

<template>
    <div
        :style="{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontFamily: block.fontFamily ?? 'inherit',
            fontSize: `${block.fontSize ?? 13}px`,
            color: block.color ?? '#000',
            padding: '2px 4px',
            boxSizing: 'border-box',
            overflow: 'hidden',
        }"
    >
        <!-- Fill mode: editable inputs -->
        <template v-if="fillMode">
            <input
                type="text"
                :value="block.label ?? ''"
                :style="{
                    width: `${block.labelWidth ?? 40}%`,
                    flexShrink: 0,
                    marginRight: '8px',
                    fontFamily: block.fontFamily ?? 'inherit',
                    fontSize: `${block.fontSize ?? 13}px`,
                    fontWeight: block.labelFontWeight ?? 'bold',
                    color: block.color ?? '#000',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0, 180, 216, 0.5)',
                    outline: 'none',
                    padding: '0 2px',
                    boxSizing: 'border-box',
                }"
                @input="
                    blockStore.updateBlock(block.id, {
                        label: $event.target.value,
                    })
                "
            />
            <input
                type="text"
                :value="block.value ?? ''"
                :style="{
                    flex: 1,
                    fontFamily: block.fontFamily ?? 'inherit',
                    fontSize: `${block.fontSize ?? 13}px`,
                    color: block.color ?? '#000',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0, 180, 216, 0.5)',
                    outline: 'none',
                    padding: '0 2px',
                    boxSizing: 'border-box',
                }"
                @input="
                    blockStore.updateBlock(block.id, {
                        value: $event.target.value,
                    })
                "
            />
        </template>

        <!-- Design mode: display spans -->
        <template v-else>
            <span
                :style="{
                    fontWeight: block.labelFontWeight ?? 'bold',
                    flexShrink: 0,
                    marginRight: '8px',
                    width: `${block.labelWidth ?? 40}%`,
                }"
            >
                <span v-html="block.label ?? ''"></span>:
            </span>
            <span style="flex: 1" v-html="block.value ?? ''"></span>
        </template>
    </div>
</template>
