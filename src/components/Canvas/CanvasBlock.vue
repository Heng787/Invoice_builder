<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useBlockStore } from "../../stores/blocks.js";
import { useCanvasStore } from "../../stores/canvas.js";
import { useHistoryStore } from "../../stores/history.js";
import { usePreviewStore } from "../../stores/preview.js";
import {
    computeAlignmentGuides,
    clearGuides,
} from "../../composables/useAlignmentGuides.js";

// Block renderers
import TextBlockRenderer from "../blocks/TextBlockRenderer.vue";
import ImageBlockRenderer from "../blocks/ImageBlockRenderer.vue";
import DividerBlockRenderer from "../blocks/DividerBlockRenderer.vue";
import SpacerBlockRenderer from "../blocks/SpacerBlockRenderer.vue";
import ShapeBlockRenderer from "../blocks/ShapeBlockRenderer.vue";
import FieldRowBlockRenderer from "../blocks/FieldRowBlockRenderer.vue";
import DocumentTitleBlockRenderer from "../blocks/DocumentTitleBlockRenderer.vue";
import ItemTableBlockRenderer from "../blocks/ItemTableBlockRenderer.vue";
import TotalsBlockRenderer from "../blocks/TotalsBlockRenderer.vue";
import SignatureBlockRenderer from "../blocks/SignatureBlockRenderer.vue";
import HeaderGridBlockRenderer from "../blocks/HeaderGridBlockRenderer.vue";
import ContainerBlockRenderer from "../blocks/ContainerBlockRenderer.vue";
import CompanyInfoBlockRenderer from "../blocks/CompanyInfoBlockRenderer.vue";
import ClientInfoBlockRenderer from "../blocks/ClientInfoBlockRenderer.vue";
import NotesBlockRenderer from "../blocks/NotesBlockRenderer.vue";
import BankDetailsBlockRenderer from "../blocks/BankDetailsBlockRenderer.vue";
import WatermarkBlockRenderer from "../blocks/WatermarkBlockRenderer.vue";
import GenericBlockRenderer from "../blocks/GenericBlockRenderer.vue";
import DocumentHeaderBlockRenderer from "../blocks/DocumentHeaderBlockRenderer.vue";
import CheckboxesRowBlockRenderer from "../blocks/CheckboxesRowBlockRenderer.vue";
import StampBoxBlockRenderer from "../blocks/StampBoxBlockRenderer.vue";
import CutLineBlockRenderer from "../blocks/CutLineBlockRenderer.vue";
import CarbonCopyLabelBlockRenderer from "../blocks/CarbonCopyLabelBlockRenderer.vue";
import ReceiptHeaderBlockRenderer from "../blocks/ReceiptHeaderBlockRenderer.vue";
import ReceiptFooterBlockRenderer from "../blocks/ReceiptFooterBlockRenderer.vue";
import BarcodeBlockRenderer from "../blocks/BarcodeBlockRenderer.vue";

const RENDERERS = {
    text: TextBlockRenderer,
    dynamic_text: TextBlockRenderer,
    image: ImageBlockRenderer,
    divider: DividerBlockRenderer,
    spacer: SpacerBlockRenderer,
    shape: ShapeBlockRenderer,
    container: ContainerBlockRenderer,
    field_row: FieldRowBlockRenderer,
    header_grid: HeaderGridBlockRenderer,
    document_title: DocumentTitleBlockRenderer,
    document_number: DocumentTitleBlockRenderer,
    issue_date: FieldRowBlockRenderer,
    due_date: FieldRowBlockRenderer,
    reference_number: FieldRowBlockRenderer,
    item_table: ItemTableBlockRenderer,
    box: TextBlockRenderer,
    totals_block: TotalsBlockRenderer,
    subtotal: TotalsBlockRenderer,
    discount: TotalsBlockRenderer,
    tax: TotalsBlockRenderer,
    grand_total: TotalsBlockRenderer,
    signature_line: SignatureBlockRenderer,
    company_info: CompanyInfoBlockRenderer,
    client_info: ClientInfoBlockRenderer,
    notes: NotesBlockRenderer,
    terms: NotesBlockRenderer,
    footer_note: NotesBlockRenderer,
    thank_you: NotesBlockRenderer,
    bank_details: BankDetailsBlockRenderer,
    watermark: WatermarkBlockRenderer,
    // New renderers
    document_header: DocumentHeaderBlockRenderer,
    checkboxes_row: CheckboxesRowBlockRenderer,
    stamp_box: StampBoxBlockRenderer,
    cut_line: CutLineBlockRenderer,
    carbon_copy_label: CarbonCopyLabelBlockRenderer,
    receipt_header: ReceiptHeaderBlockRenderer,
    receipt_footer: ReceiptFooterBlockRenderer,
    barcode: BarcodeBlockRenderer,
    // Existing types mapped to appropriate renderers
    page_number: TextBlockRenderer,
    balance_due: TotalsBlockRenderer,
    deposit_paid: TotalsBlockRenderer,
};

