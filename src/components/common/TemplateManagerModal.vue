<script setup>
import { ref, computed } from "vue";
import { useTemplateStore } from "../../stores/template.js";
import { useBlockStore } from "../../stores/blocks.js";
import { useCanvasStore } from "../../stores/canvas.js";
import { useSettingsStore } from "../../stores/settings.js";
import { useHistoryStore } from "../../stores/history.js";
import { useTranslateUi } from "../../utils/translateUi.js";
import {
  Folder,
  FolderPlus,
  FolderOpen,
  FileText,
  Trash2,
  Edit3,
  Check,
  X,
  Plus,
  Lock,
} from "@lucide/vue";
import ConfirmModal from "./ConfirmModal.vue";

const props = defineProps({
  show: { type: Boolean, required: true },
});

const emit = defineEmits(["close"]);

const templateStore = useTemplateStore();
const blockStore = useBlockStore();
const canvasStore = useCanvasStore();
const settingsStore = useSettingsStore();
const historyStore = useHistoryStore();
const { translateUi } = useTranslateUi();

// Active folder tab: 'presets' or folder.id
const activeFolderId = ref("presets");

// Rename States
const editingFolderId = ref(null);
const renameFolderNameVal = ref("");
const editingTemplateId = ref(null);
const renameTemplateNameVal = ref("");

// Folder creation
const newFolderNameVal = ref("");
const isCreatingFolder = ref(false);

// Confirm Dialog State
const showConfirm = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmType = ref("warning");
const confirmCallback = ref(null);

function triggerConfirm(title, message, type, onConfirm) {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmType.value = type;
  confirmCallback.value = onConfirm;
  showConfirm.value = true;
}

function handleConfirm() {
  if (confirmCallback.value) confirmCallback.value();
  showConfirm.value = false;
}

// Built-in presets
const presets = [
  { id: "preset_invoice", name: "Invoice", isPreset: true },
  { id: "preset_sale_order", name: "Sale Order", isPreset: true },
  { id: "preset_receipt", name: "Receipt", isPreset: true },
  { id: "preset_quote", name: "Quote", isPreset: true },
  { id: "preset_delivery_note", name: "Delivery Note", isPreset: true },
  { id: "preset_purchase_order", name: "Purchase Order", isPreset: true },
  { id: "preset_credit_note", name: "Credit Note", isPreset: true },
];

const selectedFolder = computed(() => {
  if (activeFolderId.value === "presets") {
    return { id: "presets", name: translateUi("Built-in Presets"), isPreset: true };
  }
  return templateStore.folders.find((f) => f.id === activeFolderId.value) || null;
});

const currentTemplatesList = computed(() => {
  if (activeFolderId.value === "presets") {
    return presets;
  }
  const folder = templateStore.folders.find((f) => f.id === activeFolderId.value);
  return folder ? folder.templates || [] : [];
});

// Create folder action
function handleCreateFolder() {
  const name = newFolderNameVal.value.trim();
  if (name) {
    const folder = templateStore.createFolder(name);
    if (folder) {
      activeFolderId.value = folder.id;
      newFolderNameVal.value = "";
      isCreatingFolder.value = false;
    }
  }
}

// Rename folder action
function startRenameFolder(folder) {
  editingFolderId.value = folder.id;
  renameFolderNameVal.value = folder.name;
}

function saveRenameFolder(folderId) {
  const name = renameFolderNameVal.value.trim();
  if (name) {
    templateStore.renameFolder(folderId, name);
    editingFolderId.value = null;
  }
}

// Delete folder action
function handleDeleteFolder(folder) {
  triggerConfirm(
    translateUi("Delete Folder"),
    `${translateUi("Are you sure you want to delete folder")} "${folder.name}" ${translateUi("and all its templates? This cannot be undone.")}`,
    "danger",
    () => {
      templateStore.deleteFolder(folder.id);
      activeFolderId.value = "presets";
    }
  );
}

// Delete template action
function handleDeleteTemplate(template) {
  triggerConfirm(
    translateUi("Delete Template"),
    `${translateUi("Are you sure you want to delete template")} "${template.name}"?`,
    "danger",
    () => {
      templateStore.deleteTemplate(activeFolderId.value, template.id);
    }
  );
}

// Load template action
function handleLoadTemplate(template) {
  const loadAction = () => {
    if (template.isPreset) {
      const { width, height } = canvasStore.paperDimensions;
      settingsStore.setDocumentType(template.name);
      blockStore.loadPreset(template.name, width, height);
      templateStore.currentTemplateId = null;
      templateStore.currentTemplateName = `${template.name} Template`;
      templateStore.currentFolderId = null;
      templateStore.isDirty = false;
      historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
    } else {
      templateStore.loadTemplate(template);
    }
    emit("close");
  };

  // Check unsaved changes
  if (templateStore.isDirty && blockStore.blocks.length > 0) {
    triggerConfirm(
      translateUi("Unsaved Changes"),
      translateUi("You have unsaved changes on your canvas. Loading a template will overwrite them. Proceed?"),
      "warning",
      loadAction
    );
  } else {
    loadAction();
  }
}

