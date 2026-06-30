<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useCanvasStore } from "../../stores/canvas.js";
import { useSettingsStore } from "../../stores/settings.js";
import { useTemplateStore } from "../../stores/template.js";
import { useHistoryStore } from "../../stores/history.js";
import { useBlockStore } from "../../stores/blocks.js";
import { useFormatMigration } from "../../composables/useFormatMigration.js";
import { usePreviewStore } from "../../stores/preview.js";
import {
    FileText,
    Building2,
    RotateCcw,
    RotateCw,
    Save,
    Upload,
    Download,
    PenLine,
    Layout,
    ChevronDown,
    SwitchCamera,
    RefreshCw,
    FolderOpen,
    CheckCircle,
    AlertCircle,
    Loader,
    Printer,

    Bold,
    Italic,
    Underline,
    Strikethrough,
    Sliders,
} from "@lucide/vue";

import ConfirmModal from "../common/ConfirmModal.vue";
import TemplateManagerModal from "../common/TemplateManagerModal.vue";

const canvasStore = useCanvasStore();
const settingsStore = useSettingsStore();
const templateStore = useTemplateStore();
const historyStore = useHistoryStore();
const blockStore = useBlockStore();
const { switchFormat, switchOrientation } = useFormatMigration();
const previewStore = usePreviewStore();

const showConfirmModal = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmType = ref("warning");
const confirmCallback = ref(null);
const cancelCallback = ref(null);

function triggerConfirm(title, message, type, onConfirm, onCancel) {
    confirmTitle.value = title;
    confirmMessage.value = message;
    confirmType.value = type || "warning";
    confirmCallback.value = onConfirm;
    cancelCallback.value = onCancel;
    showConfirmModal.value = true;
}

function handleConfirmModal() {
    if (confirmCallback.value) confirmCallback.value();
    showConfirmModal.value = false;
}

function handleCancelModal() {
    if (cancelCallback.value) cancelCallback.value();
    showConfirmModal.value = false;
}

const importMenuOpen = ref(false);
const exportMenuOpen = ref(false);
const formatSettingsMenuOpen = ref(false);
const showSaveModal = ref(false);
const saveName = ref(templateStore.currentTemplateName);
const showTemplateManager = ref(false);
const saveFolderId = ref("");
const newFolderName = ref("");

const importBtnEl = ref(null);
const exportBtnEl = ref(null);
const formatSettingsBtnEl = ref(null);
const importMenuPosition = ref({ top: "0px", right: "0px" });
const exportMenuPosition = ref({ top: "0px", right: "0px" });
const formatSettingsMenuPosition = ref({ top: "0px", right: "0px" });

function toggleImportMenu() {
    importMenuOpen.value = !importMenuOpen.value;
    if (importMenuOpen.value) {
        exportMenuOpen.value = false;
        formatSettingsMenuOpen.value = false;
        if (importBtnEl.value) {
            const rect = importBtnEl.value.getBoundingClientRect();
            importMenuPosition.value = {
                top: `${rect.bottom + 4}px`,
                right: `${window.innerWidth - rect.right}px`,
            };
        }
    }
}

function toggleExportMenu() {
    exportMenuOpen.value = !exportMenuOpen.value;
    if (exportMenuOpen.value) {
        importMenuOpen.value = false;
        formatSettingsMenuOpen.value = false;
        if (exportBtnEl.value) {
            const rect = exportBtnEl.value.getBoundingClientRect();
            exportMenuPosition.value = {
                top: `${rect.bottom + 4}px`,
                right: `${window.innerWidth - rect.right}px`,
            };
        }
    }
}

function toggleTranslateMenu() {
    translateMenuOpen.value = !translateMenuOpen.value;
    if (translateMenuOpen.value) {
        importMenuOpen.value = false;
        exportMenuOpen.value = false;
        formatSettingsMenuOpen.value = false;
        if (translateBtnEl.value) {
            const rect = translateBtnEl.value.getBoundingClientRect();
            translateMenuPosition.value = {
                top: `${rect.bottom + 4}px`,
                right: `${window.innerWidth - rect.right}px`,
            };
        }
    }
}

function toggleFormatSettingsMenu() {
    formatSettingsMenuOpen.value = !formatSettingsMenuOpen.value;
    if (formatSettingsMenuOpen.value) {
        importMenuOpen.value = false;
        exportMenuOpen.value = false;
        if (formatSettingsBtnEl.value) {
            const rect = formatSettingsBtnEl.value.getBoundingClientRect();
            formatSettingsMenuPosition.value = {
                top: `${rect.bottom + 4}px`,
                right: `${window.innerWidth - rect.right}px`,
            };
        }
    }
}

// ─── Text Block Selection Context ────────────────────────────
const isTextBlockSelected = computed(() => {
    const block = blockStore.selectedBlock;
    if (!block) return false;
    const nonTextTypes = [
        "image",
        "divider",
        "spacer",
        "shape",
        "container",
        "stamp_box",
        "cut_line",
        "checkboxes_row",
        "barcode",
    ];
    return !nonTextTypes.includes(block.type);
});

const selectedBlockFontFamily = computed({
    get() {
        return blockStore.selectedBlock?.fontFamily ?? "inherit";
    },
    set(val) {
        if (blockStore.selectedBlock) {
            blockStore.updateBlock(blockStore.selectedBlock.id, { fontFamily: val });
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        }
    }
});