const props = defineProps({
    block: { type: Object, required: true },
    smartY: { type: Number, default: undefined },
});

const blockStore = useBlockStore();
const canvasStore = useCanvasStore();
const historyStore = useHistoryStore();
const previewStore = usePreviewStore();

const isSelected = computed(() => {
    if (previewStore.isPreviewMode) return false;
    return blockStore.selectedIds.includes(props.block.id);
});

const isMultiSelected = computed(
    () => blockStore.selectedIds.length > 1 && isSelected.value,
);

const renderer = computed(
    () => RENDERERS[props.block.type] ?? GenericBlockRenderer,
);

const isEditing = computed(() => canvasStore.editingBlockId === props.block.id);

const hasPointerEvents = computed(() => {
    if (previewStore.isPreviewMode) return true;
    if (isEditing.value) return true;
    if (props.block.type === 'item_table' && isSelected.value) return true;
    return false;
});

// Drag-move state
const moving = ref(false);
const moveStart = ref({ mouseX: 0, mouseY: 0, blockX: 0, blockY: 0 });

// Resize state
const resizing = ref(false);
const resizeHandle = ref("");
const resizeStart = ref({ mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 });

// Rotate state
const rotating = ref(false);
const rotatePivot = ref({ cx: 0, cy: 0 });
const rotateStart = ref({ angle: 0, blockRotation: 0 });

/**
 * Computes block positioning and styling with zoom and smart layout
 */
const blockStyle = computed(() => {
    const b = props.block;
    const z = canvasStore.zoom;
    const isTable = b.type === 'item_table' || b.type === 'table' || b.type === 'table_builder';
    return {
        position: "absolute",
        left: `${b.x * z}px`,
        top: `${(props.smartY !== undefined ? props.smartY : b.y) * z}px`,
        width: `${b.width * z}px`,
        height: isTable ? 'auto' : `${b.height * z}px`,
        minHeight: isTable ? `${b.height * z}px` : undefined,
        transform: `rotate(${b.rotation ?? 0}deg)`,
        opacity: b.opacity ?? 1,
        zIndex: b.zIndex ?? 0,
        userSelect: previewStore.isPreviewMode ? "text" : "none",
        pointerEvents: b.hidden ? "none" : "auto",
        visibility: b.hidden ? "hidden" : "visible",
        cursor: previewStore.isPreviewMode
            ? "default"
            : (isEditing.value
                ? "default"
                : b.locked
                  ? "default"
                  : moving.value
                    ? "grabbing"
                    : "grab"),
        transition:
            moving.value || resizing.value || rotating.value
                ? "none"
                : undefined,
    };
});

const blockRoot = ref(null);
let resizeObserver = null;

/**
 * Lifecycle: Mount - sets up resize observer for dynamic height blocks
 */
onMounted(() => {
    const hasDynamicHeight = [
        'item_table', 'table', 'table_builder', 
        'text', 'dynamic_text', 'notes', 'terms', 
        'company_info', 'client_info', 'footer_note'
    ].includes(props.block.type);

    if (hasDynamicHeight) {
        resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.target.offsetHeight;
                if (height > 0) {
                    blockStore.setBlockActualHeight(props.block.id, height / canvasStore.zoom);
                }
            }
        });
        if (blockRoot.value) {
            resizeObserver.observe(blockRoot.value);
        }
    }
});

/**
 * Lifecycle: Unmount - cleans up resize observer
 */
onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});

// ─── Move & Edit ──────────────────────────────────────────────

/**
 * Handles double-click to edit block
 */
function onDblClick(e) {
    if (previewStore.isPreviewMode || props.block.locked) return;
    e.stopPropagation();
    canvasStore.editingBlockId = props.block.id;
}

/**
 * Handles mousedown for selection, moving, and multi-select
 */