function handleClose() {
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="handleClose">
      <div class="template-manager panel animate-fade-in">
        <!-- Header -->
        <div class="manager-header">
          <div class="title flex items-center gap-2">
            <FolderOpen :size="16" class="text-accent" />
            <span>{{ translateUi("Template Folder Manager") }}</span>
          </div>
          <button class="close-btn" @click="handleClose">
            <X :size="16" />
          </button>
        </div>

        <div class="manager-content">
          <!-- Sidebar: Folders List -->
          <div class="manager-sidebar">
            <div class="section-title">{{ translateUi("Folders") }}</div>
            <div class="folders-list">
              <!-- Presets Folder -->
              <div
                class="folder-item"
                :class="{ active: activeFolderId === 'presets' }"
                @click="activeFolderId = 'presets'"
              >
                <div class="flex items-center gap-2">
                  <Lock :size="12" class="text-panel-muted" />
                  <span class="folder-name">{{ translateUi("Presets") }}</span>
                </div>
              </div>

              <!-- User Folders -->
              <div
                v-for="folder in templateStore.folders"
                :key="folder.id"
                class="folder-item"
                :class="{ active: activeFolderId === folder.id }"
                @click="activeFolderId = folder.id"
              >
                <!-- Edit Mode -->
                <div v-if="editingFolderId === folder.id" class="rename-container" @click.stop>
                  <input
                    type="text"
                    v-model="renameFolderNameVal"
                    class="rename-input"
                    @keyup.enter="saveRenameFolder(folder.id)"
                    @keyup.esc="editingFolderId = null"
                    v-focus
                  />
                  <button class="icon-action-btn check" @click="saveRenameFolder(folder.id)">
                    <Check :size="12" />
                  </button>
                  <button class="icon-action-btn cancel" @click="editingFolderId = null">
                    <X :size="12" />
                  </button>
                </div>
                <!-- Normal Mode -->
                <div v-else class="folder-content-wrapper">
                  <div class="flex items-center gap-2">
                    <Folder :size="13" class="text-accent-dim" />
                    <span class="folder-name">{{ folder.name }}</span>
                  </div>
                  <div class="folder-actions" @click.stop>
                    <button class="action-btn-mini" @click="startRenameFolder(folder)">
                      <Edit3 :size="11" />
                    </button>
                    <button class="action-btn-mini text-warning" @click="handleDeleteFolder(folder)">
                      <Trash2 :size="11" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Create Folder Input at Bottom -->
            <div class="create-folder-footer">
              <div v-if="isCreatingFolder" class="flex flex-col gap-2 w-full">
                <input
                  v-model="newFolderNameVal"
                  type="text"
                  placeholder="New folder name..."
                  class="inp"
                  style="font-size: 11px; padding: 4px 6px;"
                  @keyup.enter="handleCreateFolder"
                  @keyup.esc="isCreatingFolder = false"
                  v-focus
                />
                <div class="flex gap-1 justify-end">
                  <button class="btn btn-ghost py-0.5 px-2 text-[10px]" @click="isCreatingFolder = false">
                    Cancel
                  </button>
                  <button class="btn btn-accent py-0.5 px-2 text-[10px]" @click="handleCreateFolder">
                    Create
                  </button>
                </div>
              </div>
              <button v-else class="btn btn-ghost w-full justify-center gap-1 py-1 text-[11px]" @click="isCreatingFolder = true">
                <FolderPlus :size="13" />
                {{ translateUi("New Folder") }}
              </button>
            </div>
          </div>

          <!-- Main Pane: Templates List -->
          <div class="manager-body">
            <div class="body-header">
              <span class="folder-title">{{ selectedFolder ? selectedFolder.name : '' }}</span>
              <span class="templates-count text-[11px] text-panel-muted">
                {{ currentTemplatesList.length }} {{ translateUi("templates") }}
              </span>
            </div>

            <div v-if="currentTemplatesList.length === 0" class="empty-state">
              <FileText :size="40" class="text-panel-border" />
              <div class="empty-title">{{ translateUi("No templates here") }}</div>
              <p class="empty-desc">
                {{ translateUi("This folder is empty. Save a template from the canvas to populate it.") }}
              </p>
            </div>

            <div v-else class="templates-grid scrollbar">
              <div
                v-for="tpl in currentTemplatesList"
                :key="tpl.id"
                class="template-card"
                @dblclick="handleLoadTemplate(tpl)"
              >
                <!-- Thumbnail / Placeholder -->
                <div class="card-preview">
                  <img v-if="tpl.thumbnail" :src="tpl.thumbnail" class="thumbnail-img" />
                  <div v-else class="placeholder-preview">
                    <FileText :size="28" class="text-panel-border" />
                  </div>
                  <!-- Hover Overlay button -->
                  <div class="hover-overlay">
                    <button class="btn btn-accent btn-sm" @click="handleLoadTemplate(tpl)">
                      {{ translateUi("Load Template") }}
                    </button>
                  </div>
                </div>

                <!-- Template Details -->
                <div class="card-details">
                  <div class="card-name-row">
                    <span class="card-name">{{ tpl.name }}</span>
                    <button
                      v-if="!tpl.isPreset"
                      class="delete-card-btn"
                      :title="translateUi('Delete Template')"
                      @click.stop="handleDeleteTemplate(tpl)"
                    >
                      <Trash2 :size="12" />
                    </button>
                  </div>
                  <div class="card-meta">
                    <span v-if="tpl.isPreset" class="preset-badge">{{ translateUi("System Preset") }}</span>
                    <span v-else class="date-text">
                      {{ translateUi("Updated") }}: {{ new Date(tpl.updatedAt).toLocaleDateString() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :show="showConfirm"
      :title="confirmTitle"
      :message="confirmMessage"
      :type="confirmType"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-manager {
  width: 850px;
  height: 580px;
  border-radius: 12px;
  border: 1px solid var(--color-panel-border);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-panel);
}

.manager-header {
  height: 48px;
  border-bottom: 1px solid var(--color-panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(0,0,0,0.15);
}

.manager-header .title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-panel-text);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-panel-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-panel-hover);
  color: #fff;
}