const selectedBlockFontSize = computed({
    get() {
        return blockStore.selectedBlock?.fontSize ?? 13;
    },
    set(val) {
        if (blockStore.selectedBlock) {
            blockStore.updateBlock(blockStore.selectedBlock.id, { fontSize: Number(val) || 13 });
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        }
    }
});

watch(
    () => blockStore.selectedBlock,
    (newBlock) => {
        if (newBlock) {
            if (newBlock.color && newBlock.color.startsWith("#")) {
                textColorVal.value = newBlock.color;
            } else {
                textColorVal.value = "#000000";
            }
        }
    },
    { immediate: true }
);

// ─── Consolidated Document & Preset Loading ───────────────────
const activeDocumentSelectValue = computed(() => {
    return templateStore.currentTemplateId || settingsStore.documentType || 'Custom';
});

function handleDocumentSelectChange(e) {
    const val = e.target.value;
    const previousVal = activeDocumentSelectValue.value;
    
    const revertSelect = () => {
        e.target.value = previousVal;
    };

    const template = templateStore.templates.find(t => t.id === val);
    
    if (template) {
        triggerConfirm(
            "Load Template",
            `Load saved template "${template.name}"? This will overwrite your current canvas.`,
            "warning",
            () => {
                const schema = template.schema;
                if (schema.blocks) blockStore.setBlocks(schema.blocks);
                if (schema.format) canvasStore.setFormat(schema.format);
                if (schema.orientation) canvasStore.setOrientation(schema.orientation);
                if (schema.settings) {
                    if (schema.settings.currency) settingsStore.setCurrency(schema.settings.currency);
                    if (schema.settings.globalFont) settingsStore.setGlobalFont(schema.settings.globalFont);
                    if (schema.settings.globalFontSize) settingsStore.setGlobalFontSize(schema.settings.globalFontSize);
                    if (schema.settings.documentType) settingsStore.setDocumentType(schema.settings.documentType);
                }
                templateStore.currentTemplateId = template.id;
                templateStore.currentTemplateName = template.name;
                historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
                showToast(`✓ "${template.name}" loaded`, "success");
            },
            revertSelect
        );
    } else {
        if (blockStore.blocks.length === 0) {
            settingsStore.setDocumentType(val);
            templateStore.currentTemplateId = null;
            templateStore.currentTemplateName = val === 'Custom' ? "Untitled Template" : `${val} Template`;
            const { width, height } = canvasStore.paperDimensions;
            blockStore.loadPreset(val, width, height);
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
            return;
        }
        
        triggerConfirm(
            val === 'Custom' ? "Reset Canvas" : "Load Preset Layout",
            val === 'Custom' 
                ? "Reset canvas to a blank Custom layout? This will overwrite your current changes."
                : `Load default preset layout for "${val}"? This will overwrite your current canvas.`,
            "warning",
            () => {
                settingsStore.setDocumentType(val);
                templateStore.currentTemplateId = null;
                templateStore.currentTemplateName = val === 'Custom' ? "Untitled Template" : `${val} Template`;
                const { width, height } = canvasStore.paperDimensions;
                blockStore.loadPreset(val, width, height);
                historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
                if (val !== 'Custom') {
                    showToast(`✓ Preset "${val}" loaded`, "success");
                }
            },
            revertSelect
        );
    }
}

// ─── Export loading & toast ───────────────────────────────────
const isExporting = ref(false);
const toast = ref({ visible: false, message: "", type: "success" });
let toastTimer = null;

function showToast(message, type = "success") {
    clearTimeout(toastTimer);
    toast.value = { visible: true, message, type };
    toastTimer = setTimeout(() => {
        toast.value.visible = false;
    }, 3500);
}

function onExportStart() {
    isExporting.value = true;
}
function onExportDone(e) {
    isExporting.value = false;
    showToast(`✓ Saved: ${e.detail.filename}`, "success");
}
function onExportError(e) {
    isExporting.value = false;
    showToast(
        `✗ Export failed: ${e.detail?.message || "Unknown error"}`,
        "error",
    );
}

onMounted(() => {
    document.addEventListener("export:start", onExportStart);
    document.addEventListener("export:done", onExportDone);
    document.addEventListener("export:error", onExportError);
});
onUnmounted(() => {
    document.removeEventListener("export:start", onExportStart);
    document.removeEventListener("export:done", onExportDone);
    document.removeEventListener("export:error", onExportError);
});

// ─── Formats ─────────────────────────────────────────────────
const formats = ["A4", "A5", "RECEIPT_58", "RECEIPT_80"];
const formatLabels = {
    A4: "A4",
    A5: "A5",
    RECEIPT_58: "58mm",
    RECEIPT_80: "80mm",
};

// ─── Undo / Redo ─────────────────────────────────────────────
function handleUndo() {
    const snapshot = historyStore.undo();
    if (snapshot) blockStore.setBlocks(snapshot);
}
function handleRedo() {
    const snapshot = historyStore.redo();
    if (snapshot) blockStore.setBlocks(snapshot);
}

// ─── Save: Show Save Modal ───────────────────────────────────
function handleSave() {
    saveName.value = templateStore.currentTemplateName || "Untitled Template";
    newFolderName.value = "";
    
    // Default folder to current folder if exists, or first folder if exists, or "__new__"
    if (templateStore.currentFolderId) {
        saveFolderId.value = templateStore.currentFolderId;
    } else if (templateStore.folders.length > 0) {
        saveFolderId.value = templateStore.folders[0].id;
    } else {
        saveFolderId.value = "__new__";
    }
    showSaveModal.value = true;
}

