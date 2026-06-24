<script setup>
import { onMounted, onUnmounted } from "vue";
import { AlertCircle, HelpCircle, AlertTriangle } from "@lucide/vue";

const props = defineProps({
    show: Boolean,
    title: {
        type: String,
        default: "Confirmation"
    },
    message: String,
    confirmText: {
        type: String,
        default: "OK"
    },
    cancelText: {
        type: String,
        default: "Cancel"
    },
    type: {
        type: String,
        default: "warning" // 'warning', 'danger', 'info'
    }
});

const emit = defineEmits(["confirm", "cancel"]);

function handleConfirm() {
    emit("confirm");
}

function handleCancel() {
    emit("cancel");
}

function handleKeyDown(e) {
    if (!props.show) return;
    if (e.key === "Escape") {
        handleCancel();
    } else if (e.key === "Enter") {
        handleConfirm();
    }
}

onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div
                v-if="show"
                class="confirm-modal-overlay"
                @click.self="handleCancel"
            >
                <div class="confirm-modal-card panel animate-fade-in">
                    <div class="confirm-modal-header">
                        <div class="confirm-modal-icon-container" :class="`icon-${type}`">
                            <AlertTriangle v-if="type === 'warning'" :size="20" />
                            <AlertCircle v-else-if="type === 'danger'" :size="20" />
                            <HelpCircle v-else :size="20" />
                        </div>
                        <h3 class="confirm-modal-title">{{ title }}</h3>
                    </div>
                    
                    <p class="confirm-modal-message">{{ message }}</p>
                    
                    <div class="confirm-modal-actions">
                        <button class="btn btn-ghost" @click="handleCancel">
                            {{ cancelText }}
                        </button>
                        <button 
                            class="btn" 
                            :class="{
                                'btn-accent': type === 'warning' || type === 'info',
                                'btn-danger-solid': type === 'danger'
                            }"
                            @click="handleConfirm"
                        >
                            {{ confirmText }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.confirm-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 10, 20, 0.6);
    backdrop-filter: blur(4px);
}

.confirm-modal-card {
    border-radius: 12px;
    padding: 24px;
    width: 420px;
    border: 1px solid var(--color-panel-border);
    background: var(--color-panel);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
}

.confirm-modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.confirm-modal-icon-container {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-warning {
    background: rgba(255, 159, 28, 0.15);
    color: var(--color-warning);
}

.icon-danger {
    background: rgba(230, 57, 70, 0.15);
    color: var(--color-danger);
}

.icon-info {
    background: rgba(0, 180, 216, 0.15);
    color: var(--color-accent);
}

.confirm-modal-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
}

.confirm-modal-message {
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-panel-text);
    margin: 0 0 20px 0;
}

.confirm-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.btn-danger-solid {
    background: var(--color-danger);
    color: #ffffff;
    font-weight: 600;
}
.btn-danger-solid:hover {
    background: #d62828;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