function onMouseDown(e) {
    if (previewStore.isPreviewMode) return;
    if (props.block.locked) return;
    if (e.button !== 0) return;
    e.stopPropagation();

    // Select logic
    if (e.shiftKey) {
        if (isSelected.value) {
            blockStore.selectBlocks(
                blockStore.selectedIds.filter((id) => id !== props.block.id),
            );
        } else {
            blockStore.addToSelection(props.block.id);
        }
        return;
    }

    if (isSelected.value && !isEditing.value && props.block.type !== 'item_table') {
        canvasStore.editingBlockId = props.block.id;
    }

    if (!isSelected.value) {
        blockStore.selectBlock(props.block.id);
    }

    moving.value = true;
    moveStart.value = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        blockX: props.block.x,
        blockY: props.block.y,
    };

    const onMove = (me) => {
        if (!moving.value) return;
        const z = canvasStore.zoom;
        const dx = (me.clientX - moveStart.value.mouseX) / z;
        const dy = (me.clientY - moveStart.value.mouseY) / z;
        const newX = Math.round(moveStart.value.blockX + dx);
        const newY = Math.round(moveStart.value.blockY + dy);
        blockStore.updateBlock(props.block.id, { x: newX, y: newY });
        // Also move other selected blocks
        if (isMultiSelected.value) {
            blockStore.selectedIds.forEach((id) => {
                if (id === props.block.id) return;
                const b = blockStore.blocks.find((bl) => bl.id === id);
                if (!b || b.locked) return;
                blockStore.updateBlock(id, {
                    x: Math.round(
                        b.x + dx - (props.block.x - moveStart.value.blockX),
                    ),
                    y: Math.round(
                        b.y + dy - (props.block.y - moveStart.value.blockY),
                    ),
                });
            });
        }
        // Alignment guides
        const updated = blockStore.blocks.find(
            (bl) => bl.id === props.block.id,
        );
        if (updated)
            computeAlignmentGuides(
                updated,
                blockStore.blocks,
                canvasStore.zoom,
            );
    };

    const onUp = () => {
        moving.value = false;
        clearGuides();
        historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
}

// ─── Table Toolbar Actions ──────────────────────────────────

/**
 * Adds a new row to the table
 */
function addTableRow() {
    const newItems = JSON.parse(JSON.stringify(props.block.items ?? []));
    newItems.push({
        no: "",
        description: "",
        qty: "",
        unit_price: "",
        discount: "",
        tax: "",
        total: "",
    });
    blockStore.updateBlock(props.block.id, { items: newItems });
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}

/**
 * Adds a new column to the table
 */
function addTableColumn() {
    const columns = JSON.parse(JSON.stringify(props.block.columns || []));
    const newId = `col_${Date.now()}`;
    columns.push({
        id: newId,
        label: "New Column",
        width: 10,
        visible: true,
    });
    blockStore.updateBlock(props.block.id, { columns });
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}

/**
 * Merges selected cells in the table
 */
function mergeTableCells() {
    const selected = props.block.selectedCells ?? [];
    if (selected.length < 2) return;
    const allCols = props.block.columns ?? [];
    
    let minR = Infinity, maxR = -Infinity;
    let minCIdx = Infinity, maxCIdx = -Infinity;
    
    selected.forEach(cellKey => {
        const [rStr, colId] = cellKey.split(':');
        const r = parseInt(rStr);
        const cIdx = allCols.findIndex(c => c.id === colId);
        if (cIdx !== -1) {
            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
            if (cIdx < minCIdx) minCIdx = cIdx;
            if (cIdx > maxCIdx) maxCIdx = cIdx;
        }
    });
    
    if (minR === Infinity || minCIdx === Infinity) return;
    
    const newMerge = {
        startRow: minR,
        endRow: maxR,
        startCol: allCols[minCIdx].id,
        endCol: allCols[maxCIdx].id,
    };
    
    const mergedCells = JSON.parse(JSON.stringify(props.block.mergedCells ?? []));
    mergedCells.push(newMerge);
    blockStore.updateBlock(props.block.id, { mergedCells });
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}

/**
 * Deletes selected rows from the table
 */