.manager-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Sidebar styling */
.manager-sidebar {
  width: 230px;
  border-right: 1px solid var(--color-panel-border);
  background: rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.manager-sidebar .section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-panel-muted);
  padding: 14px 16px 8px;
  letter-spacing: 0.05em;
}

.folders-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.folder-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-panel-muted);
  font-size: 12px;
  font-weight: 500;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.folder-item:hover {
  background: var(--color-panel-hover);
  color: var(--color-panel-text);
}

.folder-item.active {
  background: var(--color-accent-dim);
  color: var(--color-accent);
}

.folder-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.folder-actions {
  display: none;
  gap: 4px;
}

.folder-item:hover .folder-actions {
  display: flex;
}

.action-btn-mini {
  background: transparent;
  border: none;
  color: var(--color-panel-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn-mini:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.rename-container {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.rename-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-accent);
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  padding: 2px 4px;
  outline: none;
}

.icon-action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 3px;
  border-radius: 3px;
  color: var(--color-panel-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-action-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.icon-action-btn.check:hover {
  color: var(--color-accent);
}

.create-folder-footer {
  padding: 12px;
  border-top: 1px solid var(--color-panel-border);
}

/* Main body area */
.manager-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.01);
  height: 100%;
}

.body-header {
  height: 48px;
  border-bottom: 1px solid var(--color-panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.body-header .folder-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-panel-text);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-panel-muted);
  text-align: center;
  padding: 40px;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  margin-top: 12px;
  color: var(--color-panel-text);
}

.empty-desc {
  font-size: 11px;
  max-width: 250px;
  margin-top: 6px;
  line-height: 1.4;
}

.templates-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 16px;
  align-content: start;
}

.template-card {
  border-radius: 8px;
  border: 1px solid var(--color-panel-border);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.template-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-accent);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.card-preview {
  height: 110px;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--color-panel-border);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.template-card:hover .thumbnail-img {
  opacity: 0.55;
}

.placeholder-preview {
  opacity: 0.5;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.template-card:hover .hover-overlay {
  opacity: 1;
}

.card-details {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.card-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-panel-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 4px;
}

.delete-card-btn {
  background: transparent;
  border: none;
  color: var(--color-panel-muted);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  opacity: 0;
  transition: all var(--transition-fast);
}

.template-card:hover .delete-card-btn {
  opacity: 0.7;
}

.delete-card-btn:hover {
  opacity: 1 !important;
  color: var(--color-accent-warning, #ef476f);
  background: rgba(255, 255, 255, 0.05);
}

.card-meta {
  font-size: 9px;
  color: var(--color-panel-muted);
}

.preset-badge {
  background: var(--color-accent-dim);
  color: var(--color-accent);
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 600;
}

.date-text {
  opacity: 0.75;
}
</style>