function confirmSave() {
    let folderId = saveFolderId.value;
    
    // Create folder on the fly if '__new__' is selected
    if (folderId === "__new__") {
        const fName = newFolderName.value.trim() || "New Folder";
        const newFolder = templateStore.createFolder(fName);
        if (newFolder) {
            folderId = newFolder.id;
        } else {
            showToast("✗ Failed to create folder", "error");
            return;
        }
    }
    
    const schema = buildSchema(saveName.value);
    templateStore.saveTemplate(saveName.value, folderId, schema);
    showSaveModal.value = false;
    showToast(`✓ "${saveName.value}" saved to browser`, "success");
}

// ─── Save to device (download JSON) ──────────────────────────
function downloadJson() {
    const schema = buildSchema(
        saveName.value || templateStore.currentTemplateName,
    );
    templateStore.exportAsJson(schema);
    showSaveModal.value = false;
}

function buildSchema(name) {
    return {
        name,
        format: canvasStore.formatId,
        orientation: canvasStore.orientation,
        blocks: JSON.parse(JSON.stringify(blockStore.blocks)),
        settings: {
            globalFont: settingsStore.globalFont,
            globalFontSize: settingsStore.globalFontSize,
            currency: settingsStore.currency,
            documentType: settingsStore.documentType,
            globalFormat: JSON.parse(JSON.stringify(settingsStore.globalFormat)),
        },
    };
}

// ─── Export (PDF / PNG / JSON) ────────────────────────────────
function exportPDF() {
    document.dispatchEvent(new CustomEvent("canvas:export-pdf"));
    exportMenuOpen.value = false;
}
function exportPNG() {
    document.dispatchEvent(new CustomEvent("canvas:export-png"));
    exportMenuOpen.value = false;
}
function exportDOCX() {
    document.dispatchEvent(new CustomEvent("canvas:export-docx"));
    exportMenuOpen.value = false;
}
function exportCSV() {
    document.dispatchEvent(new CustomEvent("canvas:export-csv"));
    exportMenuOpen.value = false;
}
function exportJSON() {
    const schema = buildSchema(templateStore.currentTemplateName);
    templateStore.exportAsJson(schema);
    exportMenuOpen.value = false;
}

// ─── Import from JSON file ────────────────────────────────────
function importFromFile() {
    importMenuOpen.value = false;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = async (e) => {
        const file = e.target.files[0];
        document.body.removeChild(input);
        if (!file) return;

        try {
            const schema = await templateStore.importFromJson(file);
            if (schema.blocks) blockStore.setBlocks(schema.blocks);
            if (schema.format) canvasStore.setFormat(schema.format);
            if (schema.orientation)
                canvasStore.setOrientation(schema.orientation);
            if (schema.name) templateStore.currentTemplateName = schema.name;
            if (schema.settings) {
                if (schema.settings.currency)
                    settingsStore.setCurrency(schema.settings.currency);
                if (schema.settings.globalFont)
                    settingsStore.setGlobalFont(schema.settings.globalFont);
                if (schema.settings.globalFontSize)
                    settingsStore.setGlobalFontSize(
                        schema.settings.globalFontSize,
                    );
                if (schema.settings.documentType)
                    settingsStore.setDocumentType(schema.settings.documentType);
                if (schema.settings.globalFormat) {
                    settingsStore.globalFormat = {
                        ...settingsStore.globalFormat,
                        ...schema.settings.globalFormat
                    };
                }
            }
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
            showToast(`✓ "${schema.name || file.name}" loaded`, "success");
        } catch (err) {
            showToast(`✗ Failed to load: ${err.message}`, "error");
        }
    };

    input.click();
}

// ─── Import from CSV file ─────────────────────────────────────
function importCSVFromFile() {
    importMenuOpen.value = false;
    
    // Find item table block to import into
    const tableBlock = blockStore.selectedBlock?.type === 'item_table' 
        ? blockStore.selectedBlock 
        : blockStore.blocks.find(b => b.type === 'item_table');
        
    if (!tableBlock) {
        showToast("✗ No Item Table found to import data into. Please select or add an Item Table block first.", "error");
        return;
    }
    
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,text/csv";
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = async (e) => {
        const file = e.target.files[0];
        document.body.removeChild(input);
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const text = evt.target.result;
                const lines = parseCSVText(text);
                if (lines.length < 2) {
                    throw new Error("CSV file must contain a header row and at least one data row.");
                }
                
                const headers = lines[0].map(h => h.trim().toLowerCase());
                
                // Map headers to column IDs
                const headerMap = {};
                headers.forEach((header, idx) => {
                    if (header.includes("description") || header.includes("desc") || header.includes("item")) {
                        headerMap.description = idx;
                    } else if (header.includes("qty") || header.includes("quantity")) {
                        headerMap.qty = idx;
                    } else if (header.includes("price") || header.includes("rate") || header.includes("unit")) {
                        headerMap.unit_price = idx;
                    } else if (header.includes("discount")) {
                        headerMap.discount = idx;
                    } else if (header.includes("tax")) {
                        headerMap.tax = idx;
                    } else if (header.includes("no") || header.includes("num")) {
                        headerMap.no = idx;
                    } else if (header.includes("total") || header.includes("amount")) {
                        headerMap.total = idx;
                    }
                });
                
                // Fallback column indexing if headers didn't match cleanly
                if (Object.keys(headerMap).length === 0) {
                    const visibleCols = (tableBlock.columns || []).filter(c => c.visible !== false);
                    visibleCols.forEach((col, idx) => {
                        if (idx < headers.length) {
                            headerMap[col.id] = idx;
                        }
                    });
                }

                const importedItems = [];
                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i];
                    if (row.length === 0 || (row.length === 1 && row[0] === "")) continue; // Skip empty rows
                    
                    const item = {};
                    
                    // Fill known mapped fields
                    Object.entries(headerMap).forEach(([colId, idx]) => {
                        if (idx < row.length) {
                            item[colId] = row[idx].trim();
                        }
                    });
                    
                    // Defaults for columns that are present in the table Block but not imported
                    tableBlock.columns.forEach(col => {
                        if (item[col.id] === undefined) {
                            item[col.id] = "";
                        }
                    });
                    
                    // Auto compute total if qty and price exist
                    if (item.total === "" || item.total === undefined) {
                        const q = parseFloat(item.qty || 0);
                        const p = parseFloat(item.unit_price || 0);
                        if (!isNaN(q) && !isNaN(p)) {
                            item.total = String(q * p);
                        }
                    }
                    
                    importedItems.push(item);
                }
                
                // Update table block in store
                blockStore.updateBlock(tableBlock.id, { 
                    items: importedItems,
                    emptyRows: Math.max(importedItems.length, tableBlock.emptyRows || 3)
                });
                historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
                showToast(`✓ Imported ${importedItems.length} items from "${file.name}"`, "success");
            } catch (err) {
                showToast(`✗ Failed to load CSV: ${err.message}`, "error");
            }
        };
        reader.onerror = () => showToast("✗ Error reading file", "error");
        reader.readAsText(file);
    };

    input.click();
}