function deleteSelectedRows() {
    const selected = props.block.selectedCells ?? [];
    if (selected.length === 0) return;
    const rowIdxs = [...new Set(selected.map(cell => parseInt(cell.split(':')[0])))];
    rowIdxs.sort((a, b) => b - a);
    const newItems = JSON.parse(JSON.stringify(props.block.items ?? []));
    let emptyRowsToDelete = 0;
    rowIdxs.forEach(r => {
        if (r < newItems.length) {
            newItems.splice(r, 1);
        } else {
            emptyRowsToDelete++;
        }
    });
    const updates = { items: newItems, selectedCells: [] };
    if (emptyRowsToDelete > 0) {
        const currentEmpty = props.block.emptyRows ?? 0;
        updates.emptyRows = Math.max(0, currentEmpty - emptyRowsToDelete);
    }
    blockStore.updateBlock(props.block.id, updates);
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}

/**
 * Deletes selected columns from the table
 */
function deleteSelectedColumns() {
    const selected = props.block.selectedCells ?? [];
    if (selected.length === 0) return;
    const colIds = [...new Set(selected.map(cell => cell.split(':')[1]))];
    const filteredColIds = colIds.filter(id => id !== 'no' && id !== 'total');
    if (filteredColIds.length === 0) return;
    const columns = JSON.parse(JSON.stringify(props.block.columns || []));
    const newCols = columns.filter(c => !filteredColIds.includes(c.id));
    blockStore.updateBlock(props.block.id, { columns: newCols, selectedCells: [] });
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}

/**
 * Clears content of selected cells
 */
function clearSelectedCellsContent() {
    const selected = props.block.selectedCells ?? [];
    if (selected.length === 0) return;
    const newItems = JSON.parse(JSON.stringify(props.block.items ?? []));
    let modified = false;
    selected.forEach(cellKey => {
        const [rStr, colId] = cellKey.split(':');
        const r = parseInt(rStr);
        if (r < newItems.length) {
            newItems[r][colId] = "";
            modified = true;
        }
    });
    if (modified) {
        blockStore.updateBlock(props.block.id, { items: newItems, selectedCells: [] });
        historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
    }
}

/**
 * Applies style to selected cells
 */
function applyTableStyle(prop, val) {
    const selected = props.block.selectedCells ?? [];
    if (selected.length === 0) return;
    const cellStyles = JSON.parse(JSON.stringify(props.block.cellStyles ?? {}));
    
    selected.forEach(cellKey => {
        if (!cellStyles[cellKey]) cellStyles[cellKey] = {};
        if (prop === 'bold') {
            cellStyles[cellKey].bold = !cellStyles[cellKey].bold;
        } else if (prop === 'italic') {
            cellStyles[cellKey].italic = !cellStyles[cellKey].italic;
        } else if (prop === 'hAlign') {
            cellStyles[cellKey].hAlign = val;
        } else if (prop === 'vAlign') {
            cellStyles[cellKey].vAlign = val;
        } else if (prop === 'bgColor') {
            cellStyles[cellKey].bgColor = val;
        } else if (prop === 'textColor') {
            cellStyles[cellKey].textColor = val;
        } else if (prop === 'border') {
            const cellBorders = JSON.parse(JSON.stringify(props.block.cellBorders ?? {}));
            cellBorders[cellKey] = {
                top: val, bottom: val, left: val, right: val
            };
            blockStore.updateBlock(props.block.id, { cellBorders });
        }
    });
    blockStore.updateBlock(props.block.id, { cellStyles });
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
}

/**
 * Toggles visibility of empty rows in table
 */
function toggleEmptyRows() {
    if (props.block.type === 'item_table') {
        const current = props.block.showEmptyRows !== false;
        blockStore.updateBlock(props.block.id, { 
            showEmptyRows: !current,
            showEmptyRowsInPreview: !current
        });
    }
}

// ─── Resize ───────────────────────────────────────────────────

/**
 * Handles resize start for block resizing
 */
