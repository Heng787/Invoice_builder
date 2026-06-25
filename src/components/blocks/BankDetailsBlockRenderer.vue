<script setup>
import { computed } from "vue";

const props = defineProps({
    block: { type: Object, required: true },
    fillMode: { type: Boolean, default: false },
});

const borderStyle = computed(() => {
    const { borderWidth, borderStyle = "solid", borderColor = "#000" } = props.block;
    return borderWidth ? `${borderWidth}px ${borderStyle} ${borderColor}` : "none";
});

const style = computed(() => {
    const { 
        paddingTop = 4, 
        paddingRight = 8, 
        paddingBottom = 4, 
        paddingLeft = 8,
        fontFamily = "inherit",
        fontSize = 12,
        fontWeight = "normal",
        fontStyle = "normal",
        color = "#000000",
        backgroundColor = "transparent",
        textAlign = "left",
        borderRadius = 0
    } = props.block;

    return {
        width: "100%",
        height: "100%",
        padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight,
        fontStyle,
        color,
        backgroundColor,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: "2px",
        textAlign,
        border: borderStyle.value,
        borderRadius: `${borderRadius}px`
    };
});
</script>
<template>
    <div :style="style">
        <!-- Section Header (label) -->
        <div
            v-if="block.label || fillMode"
            class="bank-label text-[10px] uppercase tracking-wider font-semibold opacity-70"
            style="font-size: 0.85em; font-weight: 600; margin-bottom: 2px"
        >
            <input
                v-if="fillMode"
                type="text"
                :value="block.label ?? 'Bank Details'"
                style="border: none; background: transparent; outline: none; padding: 0; font-family: inherit; font-size: inherit; color: inherit; font-weight: inherit; text-transform: uppercase; width: 100%; text-align: inherit;"
                placeholder="Section Header"
                @input="blockStore.updateBlock(block.id, { label: $event.target.value })"
            />
            <span v-else>{{ block.label }}</span>
        </div>

        <div
            class="bank-details-body"
            style="display: flex; flex-direction: column; gap: 2px"
        >
            <!-- Bank Name -->
            <div
                v-if="block.showBankName !== false && (block.bankName || fillMode)"
                class="bank-row"
                style="display: flex; gap: 4px; align-items: center; justify-content: inherit;"
            >
                <span class="opacity-70 font-semibold" style="font-weight: 600">Bank:</span>
                <input
                    v-if="fillMode"
                    type="text"
                    :value="block.bankName ?? ''"
                    style="border: none; background: transparent; outline: none; padding: 0; font-family: inherit; font-size: inherit; color: inherit; flex: 1;"
                    placeholder="Bank Name"
                    @input="blockStore.updateBlock(block.id, { bankName: $event.target.value })"
                />
                <span v-else>{{ block.bankName }}</span>
            </div>

            <!-- Account No -->
            <div
                v-if="block.showAccountNo !== false && (block.accountNo || fillMode)"
                class="bank-row"
                style="display: flex; gap: 4px; align-items: center; justify-content: inherit;"
            >
                <span class="opacity-70 font-semibold" style="font-weight: 600">Account No:</span>
                <input
                    v-if="fillMode"
                    type="text"
                    :value="block.accountNo ?? ''"
                    style="border: none; background: transparent; outline: none; padding: 0; font-family: inherit; font-size: inherit; color: inherit; flex: 1;"
                    placeholder="Account Number"
                    @input="blockStore.updateBlock(block.id, { accountNo: $event.target.value })"
                />
                <span v-else>{{ block.accountNo }}</span>
            </div>

            <!-- Account Holder Name -->
            <div
                v-if="block.showAccountName !== false && (block.accountName || fillMode)"
                class="bank-row"
                style="display: flex; gap: 4px; align-items: center; justify-content: inherit;"
            >
                <span class="opacity-70 font-semibold" style="font-weight: 600">Account Name:</span>
                <input
                    v-if="fillMode"
                    type="text"
                    :value="block.accountName ?? ''"
                    style="border: none; background: transparent; outline: none; padding: 0; font-family: inherit; font-size: inherit; color: inherit; flex: 1;"
                    placeholder="Account Holder Name"
                    @input="blockStore.updateBlock(block.id, { accountName: $event.target.value })"
                />
                <span v-else>{{ block.accountName }}</span>
            </div>
        </div>
    </div>
</template>


<style scoped>
.bank-label {
    margin-bottom: 2px;
}
.bank-row {
    line-height: 1.4;
}
</style>