/**
 * Simple CSV parser that handles comma separation and quoted values correctly.
 */
function parseCSVText(text) {
    const lines = [];
    let row = [""];
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                row[row.length - 1] += '"';
                i++; // skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            row.push("");
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++; // skip \n
            }
            lines.push(row);
            row = [""];
        } else {
            row[row.length - 1] += char;
        }
    }
    
    if (row.length > 1 || row[0] !== "") {
        lines.push(row);
    }
    
    return lines;
}

// ─── Print ───────────────────────────────────────────────────
async function handlePrint() {
    const backupZoom = canvasStore.zoom;
    const backupFillMode = canvasStore.fillMode;
    const backupPreview = previewStore.isPreviewMode;
    
    // Set zoom to 1, disable fill mode, and force preview mode for clean rendering
    canvasStore.setZoom(1);
    canvasStore.setFillMode(false);
    previewStore.isPreviewMode = true;
    previewStore.isPrinting = true;
    
    // Wait for Vue's next tick and a short timeout to let the browser compute the layout reflow
    await nextTick();
    await new Promise((r) => setTimeout(r, 800));
    
    window.print();
    
    // Restore state after print dialog closes
    setTimeout(() => {
        canvasStore.setZoom(backupZoom);
        canvasStore.setFillMode(backupFillMode);
        previewStore.isPreviewMode = backupPreview;
        previewStore.isPrinting = false;
    }, 500);
}

// ─── Template Select & Load ───────────────────────────────────
const activeTemplateSelectValue = computed(() => {
    return templateStore.currentTemplateId || 'Custom';
});

function handleTemplateSelectChange(e) {
    const val = e.target.value;
    const previousVal = activeTemplateSelectValue.value;
    
    const revertSelect = () => {
        e.target.value = previousVal;
    };

    if (val === 'Custom') {
        if (blockStore.blocks.length === 0) {
            templateStore.currentTemplateId = null;
            templateStore.currentTemplateName = "Untitled Template";
            const { width, height } = canvasStore.paperDimensions;
            blockStore.loadPreset('Custom', width, height);
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
            return;
        }
        triggerConfirm(
            "Reset Canvas",
            "Reset canvas to a blank Custom layout? This will overwrite your current changes.",
            "warning",
            () => {
                templateStore.currentTemplateId = null;
                templateStore.currentTemplateName = "Untitled Template";
                const { width, height } = canvasStore.paperDimensions;
                blockStore.loadPreset('Custom', width, height);
                historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
            },
            revertSelect
        );
    } else {
        const template = templateStore.templates.find(t => t.id === val);
        if (!template) return;
        
        triggerConfirm(
            "Load Template",
            `Load saved template "${template.name}"? This will overwrite your current canvas.`,
            "warning",
            () => {
                const schema = template.schema;
                if (schema.blocks) blockStore.setBlocks(schema.blocks);
                if (schema.format) canvasStore.setFormat(schema.format);
                if (schema.orientation) canvasStore.setOrientation(schema.orientation);
                if (schema.settings) {
                    if (schema.settings.currency) settingsStore.setCurrency(schema.settings.currency);
                    if (schema.settings.globalFont) settingsStore.setGlobalFont(schema.settings.globalFont);
                    if (schema.settings.globalFontSize) settingsStore.setGlobalFontSize(schema.settings.globalFontSize);
                    if (schema.settings.documentType) settingsStore.setDocumentType(schema.settings.documentType);
                }
                templateStore.currentTemplateId = template.id;
                templateStore.currentTemplateName = template.name;
                historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
                showToast(`✓ "${template.name}" loaded`, "success");
            },
            revertSelect
        );
    }
}