function onResizeStart(e, handle) {
    if (isEditing.value && props.block.type !== 'item_table') return;
    e.stopPropagation();
    e.preventDefault();
    resizing.value = true;
    resizeHandle.value = handle;
    resizeStart.value = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        x: props.block.x,
        y: props.block.y,
        w: props.block.width,
        h: props.block.height,
    };

    const onMove = (me) => {
        if (!resizing.value) return;
        const z = canvasStore.zoom;
        const dx = (me.clientX - resizeStart.value.mouseX) / z;
        const dy = (me.clientY - resizeStart.value.mouseY) / z;
        let { x, y, w, h } = resizeStart.value;
        const MIN = 20;

        if (handle.includes("e")) w = Math.max(MIN, Math.round(w + dx));
        if (handle.includes("s")) h = Math.max(MIN, Math.round(h + dy));
        if (handle.includes("w")) {
            const newW = Math.max(MIN, Math.round(w - dx));
            x = Math.round(x + w - newW);
            w = newW;
        }
        if (handle.includes("n")) {
            const newH = Math.max(MIN, Math.round(h - dy));
            y = Math.round(y + h - newH);
            h = newH;
        }

        blockStore.updateBlock(props.block.id, { x, y, width: w, height: h });
    };

    const onUp = () => {
        resizing.value = false;
        historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
}

// ─── Rotate ───────────────────────────────────────────────────

/**
 * Handles rotation start for block rotation
 */
