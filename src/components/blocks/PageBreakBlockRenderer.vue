<script setup>
import { computed } from 'vue'
import { usePreviewStore } from '../../stores/preview.js'

const props = defineProps({
    block: {
        type: Object,
        required: true
    },
    fillMode: {
        type: Boolean,
        default: false
    }
})

const previewStore = usePreviewStore()

const breakStyle = computed(() => {
    if (previewStore.isPreviewMode) {
        return {
            pageBreakAfter: 'always',
            breakAfter: 'page',
            width: '100%',
            height: '0px',
            opacity: 0,
            overflow: 'hidden'
        }
    }
    
    // In design mode, show a visible line to represent the page break
    return {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px dashed #ff4757',
        opacity: 0.7,
        position: 'relative'
    }
})
</script>

<template>
    <div :style="breakStyle">
        <span v-if="!previewStore.isPreviewMode" style="
            background: #ff4757; 
            color: white; 
            padding: 2px 8px; 
            border-radius: 4px; 
            font-size: 10px; 
            font-weight: bold;
            position: absolute;
            top: -8px;
        ">
            PAGE BREAK
        </span>
    </div>
</template>