// ─── Document type & reset ────────────────────────────────────
function handleDocumentTypeChange(e) {
    const newType = e.target.value;
    if (blockStore.blocks.length === 0) {
        settingsStore.setDocumentType(newType);
        const { width, height } = canvasStore.paperDimensions;
        blockStore.loadPreset(newType, width, height);
        historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        return;
    }
    
    triggerConfirm(
        "Load Preset Layout",
        `Load default preset layout for "${newType}"? This will overwrite your current canvas.`,
        "warning",
        () => {
            settingsStore.setDocumentType(newType);
            const { width, height } = canvasStore.paperDimensions;
            blockStore.loadPreset(newType, width, height);
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        },
        () => {
            settingsStore.setDocumentType(newType);
        }
    );
}

function handleResetToDefault() {
    const currentType = settingsStore.documentType;
    triggerConfirm(
        "Reset Canvas",
        `Reset the canvas to the default layout for "${currentType}"? This will overwrite your current changes.`,
        "warning",
        () => {
            const { width, height } = canvasStore.paperDimensions;
            blockStore.loadPreset(currentType, width, height);
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        }
    );
}



const textColorInput = ref(null);
const highlightColorInput = ref(null);
const textColorVal = ref("#000000");
const highlightColorVal = ref("#ffff00");

function triggerColorPicker() {
    if (textColorInput.value) {
        textColorInput.value.click();
    }
}

function triggerHighlightPicker() {
    if (highlightColorInput.value) {
        highlightColorInput.value.click();
    }
}

function execFormatting(command, value = null) {
    const selection = window.getSelection();
    const activeEl = document.activeElement;
    const hasSelection = selection && selection.toString().length > 0 && 
                         activeEl && activeEl.hasAttribute('contenteditable');

    if (hasSelection) {
        document.execCommand(command, false, value);
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        const block = blockStore.selectedBlock;
        if (block && !block.locked) {
            if (block.type === 'item_table') {
                const selectedCells = block.selectedCells ?? [];
                if (selectedCells.length > 0) {
                    const cellStyles = JSON.parse(JSON.stringify(block.cellStyles ?? {}));
                    selectedCells.forEach(cellKey => {
                        if (!cellStyles[cellKey]) cellStyles[cellKey] = {};
                        if (command === 'bold') {
                            cellStyles[cellKey].bold = !cellStyles[cellKey].bold;
                        } else if (command === 'italic') {
                            cellStyles[cellKey].italic = !cellStyles[cellKey].italic;
                        } else if (command === 'foreColor') {
                            cellStyles[cellKey].textColor = value;
                        } else if (command === 'hiliteColor') {
                            cellStyles[cellKey].bgColor = value;
                        } else if (command === 'hAlign') {
                            cellStyles[cellKey].hAlign = value;
                        } else if (command === 'vAlign') {
                            cellStyles[cellKey].vAlign = value;
                        }
                    });
                    blockStore.updateBlock(block.id, { cellStyles });
                    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
                    return;
                }
            }

            if (command === 'bold') {
                const current = block.fontWeight === 'bold' ? 'normal' : 'bold';
                blockStore.updateBlock(block.id, { fontWeight: current });
            } else if (command === 'italic') {
                const current = block.fontStyle === 'italic' ? 'normal' : 'italic';
                blockStore.updateBlock(block.id, { fontStyle: current });
            } else if (command === 'underline') {
                const current = block.textDecoration === 'underline' ? 'none' : 'underline';
                blockStore.updateBlock(block.id, { textDecoration: current });
            } else if (command === 'strikeThrough') {
                const current = block.textDecoration === 'line-through' ? 'none' : 'line-through';
                blockStore.updateBlock(block.id, { textDecoration: current });
            } else if (command === 'foreColor') {
                blockStore.updateBlock(block.id, { color: value });
                textColorVal.value = value;
            } else if (command === 'hiliteColor') {
                blockStore.updateBlock(block.id, { backgroundColor: value });
                highlightColorVal.value = value;
            } else if (command === 'hAlign') {
                blockStore.updateBlock(block.id, { align: value });
            }
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        }
    }
}
</script>