function onRotateStart(e) {
    if (isEditing.value) return;
    e.stopPropagation();
    e.preventDefault();
    rotating.value = true;

    const z = canvasStore.zoom;
    const cx = props.block.x * z + (props.block.width * z) / 2;
    const cy = props.block.y * z + (props.block.height * z) / 2;

    const paper = document.getElementById("canvas-paper");
    const rect = paper.getBoundingClientRect();
    rotatePivot.value = { cx: rect.left + cx, cy: rect.top + cy };

    const startAngle = Math.atan2(
        e.clientY - rotatePivot.value.cy,
        e.clientX - rotatePivot.value.cx,
    );
    const startRotation = props.block.rotation ?? 0;

    const onMove = (me) => {
        if (!rotating.value) return;
        const angle = Math.atan2(
            me.clientY - rotatePivot.value.cy,
            me.clientX - rotatePivot.value.cx,
        );
        const delta = (angle - startAngle) * (180 / Math.PI);
        let newRotation = Math.round(startRotation + delta);
        if (me.shiftKey) newRotation = Math.round(newRotation / 15) * 15;
        blockStore.updateBlock(props.block.id, { rotation: newRotation });
    };

    const onUp = () => {
        rotating.value = false;
        historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
}

// Resize handle positions
const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

/**
 * Returns style for a specific resize handle position
 */
const handleStyle = (handle) => {
    const pos = {
        nw: { top: "-4px", left: "-4px", cursor: "nw-resize" },
        n: {
            top: "-4px",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "n-resize",
        },
        ne: { top: "-4px", right: "-4px", cursor: "ne-resize" },
        e: {
            top: "50%",
            right: "-4px",
            transform: "translateY(-50%)",
            cursor: "e-resize",
        },
        se: { bottom: "-4px", right: "-4px", cursor: "se-resize" },
        s: {
            bottom: "-4px",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "s-resize",
        },
        sw: { bottom: "-4px", left: "-4px", cursor: "sw-resize" },
        w: {
            top: "50%",
            left: "-4px",
            transform: "translateY(-50%)",
            cursor: "w-resize",
        },
    };
    return { ...pos[handle] };
};
</script>

<template>
    <div
        ref="blockRoot"
        :style="blockStyle"
        :class="[
            'canvas-block',
            {
                selected: isSelected,
                'multi-selected': isMultiSelected,
                'editing': isEditing,
                'is-page-break': block.type === 'page_break',
                locked: block.locked,
                'out-of-bounds': block._outOfBounds,
                'print-hidden': block.hideOnPrint,
            },
        ]"
        @mousedown="onMouseDown"
        @dblclick="onDblClick"
    >
        <!-- Floating Table Toolbar (appears above table when selected) -->
        <div v-if="isSelected && block.type === 'item_table'" class="table-floating-toolbar print-hidden"
             style="position: absolute; top: -38px; left: 0; display: flex; align-items: center; gap: 4px; background: #1a1a2e; border: 1px solid var(--color-panel-border); padding: 4px 6px; border-radius: 6px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.5); pointer-events: auto;">
             <button class="tb-btn" title="Add Row Below" @click.stop="addTableRow">+ Row</button>
             <button class="tb-btn text-[#ef4444]" title="Delete Selected Row(s)" @click.stop="deleteSelectedRows">- Row</button>
             <button class="tb-btn" title="Add Column Right" @click.stop="addTableColumn">+ Col</button>
             <button class="tb-btn text-[#ef4444]" title="Delete Selected Column(s)" @click.stop="deleteSelectedColumns">- Col</button>
             <button class="tb-btn text-[#f59e0b]" title="Clear Selected Cells Content" @click.stop="clearSelectedCellsContent">Clear</button>
             <div class="tb-sep" />
             <button class="tb-btn" title="Merge Selected Cells" @click.stop="mergeTableCells">Merge</button>
             <button class="tb-btn" title="Toggle Empty Rows" @click.stop="toggleEmptyRows">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12H3"></path><path d="M21 6H3"></path><path d="M21 18H3"></path></svg>
             </button>
             <div class="tb-sep" />
             <button class="tb-btn" title="Bold Cells" @click.stop="applyTableStyle('bold')">B</button>
             <button class="tb-btn" title="Italic Cells" @click.stop="applyTableStyle('italic')">I</button>
             <div class="tb-sep" />
             <button class="tb-btn" title="Align Left" @click.stop="applyTableStyle('hAlign', 'left')">←</button>
             <button class="tb-btn" title="Align Center" @click.stop="applyTableStyle('hAlign', 'center')">↔</button>
             <button class="tb-btn" title="Align Right" @click.stop="applyTableStyle('hAlign', 'right')">→</button>
             <div class="tb-sep" />
             <button class="tb-btn" title="Align Top" @click.stop="applyTableStyle('vAlign', 'top')">↑</button>
             <button class="tb-btn" title="Align Middle" @click.stop="applyTableStyle('vAlign', 'middle')">↕</button>
             <button class="tb-btn" title="Align Bottom" @click.stop="applyTableStyle('vAlign', 'bottom')">↓</button>
             <div class="tb-sep" />
             
             <!-- BG Color picker -->
             <div class="relative" style="display: inline-flex; align-items: center;">
                 <button class="tb-btn text-[10px]" title="Cell BG Color" @click.stop="$refs.bgPicker.click()">🎨 BG</button>
                 <input ref="bgPicker" type="color" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;" 
                        @input="applyTableStyle('bgColor', $event.target.value)" />
             </div>
             
             <!-- Text Color picker -->
             <div class="relative" style="display: inline-flex; align-items: center;">
                 <button class="tb-btn text-[10px]" title="Cell Text Color" @click.stop="$refs.textPicker.click()">🔤 Text</button>
                 <input ref="textPicker" type="color" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;" 
                        @input="applyTableStyle('textColor', $event.target.value)" />
             </div>
             
             <div class="tb-sep" />
             <select class="tb-select" style="background: #1a1a2e; color: white; border: 1px solid var(--color-panel-border); font-size: 11px; outline: none; cursor: pointer; padding: 2px 4px; border-radius: 4px;"
                     @change="applyTableStyle('border', $event.target.value); $event.target.value = ''">
                 <option value="" disabled selected>Border ▾</option>
                 <option value="none">None</option>
                 <option value="thin">Thin</option>
                 <option value="thick">Thick</option>
                 <option value="double">Double</option>
             </select>
        </div>

        <!-- Block content renderer -->
        <component
            :is="renderer"
            :block="block"
            :fill-mode="isEditing"
            :style="{
                width: '100%',
                height: '100%',
                pointerEvents: hasPointerEvents ? 'auto' : 'none',
            }"
        />

        <!-- Selection handles -->
        <template v-if="isSelected && !block.locked">
            <!-- Rotation handle -->
            <div class="rotate-handle" @mousedown.stop="onRotateStart" />

            <!-- 8 resize handles -->
            <div
                v-for="handle in handles"
                :key="handle"
                class="resize-handle"
                :style="handleStyle(handle)"
                @mousedown.stop="onResizeStart($event, handle)"
            />
        </template>

        <!-- Lock indicator -->
        <div
            v-if="block.locked && isSelected"
            style="
                position: absolute;
                top: 2px;
                right: 2px;
                width: 16px;
                height: 16px;
                background: var(--color-warning);
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 9px;
            "
        >
            🔒
        </div>
    </div>
</template>

<style scoped>
.tb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 6px;
    height: 22px;
    border-radius: 4px;
    background: transparent;
    border: none;
    color: #e2e8f0;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}
.tb-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #ffffff;
}
.tb-sep {
    width: 1px;
    height: 14px;
    background: var(--color-panel-border);
    margin: 0 2px;
}

@media print {
    .is-page-break {
        page-break-after: always;
        break-after: page;
        height: 0 !important;
        border: none !important;
        background: transparent !important;
    }
}
</style>