<template>
    <div class="topbar-wrapper flex flex-col w-full flex-shrink-0 z-[100] relative">
        <header class="topbar flex justify-between items-center">
            <!-- Left Side Controls -->
            <div class="flex items-center gap-2">
                <!-- Logo -->
                <div class="topbar-logo">
                    <FileText :size="18" />
                    <span>InvoiceForge</span>
                </div>

                <!-- Mode Toggle Switcher -->
                <div class="flex bg-[rgba(0,0,0,0.18)] border border-panel-border rounded-md p-[2px] gap-px ml-2 mr-2">
                    <button
                        class="formatting-btn font-medium"
                        style="width: 65px; height: 26px; font-size: 11px;"
                        :class="{ active: !previewStore.isPreviewMode }"
                        @click="previewStore.setPreviewMode(false)"
                    >
                        Design
                    </button>
                    <button
                        class="formatting-btn font-medium"
                        style="width: 65px; height: 26px; font-size: 11px;"
                        :class="{ active: previewStore.isPreviewMode }"
                        @click="previewStore.setPreviewMode(true)"
                    >
                        Preview
                    </button>
                    <button
                        class="formatting-btn font-medium"
                        style="width: 65px; height: 26px; font-size: 11px;"
                        @click="handlePrint"
                    >
                        Print
                    </button>
                </div>

                <div class="topbar-sep" />

                <!-- Document Selector -->
                <select
                    :value="activeDocumentSelectValue"
                    class="topbar-select"
                    style="width: 150px"
                    @change="handleDocumentSelectChange"
                >
                    <optgroup label="Preset Layouts">
                        <option value="Custom">Custom</option>
                        <option value="Invoice">Invoice</option>
                        <option value="Sale Order">Sale Order</option>
                        <option value="Receipt">Receipt</option>
                        <option value="Delivery Note">Delivery Note</option>
                        <option value="Purchase Order">Purchase Order</option>
                        <option value="Credit Note">Credit Note</option>
                        <option value="Quote">Quote</option>
                    </optgroup>
                    <optgroup v-if="templateStore.templates.length > 0" label="Saved Templates">
                        <option
                            v-for="tpl in templateStore.templates"
                            :key="tpl.id"
                            :value="tpl.id"
                        >
                            {{ tpl.name }}
                        </option>
                    </optgroup>
                </select>

                <!-- Currency -->
                <select
                    v-model="settingsStore.currency"
                    class="topbar-select"
                    style="width: 80px"
                >
                    <option
                        v-for="c in settingsStore.currencies"
                        :key="c.code"
                        :value="c.code"
                    >
                        {{ c.code }}
                    </option>
                </select>

                <!-- Font (Global) -->
                <select
                    v-model="settingsStore.globalFont"
                    class="topbar-select"
                    style="width: 130px"
                >
                    <option
                        v-for="f in settingsStore.fonts"
                        :key="f.value"
                        :value="f.value"
                    >
                        {{ f.name }}
                    </option>
                </select>

                <!-- Font Size (Global) -->
                <div class="field-unit" style="width: 70px">
                    <input
                        v-model.number="settingsStore.globalFontSize"
                        type="number"
                        min="8"
                        max="72"
                        class="inp"
                        style="padding: 4px 6px; text-align: center"
                    />
                    <span class="field-unit-label">px</span>
                </div>

                <div class="topbar-sep" />
                <div class="relative" ref="formatSettingsBtnEl">
                    <button
                        class="btn btn-ghost"
                        @click="toggleFormatSettingsMenu"
                    >
                        <Sliders :size="13" />
                        Format
                        <ChevronDown :size="11" />
                    </button>
                    <Teleport to="body">
                        <div
                            v-if="formatSettingsMenuOpen"
                            class="context-menu animate-fade-in"
                            :style="{
                                position: 'fixed',
                                top: formatSettingsMenuPosition.top,
                                right: formatSettingsMenuPosition.right,
                                left: 'auto',
                                minWidth: '200px',
                                zIndex: 10000,
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }"
                            @mouseleave="formatSettingsMenuOpen = false"
                        >
                            <div class="context-menu-label" style="margin-bottom: 2px">Global Format Settings</div>
                            
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
                                <span style="font-size: 11px; color: var(--color-panel-text)">Decimal Places</span>
                                <input
                                    v-model.number="settingsStore.globalFormat.decimals"
                                    type="number"
                                    min="0"
                                    max="6"
                                    class="inp"
                                    style="width: 50px; padding: 2px 4px; text-align: center"
                                />
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
                                <span style="font-size: 11px; color: var(--color-panel-text)">1000 Separator</span>
                                <label class="toggle" style="scale: 0.9">
                                    <input
                                        type="checkbox"
                                        v-model="settingsStore.globalFormat.separator"
                                    />
                                    <span class="toggle-track" />
                                </label>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 4px">
                                <span style="font-size: 11px; color: var(--color-panel-text)">Date Format</span>
                                <select
                                    v-model="settingsStore.globalFormat.dateFormat"
                                    class="inp"
                                    style="width: 100%; padding: 4px"
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                                </select>
                            </div>
                        </div>
                    </Teleport>
                </div>
            </div>

            <!-- Right Side Controls -->
            <div class="flex items-center gap-2">
                <!-- Paper Formats -->
                <div class="flex gap-1">
                    <button
                        v-for="fmt in formats"
                        :key="fmt"
                        class="format-btn"
                        :class="{ active: canvasStore.formatId === fmt }"
                        @click="switchFormat(fmt)"
                    >
                        {{ formatLabels[fmt] }}
                    </button>
                </div>

                <!-- Orientation Toggle -->
                <button
                    class="btn btn-ghost btn-icon"
                    data-tooltip="Toggle Orientation"
                    @click="
                        switchOrientation(
                            canvasStore.orientation === 'portrait'
                                ? 'landscape'
                                : 'portrait',
                        )
                    "
                >
                    <SwitchCamera :size="14" />
                </button>

                <div class="topbar-sep" />

                <!-- Undo / Redo -->
                <button
                    class="btn btn-ghost btn-icon"
                    :class="{ 'opacity-40': !historyStore.canUndo }"
                    data-tooltip="Undo (Ctrl+Z)"
                    :disabled="!historyStore.canUndo"
                    @click="handleUndo"
                >
                    <RotateCcw :size="14" />
                </button>
                <button
                    class="btn btn-ghost btn-icon"
                    :class="{ 'opacity-40': !historyStore.canRedo }"
                    data-tooltip="Redo (Ctrl+Shift+Z)"
                    :disabled="!historyStore.canRedo"
                    @click="handleRedo"
                >
                    <RotateCw :size="14" />
                </button>

                <div class="topbar-sep" />

                <!-- Save to browser -->
                <button class="btn btn-ghost" @click="handleSave">
                    <Save :size="13" />
                    Save
                </button>

                <!-- Templates Manager -->
                <button class="btn btn-ghost" @click="showTemplateManager = true">
                    <FolderOpen :size="13" />
                    Templates
                </button>

                <!-- Reset to Default -->
                <button
                    class="btn btn-ghost text-warning"
                    data-tooltip="Reset to default preset"
                    @click="handleResetToDefault"
                >
                    <RefreshCw :size="13" />
                    Reset
                </button>

                <div class="topbar-sep" />



                <!-- Import dropdown -->
                <div class="relative" ref="importBtnEl">
                    <button
                        class="btn btn-ghost"
                        @click="toggleImportMenu"
                    >
                        <Upload :size="13" />
                        Import
                        <ChevronDown :size="11" />
                    </button>
                    <Teleport to="body">
                        <div
                            v-if="importMenuOpen"
                            class="context-menu animate-fade-in"
                            :style="{
                                position: 'fixed',
                                top: importMenuPosition.top,
                                right: importMenuPosition.right,
                                left: 'auto',
                                minWidth: '210px',
                                zIndex: 10000
                            }"
                            @mouseleave="importMenuOpen = false"
                        >
                            <div class="context-menu-label">Import From</div>
                            <div class="context-menu-item" @click="importFromFile">
                                <FolderOpen
                                    :size="13"
                                    style="display: inline; margin-right: 6px"
                                />
                                Import JSON template
                            </div>
                            <div class="context-menu-item" @click="importCSVFromFile">
                                📊 Import CSV to table
                            </div>
                        </div>
                    </Teleport>
                </div>

                <!-- Export dropdown -->
                <div class="relative" ref="exportBtnEl">
                    <button
                        class="btn btn-ghost"
                        :disabled="isExporting"
                        @click="toggleExportMenu"
                    >
                        <Loader v-if="isExporting" :size="13" class="spin" />
                        <Download v-else :size="13" />
                        {{ isExporting ? "Exporting…" : "Export" }}
                        <ChevronDown :size="11" />
                    </button>
                    <Teleport to="body">
                        <div
                            v-if="exportMenuOpen"
                            class="context-menu animate-fade-in"
                            :style="{
                                position: 'fixed',
                                top: exportMenuPosition.top,
                                right: exportMenuPosition.right,
                                left: 'auto',
                                minWidth: '210px',
                                zIndex: 10000
                            }"
                            @mouseleave="exportMenuOpen = false"
                        >
                            <div class="context-menu-label">Export As</div>
                            <div class="context-menu-item" @click="exportPDF">
                                📄 Export PDF
                            </div>
                            <div class="context-menu-item" @click="exportPNG">
                                🖼 Export PNG
                            </div>
                            <div class="context-menu-item" @click="exportJSON">
                                ⚙️ Export JSON
                            </div>
                        </div>
                    </Teleport>
                </div>
            </div>
        </header>

        <!-- Contextual Formatting Second Row (Shown only when a text block is selected) -->
        <Transition name="slide">
            <div v-if="isTextBlockSelected" class="topbar-contextual-row print-hidden flex items-center gap-2">
                <span class="text-[10px] text-panel-muted uppercase font-bold tracking-wider mr-2 select-none">Text Style</span>

                <!-- Font Select -->
                <select
                    v-model="selectedBlockFontFamily"
                    class="topbar-select"
                    style="width: 140px"
                    :disabled="blockStore.selectedBlock?.locked"
                >
                    <option value="inherit">Use Global Font</option>
                    <option
                        v-for="font in settingsStore.fonts"
                        :key="font.value"
                        :value="font.value"
                    >
                        {{ font.name }}
                    </option>
                </select>

                <!-- Font Size -->
                <div class="field-unit" style="width: 70px">
                    <input
                        v-model.number="selectedBlockFontSize"
                        type="number"
                        min="6"
                        max="144"
                        class="inp"
                        style="padding: 4px 6px; text-align: center"
                        :disabled="blockStore.selectedBlock?.locked"
                    />
                    <span class="field-unit-label">px</span>
                </div>

                <div class="topbar-sep" style="height: 18px" />

                <!-- Bold, Italic, Underline, Strikethrough Buttons -->
                <div class="flex items-center bg-[rgba(0,0,0,0.18)] border border-panel-border rounded-md p-[2px] gap-px">
                    <button
                        class="formatting-btn"
                        :class="{ active: blockStore.selectedBlock?.fontWeight === 'bold' }"
                        title="Bold"
                        @mousedown.prevent="execFormatting('bold')"
                    >
                        <Bold :size="13" />
                    </button>
                    <button
                        class="formatting-btn"
                        :class="{ active: blockStore.selectedBlock?.fontStyle === 'italic' }"
                        title="Italic"
                        @mousedown.prevent="execFormatting('italic')"
                    >
                        <Italic :size="13" />
                    </button>
                    <button
                        class="formatting-btn"
                        :class="{ active: blockStore.selectedBlock?.textDecoration === 'underline' }"
                        title="Underline"
                        @mousedown.prevent="execFormatting('underline')"
                    >
                        <Underline :size="13" />
                    </button>
                    <button
                        class="formatting-btn"
                        :class="{ active: blockStore.selectedBlock?.textDecoration === 'line-through' }"
                        title="Strikethrough"
                        @mousedown.prevent="execFormatting('strikeThrough')"
                    >
                        <Strikethrough :size="13" />
                    </button>
                </div>

                <!-- Text Color -->
                <div class="relative flex items-center ml-1">
                    <button
                        class="formatting-btn"
                        title="Text Color"
                        @mousedown.prevent
                        @click="triggerColorPicker"
                    >
                        <span class="flex flex-col items-center justify-center relative w-full h-full">
                            <span class="text-[11px] font-extrabold leading-none h-[10px]" style="font-family: 'Georgia', serif;">A</span>
                            <span class="w-[14px] h-[3px] rounded-[1px] absolute bottom-[-3px]" :style="{ backgroundColor: textColorVal }" />
                        </span>
                    </button>
                    <input
                        ref="textColorInput"
                        type="color"
                        v-model="textColorVal"
                        class="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                        @input="execFormatting('foreColor', textColorVal)"
                    />
                </div>

                <div class="topbar-sep" style="height: 18px" />

                <!-- Alignment Controls (← ↔ →) -->
                <div class="flex items-center bg-[rgba(0,0,0,0.18)] border border-panel-border rounded-md p-[2px] gap-px">
                    <button
                        class="formatting-btn font-mono"
                        :class="{ active: blockStore.selectedBlock?.align === 'left' || !blockStore.selectedBlock?.align }"
                        title="Align Left"
                        @mousedown.prevent="execFormatting('hAlign', 'left')"
                    >
                        ←
                    </button>
                    <button
                        class="formatting-btn font-mono"
                        :class="{ active: blockStore.selectedBlock?.align === 'center' }"
                        title="Align Center"
                        @mousedown.prevent="execFormatting('hAlign', 'center')"
                    >
                        ↔
                    </button>
                    <button
                        class="formatting-btn font-mono"
                        :class="{ active: blockStore.selectedBlock?.align === 'right' }"
                        title="Align Right"
                        @mousedown.prevent="execFormatting('hAlign', 'right')"
                    >
                        →
                    </button>
                </div>
            </div>
        </Transition>
    </div>

    <!-- ─── Save Modal ─────────────────────────────────────── -->
    <Teleport to="body">
        <div
            v-if="showSaveModal"
            class="fixed inset-0 z-9999 flex items-center justify-center"
            style="background: rgba(0, 0, 0, 0.6)"
            @click.self="showSaveModal = false"
        >
            <div
                class="panel animate-fade-in"
                style="
                    border-radius: 12px;
                    padding: 24px;
                    width: 400px;
                    border: 1px solid var(--color-panel-border);
                "
            >
                <h3
                    style="
                        font-size: 15px;
                        font-weight: 600;
                        margin-bottom: 4px;
                    "
                >
                    Save Template
                </h3>
                <p
                    style="
                        font-size: 11px;
                        color: var(--color-panel-muted);
                        margin-bottom: 16px;
                    "
                >
                    "Save to Browser" stores the template in this browser
                    session. "Download .json" saves a file to your device.
                </p>
                <label class="field-label">Template Name</label>
                <input
                    v-model="saveName"
                    class="inp"
                    style="margin-bottom: 12px"
                    placeholder="My Invoice Template"
                />

                <label class="field-label">Folder</label>
                <select
                    v-model="saveFolderId"
                    class="inp"
                    style="margin-bottom: 12px"
                >
                    <option v-for="f in templateStore.folders" :key="f.id" :value="f.id">
                        {{ f.name }}
                    </option>
                    <option value="__new__">+ Create New Folder...</option>
                </select>

                <div v-if="saveFolderId === '__new__'" style="margin-bottom: 16px">
                    <label class="field-label">New Folder Name</label>
                    <input
                        v-model="newFolderName"
                        class="inp"
                        placeholder="My Folder Name"
                    />
                </div>
                <div class="flex gap-2 justify-end">
                    <button
                        class="btn btn-ghost"
                        @click="showSaveModal = false"
                    >
                        Cancel
                    </button>
                    <button
                        class="btn btn-ghost"
                        style="gap: 5px"
                        @click="downloadJson"
                    >
                        <Download :size="13" />
                        Download .json
                    </button>
                    <button
                        class="btn btn-accent"
                        style="gap: 5px"
                        @click="confirmSave"
                    >
                        <Save :size="13" />
                        Save to Browser
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- ─── Toast notification ────────────────────────────── -->
    <Teleport to="body">
        <div
            v-if="toast.visible"
            class="export-toast"
            :class="`export-toast--${toast.type}`"
        >
            {{ toast.message }}
        </div>
    </Teleport>

    <!-- ─── Confirmation Modal ────────────────────────────── -->
    <ConfirmModal
        :show="showConfirmModal"
        :title="confirmTitle"
        :message="confirmMessage"
        :type="confirmType"
        @confirm="handleConfirmModal"
        @cancel="handleCancelModal"
    />

    <!-- ─── Template Manager Modal ─────────────────────────── -->
    <TemplateManagerModal
        :show="showTemplateManager"
        @close="showTemplateManager = false"
    />
</template>

<style scoped>
.spin {
    animation: spin 0.9s linear infinite;
}
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.export-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    padding: 10px 22px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    animation: toast-in 0.2s ease;
}
.export-toast--success {
    background: rgba(34, 197, 94, 0.92);
    color: #fff;
}
.export-toast--error {
    background: rgba(239, 68, 68, 0.92);
    color: #fff;
}
@keyframes toast-in {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

.formatting-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    border-radius: 4px;
    color: var(--color-panel-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.formatting-btn:hover {
    background: var(--color-panel-hover);
    color: #fa0000;
}

.formatting-btn.active {
    background: var(--color-accent-dim);
    color: var(--color-accent);
}

.topbar {
    border-bottom: none !important;
}

.topbar-wrapper {
    border-bottom: 1px solid var(--color-panel-border);
}

.topbar-contextual-row {
    height: 38px;
    background: var(--color-panel);
    border-top: 1px solid var(--color-panel-border);
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* Slide Transition for Contextual Row */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 38px;
    opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-8px);
}
</style>
