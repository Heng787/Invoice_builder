<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useCanvasStore } from "../../stores/canvas.js";
import { useSettingsStore } from "../../stores/settings.js";
import { useTemplateStore } from "../../stores/template.js";
import { useHistoryStore } from "../../stores/history.js";
import { useBlockStore } from "../../stores/blocks.js";
import { useFormatMigration } from "../../composables/useFormatMigration.js";
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
    Languages,
    Bold,
    Italic,
    Underline,
    Strikethrough,
} from "@lucide/vue";

import ConfirmModal from "../common/ConfirmModal.vue";

const canvasStore = useCanvasStore();
const settingsStore = useSettingsStore();
const templateStore = useTemplateStore();
const historyStore = useHistoryStore();
const blockStore = useBlockStore();
const { switchFormat, switchOrientation } = useFormatMigration();

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

const exportMenuOpen = ref(false);
const showSaveModal = ref(false);
const saveName = ref(templateStore.currentTemplateName);

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

// ─── Save to browser (localStorage) ──────────────────────────
function handleSave() {
    saveName.value = templateStore.currentTemplateName;
    showSaveModal.value = true;
}

function confirmSave() {
    const schema = buildSchema(saveName.value);
    templateStore.saveTemplate(saveName.value, schema);
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
function exportJSON() {
    const schema = buildSchema(templateStore.currentTemplateName);
    templateStore.exportAsJson(schema);
    exportMenuOpen.value = false;
}

// ─── Import from JSON file ────────────────────────────────────
function importFromFile() {
    exportMenuOpen.value = false;
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
            }
            historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
            showToast(`✓ "${schema.name || file.name}" loaded`, "success");
        } catch (err) {
            showToast(`✗ Failed to load: ${err.message}`, "error");
        }
    };

    input.click();
}

// ─── Print ───────────────────────────────────────────────────
async function handlePrint() {
    const backupZoom = canvasStore.zoom;
    const backupFillMode = canvasStore.fillMode;
    
    // Set zoom to 1 and disable fill mode for clean rendering
    canvasStore.setZoom(1);
    canvasStore.setFillMode(false);
    
    // Wait for Vue's next tick and a short timeout to let the browser compute the layout reflow
    await nextTick();
    await new Promise((r) => setTimeout(r, 150));
    
    window.print();
    
    // Restore state after print dialog closes
    setTimeout(() => {
        canvasStore.setZoom(backupZoom);
        canvasStore.setFillMode(backupFillMode);
    }, 500);
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

// ─── Translate to Khmer ─────────────────────────────────────
const translationMap = {
    'invoice': 'វិក្កយបត្រ',
    'sale order': 'លិខិតបញ្ជាទិញ',
    'receipt': 'បង្កាន់ដៃទទួលប្រាក់',
    'quote': 'សម្រង់តម្លៃ',
    'quotation': 'សម្រង់តម្លៃ',
    'delivery note': 'ប័ណ្ណប្រគល់ទំនិញ',
    'purchase order': 'លិខិតបញ្ជាទិញ',
    'credit note': 'លិខិតឥណទាន',
    
    'invoice no': 'លេខវិក្កយបត្រ',
    'invoice no.': 'លេខវិក្កយបត្រ',
    'invoice number': 'លេខវិក្កយបត្រ',
    'inv no': 'លេខវិក្កយបត្រ',
    'order no': 'លេខលិខិតបញ្ជាទិញ',
    'order number': 'លេខលិខិតបញ្ជាទិញ',
    'receipt no': 'លេខបង្កាន់ដៃ',
    'receipt number': 'លេខបង្កាន់ដៃ',
    'quote no': 'លេខសម្រង់តម្លៃ',
    'quotation no': 'លេខសម្រង់តម្លៃ',
    'dn no': 'លេខប័ណ្ណប្រគល់ទំនិញ',
    'po no': 'លេខបញ្ជាទិញ',
    'purchase order no': 'លេខបញ្ជាទិញ',
    'ref no': 'លេខយោង',
    'po ref': 'លេខយោងការបញ្ជាទិញ',
    
    'issue date': 'កាលបរិច្ឆេទចេញផ្សាយ',
    'date': 'កាលបរិច្ឆេទ',
    'due date': 'កាលបរិច្ឆេទកំណត់ទូទាត់',
    'order date': 'កាលបរិច្ឆេទបញ្ជាទិញ',
    'valid until': 'សុពលភាពដល់',
    'actual delivery date': 'កាលបរិច្ឆេទប្រគល់ទំនិញជាក់ស្តែង',
    
    'bill to': 'ជូនចំពោះ',
    'invoice to': 'ជូនចំពោះ',
    'client info': 'ព័ត៌មានអតិថិជន',
    'quote for': 'សម្រង់តម្លៃជូន',
    'seller': 'អ្នកលក់',
    'buyer': 'អ្នកទិញ',
    'ship from': 'ដឹកជញ្ជូនពី',
    'ship to': 'ដឹកជញ្ជូនទៅ',
    'from': 'ពី',
    'to': 'ជូនចំពោះ',
    'invoice details': 'ព័ត៌មានលម្អិតវិក្កយបត្រ',
    
    '#': 'ល.រ',
    'no': 'ល.រ',
    'no.': 'ល.រ',
    'description': 'ពិពណ៌នាទំនិញ',
    'item description': 'ពិពណ៌នាទំនិញ',
    'qty': 'បរិមាណ',
    'quantity': 'បរិមាណ',
    'unit price': 'តម្លៃរាយ',
    'price': 'តម្លៃ',
    'unit': 'ឯកតា',
    'discount': 'បញ្ចុះតម្លៃ',
    'tax': 'អាករ',
    'tax rate': 'អត្រាអាករ',
    'total': 'សរុប',
    'total due': 'ប្រាក់ត្រូវទូទាត់',
    'amount': 'ទឹកប្រាក់',
    'amount in words': 'ទឹកប្រាក់ជាអក្សរ',
    
    'subtotal': 'សរុបរង',
    'grand total': 'សរុបរួម',
    'balance': 'ប្រាក់នៅសល់',
    'balance due': 'ប្រាក់ត្រូវទូទាត់',
    'deposit': 'ប្រាក់កក់',
    'deposit/paid': 'ប្រាក់បានបង់',
    'paid': 'បានបង់',
    
    'bank details': 'ព័ត៌មានគណនីធនាគារ',
    'scan to pay': 'ស្កែនដើម្បីទូទាត់',
    'payment receipt qr': 'QR កូដទទួលប្រាក់',
    'authorized signature': 'ហត្ថលេខាអនុញ្ញាត',
    'seller representative': 'តំណាងអ្នកលក់',
    'buyer signature': 'ហត្ថលេខាអ្នកទិញ',
    'customer signature': 'ហត្ថលេខាអតិថិជន',
    'received by': 'អ្នកទទួល',
    'authorized by': 'អនុម័តដោយ',
    
    'cash': 'សាច់ប្រាក់',
    'transfer': 'ផ្ទេរប្រាក់',
    'credit': 'ឥណទាន',
    
    'thank you for your business!': 'សូមអរគុណចំពោះការគាំទ្ររបស់លោកអ្នក!',
    'thank you for your payment!': 'សូមអរគុណសម្រាប់ការបង់ប្រាក់របស់លោកអ្នក!',
    'thank you!': 'សូមអរគុណ!',
    'delivery is expected within 7-10 working days.': 'ការដឹកជញ្ជូនរំពឹងទុកក្នុងរយៈពេល ៧ ទៅ ១០ ថ្ងៃធ្វើការ។',
    'terms & conditions': 'លក្ខខណ្ឌផ្សេងៗ',
    'original': 'ច្បាប់ដើម',
    'copy 1': 'ច្បាប់ចម្លងទី ១',
    'copy 2': 'ច្បាប់ចម្លងទី ២',
    'stamp': 'ត្រា',
    'cut here': 'កាត់ត្រង់នេះ',
    'instructions': 'ការណែនាំ',
    'remarks': 'សម្គាល់',
    'condition': 'ស្ថានភាពទំនិញ',
    'order notes': 'កំណត់សម្គាល់ការបញ្ជាទិញ',
    'authorized by (signature)': 'អនុម័តដោយ (ហត្ថលេខា)',
    'dear customer': 'ជូនចំពោះអតិថិជន',
    
    'this is a computer generated receipt and requires no physical signature.': 'នេះគឺជាបង្កាន់ដៃដែលបង្កើតឡើងដោយកុំព្យូទ័រ និងមិនតម្រូវឱ្យមានហត្ថលេខាឡើយ។',
    '1. prices are subject to vat.\n2. delivery lead time: 2 weeks.\n3. validity: 14 days from date of quote.': '១. តម្លៃមិនទាន់បូករួមអាករលើតម្លៃបន្ថែម (VAT)។\n២. រយៈពេលដឹកជញ្ជូន៖ ២ សប្តាស់។\n៣. សុពលភាព៖ ១៤ ថ្ងៃគិតចាប់ពីថ្ងៃស្នើសម្រង់តម្លៃ។',
    'dear acme corporation, we are pleased to submit our commercial quotation for the requested items detailed below.': 'ជូនចំពោះ ក្រុមហ៊ុន Acme Corporation យើងខ្ញុំរីករាយក្នុងការដាក់ជូននូវសម្រង់តម្លៃសម្រាប់ទំនិញដូចខាងក្រោម។',
    'for queries regarding this quote, contact us at hello@mycompany.com.': 'សម្រាប់សំណួរទាក់ទងនឹងសម្រង់តម្លៃនេះ សូមទាក់ទងមកយើងខ្ញុំតាមរយៈ hello@mycompany.com។',
    'please inspect the shipment upon arrival. notify carrier immediately of any damaged items.': 'សូមពិនិត្យមើលទំនិញនៅពេលមកដល់។ ជូនដំណឹងទៅក្រុមហ៊ុនដឹកជញ្ជូនជាបន្ទាន់ ប្រសិនបើមានទំនិញខូចខាត។',
    'payment mode: cod\nprepared by: sales dept': 'របៀបបង់ប្រាក់៖ COD\nរៀបចំដោយ៖ ផ្នែកលក់',
};

const reverseTranslationMap = {
    'វិក្កយបត្រ': 'INVOICE',
    'លិខិតបញ្ជាទិញ': 'SALE ORDER',
    'បង្កាន់ដៃទទួលប្រាក់': 'RECEIPT',
    'សម្រង់តម្លៃ': 'QUOTATION',
    'ប័ណ្ណប្រគល់ទំនិញ': 'DELIVERY NOTE',
    'លិខិតឥណទាន': 'CREDIT NOTE',
    
    'លេខវិក្កយបត្រ': 'Invoice No',
    'លេខលិខិតបញ្ជាទិញ': 'Order No',
    'លេខបង្កាន់ដៃ': 'Receipt No',
    'លេខសម្រង់តម្លៃ': 'Quote No',
    'លេខប័ណ្ណប្រគល់ទំនិញ': 'DN No',
    'លេខបញ្ជាទិញ': 'PO No',
    'លេខយោង': 'Ref No',
    'លេខយោងការបញ្ជាទិញ': 'PO Ref',
    
    'កាលបរិច្ឆេទចេញផ្សាយ': 'Issue Date',
    'កាលបរិច្ឆេទ': 'Date',
    'កាលបរិច្ឆេទកំណត់ទូទាត់': 'Due Date',
    'កាលបរិច្ឆេទបញ្ជាទិញ': 'Order Date',
    'សុពលភាពដល់': 'Valid Until',
    'កាលបរិច្ឆេទប្រគល់ទំនិញជាក់ស្តែង': 'Actual Delivery Date',
    
    'ជូនចំពោះ': 'Bill To',
    'ព័ត៌មានអតិថិជន': 'Client Info',
    'សម្រង់តម្លៃជូន': 'Quote For',
    'អ្នកលក់': 'Seller',
    'អ្នកទិញ': 'Buyer',
    'ដឹកជញ្ជូនពី': 'Ship From',
    'ដឹកជញ្ជូនទៅ': 'Ship To',
    'ពី': 'From',
    'ព័ត៌មានលម្អិតវិក្កយបត្រ': 'Invoice Details',
    
    'ល.រ': 'No',
    'ពិពណ៌នាទំនិញ': 'Description',
    'បរិមាណ': 'Qty',
    'តម្លៃរាយ': 'Unit Price',
    'តម្លៃ': 'Price',
    'ឯកតា': 'Unit',
    'បញ្ចុះតម្លៃ': 'Discount',
    'អាករ': 'Tax',
    'អត្រាអាករ': 'Tax Rate',
    'សរុប': 'Total',
    'ប្រាក់ត្រូវទូទាត់': 'Total Due',
    'ទឹកប្រាក់': 'Amount',
    'ទឹកប្រាក់ជាអក្សរ': 'Amount in Words',
    
    'សរុបរង': 'Subtotal',
    'សរុបរួម': 'Grand Total',
    'ប្រាក់នៅសល់': 'Balance Due',
    'ប្រាក់កក់': 'Deposit',
    'ប្រាក់បានបង់': 'Paid',
    'បានបង់': 'Paid',
    
    'ព័ត៌មានគណនីធនាគារ': 'Bank Details',
    'ស្កែនដើម្បីទូទាត់': 'Scan to Pay',
    'QR កូដទទួលប្រាក់': 'Payment Receipt QR',
    'ហត្ថលេខាអនុញ្ញាត': 'Authorized Signature',
    'តំណាងអ្នកលក់': 'Seller Representative',
    'ហត្ថលេខាអ្នកទិញ': 'Buyer Signature',
    'ហត្ថលេខាអតិថិជន': 'Customer Signature',
    'អ្នកទទួល': 'Received By',
    'អនុម័តដោយ': 'Authorized By',
    
    'សាច់ប្រាក់': 'Cash',
    'ផ្ទេរប្រាក់': 'Transfer',
    'ឥណទាន': 'Credit',
    
    'សូមអរគុណចំពោះការគាំទ្ររបស់លោកអ្នក!': 'Thank you for your business!',
    'សូមអរគុណសម្រាប់ការបង់ប្រាក់របស់លោកអ្នក!': 'Thank you for your payment!',
    'សូមអរគុណ!': 'Thank you!',
    'ការដឹកជញ្ជូនរំពឹងទុកក្នុងរយៈពេល ៧ ទៅ ១០ ថ្ងៃធ្វើការ។': 'Delivery is expected within 7-10 working days.',
    'លក្ខខណ្ឌផ្សេងៗ': 'Terms & Conditions',
    'ច្បាប់ដើម': 'ORIGINAL',
    'ច្បាប់ចម្លងទី ១': 'COPY 1',
    'ច្បាប់ចម្លងទី ២': 'COPY 2',
    'ត្រា': 'Stamp',
    'កាត់ត្រង់នេះ': 'Cut Here',
    'ការណែនាំ': 'Instructions',
    'សម្គាល់': 'Remarks',
    'ស្ថានភាពទំនិញ': 'Condition',
    'កំណត់សម្គាល់ការបញ្ជាទិញ': 'Order Notes',
    'អនុម័តដោយ (ហត្ថលេខា)': 'Authorized By (Signature)',
    'ជូនចំពោះអតិថិជន': 'Dear Customer',
    
    'នេះគឺជាបង្កាន់ដៃដែលបង្កើតឡើងដោយកុំព្យូទ័រ និងមិនតម្រូវឱ្យមានហត្ថលេខាឡើយ។': 'This is a computer generated receipt and requires no physical signature.',
    '១. តម្លៃមិនទាន់បូករួមអាករលើតម្លៃបន្ថែម (VAT)។\n២. រយៈពេលដឹកជញ្ជូន៖ ២ សប្តាស់។\n៣. សុពលភាព៖ ១៤ ថ្ងៃគិតចាប់ពីថ្ងៃស្នើសម្រង់តម្លៃ។': '1. Prices are subject to VAT.\n2. Delivery lead time: 2 weeks.\n3. Validity: 14 days from date of quote.',
    'ជូនចំពោះ ក្រុមហ៊ុន Acme Corporation យើងខ្ញុំរីករាយក្នុងការដាក់ជូននូវសម្រង់តម្លៃសម្រាប់ទំនិញដូចខាងក្រោម។': 'Dear Acme Corporation, we are pleased to submit our commercial quotation for the requested items detailed below.',
    'សម្រាប់សំណួរទាក់ទងនឹងសម្រង់តម្លៃនេះ សូមទាក់ទងមកយើងខ្ញុំតាមរយៈ hello@mycompany.com។': 'For queries regarding this quote, contact us at hello@mycompany.com.',
    'សូមពិនិត្យមើលទំនិញនៅពេលមកដល់។ ជូនដំណឹងទៅក្រុមហ៊ុនដឹកជញ្ជូនជាបន្ទាន់ ប្រសិនបើមានទំនិញខូចខាត។': 'Please inspect the shipment upon arrival. Notify carrier immediately of any damaged items.',
    'របៀបបង់ប្រាក់៖ COD\nរៀបចំដោយ៖ ផ្នែកលក់': 'Payment Mode: COD\nPrepared By: Sales Dept',
};

const isCurrentKhmer = computed(() => {
    return settingsStore.globalFont === '"Noto Sans Khmer", sans-serif';
});

function translateText(text, targetLang) {
    if (typeof text !== 'string') return text;
    const trimmed = text.trim();
    const hasColon = trimmed.endsWith(':');
    const cleanKey = hasColon ? trimmed.slice(0, -1).trim() : trimmed;
    
    if (targetLang === 'kh') {
        const keyLower = cleanKey.toLowerCase();
        if (translationMap[keyLower]) {
            const translated = translationMap[keyLower];
            return hasColon ? `${translated}:` : translated;
        }
    } else {
        if (reverseTranslationMap[cleanKey]) {
            const translated = reverseTranslationMap[cleanKey];
            return hasColon ? `${translated}:` : translated;
        }
    }
    return text;
}

function translateToKhmer() {
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
    
    settingsStore.setGlobalFont('"Noto Sans Khmer", sans-serif');
    if (settingsStore.currency === 'USD') {
        settingsStore.setCurrency('KHR');
    }
    
    const updatedBlocks = blockStore.blocks.map(block => {
        const newBlock = { ...block };
        
        if ('fontFamily' in newBlock) {
            newBlock.fontFamily = '"Noto Sans Khmer", sans-serif';
        }
        
        switch (newBlock.type) {
            case 'document_title':
            case 'text':
            case 'carbon_copy_label':
            case 'watermark':
                if (newBlock.content) {
                    newBlock.content = translateText(newBlock.content, 'kh');
                }
                break;
                
            case 'document_header':
                if (newBlock.title) {
                    newBlock.title = translateText(newBlock.title, 'kh');
                }
                break;
                
            case 'field_row':
            case 'client_info':
            case 'bank_details':
            case 'signature_line':
            case 'notes':
            case 'terms':
            case 'stamp_box':
                if (newBlock.label) {
                    newBlock.label = translateText(newBlock.label, 'kh');
                }
                if (newBlock.content && newBlock.type !== 'dynamic_text') {
                    newBlock.content = translateText(newBlock.content, 'kh');
                }
                break;
                
            case 'checkboxes_row':
                if (Array.isArray(newBlock.options)) {
                    newBlock.options = newBlock.options.map(opt => ({
                        ...opt,
                        label: translateText(opt.label, 'kh')
                    }));
                }
                break;
                
            case 'item_table':
            case 'table':
            case 'table_builder':
                if (Array.isArray(newBlock.columns)) {
                    newBlock.columns = newBlock.columns.map(col => ({
                        ...col,
                        label: translateText(col.label, 'kh')
                    }));
                }
                break;
        }
        
        return newBlock;
    });
    
    blockStore.setBlocks(updatedBlocks);
    showToast("✓ Canvas translated to Khmer", "success");
}

function translateToEnglish() {
    historyStore.push(JSON.parse(JSON.stringify(blockStore.blocks)));
    
    settingsStore.setGlobalFont('"Noto Sans", sans-serif');
    if (settingsStore.currency === 'KHR') {
        settingsStore.setCurrency('USD');
    }
    
    const updatedBlocks = blockStore.blocks.map(block => {
        const newBlock = { ...block };
        
        if ('fontFamily' in newBlock) {
            newBlock.fontFamily = '"Noto Sans", sans-serif';
        }
        
        switch (newBlock.type) {
            case 'document_title':
            case 'text':
            case 'carbon_copy_label':
            case 'watermark':
                if (newBlock.content) {
                    newBlock.content = translateText(newBlock.content, 'en');
                }
                break;
                
            case 'document_header':
                if (newBlock.title) {
                    newBlock.title = translateText(newBlock.title, 'en');
                }
                break;
                
            case 'field_row':
            case 'client_info':
            case 'bank_details':
            case 'signature_line':
            case 'notes':
            case 'terms':
            case 'stamp_box':
                if (newBlock.label) {
                    newBlock.label = translateText(newBlock.label, 'en');
                }
                if (newBlock.content && newBlock.type !== 'dynamic_text') {
                    newBlock.content = translateText(newBlock.content, 'en');
                }
                break;
                
            case 'checkboxes_row':
                if (Array.isArray(newBlock.options)) {
                    newBlock.options = newBlock.options.map(opt => ({
                        ...opt,
                        label: translateText(opt.label, 'en')
                    }));
                }
                break;
                
            case 'item_table':
            case 'table':
            case 'table_builder':
                if (Array.isArray(newBlock.columns)) {
                    newBlock.columns = newBlock.columns.map(col => ({
                        ...col,
                        label: translateText(col.label, 'en')
                    }));
                }
                break;
        }
        
        return newBlock;
    });
    
    blockStore.setBlocks(updatedBlocks);
    showToast("✓ Canvas translated to English", "success");
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
    <header class="topbar">
        <!-- Logo -->
        <div class="topbar-logo">
            <FileText :size="18" />
            <span>InvoiceForge</span>
        </div>

        <div class="topbar-sep" />

        <!-- Company -->
        <div class="flex items-center gap-1">
            <Building2 :size="13" class="text-panel-muted" />
            <input
                v-model="settingsStore.company"
                class="topbar-select"
                style="width: 120px"
                placeholder="Company name"
            />
        </div>

        <!-- Document Type -->
        <select
            :value="settingsStore.documentType"
            class="topbar-select"
            @change="handleDocumentTypeChange"
        >
            <option
                v-for="dt in settingsStore.documentTypes"
                :key="dt"
                :value="dt"
            >
                {{ dt }}
            </option>
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

        <!-- Font -->
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

        <!-- Font Size -->
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

        <!-- Formatting Controls (MS Word inspired) -->
        <div class="formatting-toolbar flex items-center bg-[rgba(0,0,0,0.18)] border border-panel-border rounded-md p-[2px] gap-px">
            <button
                class="formatting-btn"
                title="Bold (Ctrl+B)"
                @mousedown.prevent="execFormatting('bold')"
            >
                <Bold :size="13" />
            </button>
            <button
                class="formatting-btn"
                title="Italic (Ctrl+I)"
                @mousedown.prevent="execFormatting('italic')"
            >
                <Italic :size="13" />
            </button>
            <button
                class="formatting-btn"
                title="Underline (Ctrl+U)"
                @mousedown.prevent="execFormatting('underline')"
            >
                <Underline :size="13" />
            </button>
            <button
                class="formatting-btn"
                title="Strikethrough"
                @mousedown.prevent="execFormatting('strikeThrough')"
            >
                <Strikethrough :size="13" />
            </button>
            
            <div class="w-px h-3.5 bg-panel-border mx-1" />
            
            <!-- Text Color -->
            <div class="relative flex items-center">
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

            <!-- Highlight Color -->
            <div class="relative flex items-center">
                <button
                    class="formatting-btn"
                    title="Highlight Color"
                    @mousedown.prevent
                    @click="triggerHighlightPicker"
                >
                    <span class="flex flex-col items-center justify-center relative w-full h-full">
                        <span class="text-[10px] font-bold leading-none h-[10px] bg-[rgba(255,255,255,0.15)] px-0.5 rounded-[2px]" style="transform: scale(0.9);">ab</span>
                        <span class="w-[14px] h-[3px] rounded-[1px] absolute bottom-[-3px]" :style="{ backgroundColor: highlightColorVal }" />
                    </span>
                </button>
                <input
                    ref="highlightColorInput"
                    type="color"
                    v-model="highlightColorVal"
                    class="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                    @input="execFormatting('hiliteColor', highlightColorVal)"
                />
            </div>

            <div class="w-px h-3.5 bg-panel-border mx-1" />

            <!-- Horizontal Alignment -->
            <button
                class="formatting-btn font-mono"
                title="Align Left"
                @mousedown.prevent="execFormatting('hAlign', 'left')"
            >
                ←
            </button>
            <button
                class="formatting-btn font-mono"
                title="Align Center"
                @mousedown.prevent="execFormatting('hAlign', 'center')"
            >
                ↔
            </button>
            <button
                class="formatting-btn font-mono"
                title="Align Right"
                @mousedown.prevent="execFormatting('hAlign', 'right')"
            >
                →
            </button>

            <div class="w-px h-3.5 bg-panel-border mx-1" />

            <!-- Vertical Alignment -->
            <button
                class="formatting-btn font-mono"
                title="Align Top"
                @mousedown.prevent="execFormatting('vAlign', 'top')"
            >
                ↑
            </button>
            <button
                class="formatting-btn font-mono"
                title="Align Middle"
                @mousedown.prevent="execFormatting('vAlign', 'middle')"
            >
                ↕
            </button>
            <button
                class="formatting-btn font-mono"
                title="Align Bottom"
                @mousedown.prevent="execFormatting('vAlign', 'bottom')"
            >
                ↓
            </button>
        </div>

        <div class="topbar-sep" />

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

        <!-- Reset to Default -->
        <button
            class="btn btn-ghost text-warning"
            data-tooltip="Reset to default preset"
            @click="handleResetToDefault"
        >
            <RefreshCw :size="13" />
            Reset
        </button>

        <!-- Print -->
        <button
            class="btn btn-ghost"
            data-tooltip="Print (Ctrl+P)"
            @click="handlePrint"
        >
            <Printer :size="13" />
            Print
        </button>

        <div class="topbar-sep" />

        <!-- Translate to Khmer / English -->
        <button
            class="btn btn-ghost"
            :data-tooltip="isCurrentKhmer ? 'Translate canvas fields to English' : 'Translate canvas fields to Khmer'"
            @click="isCurrentKhmer ? translateToEnglish() : translateToKhmer()"
        >
            <Languages :size="13" />
            {{ isCurrentKhmer ? 'Translate to English' : 'Translate to Khmer' }}
        </button>

        <!-- Export / Import dropdown -->
        <div class="relative">
            <button
                class="btn btn-ghost"
                :disabled="isExporting"
                @click="exportMenuOpen = !exportMenuOpen"
            >
                <Loader v-if="isExporting" :size="13" class="spin" />
                <Upload v-else :size="13" />
                {{ isExporting ? "Exporting…" : "Export" }}
                <ChevronDown :size="11" />
            </button>
            <div
                v-if="exportMenuOpen"
                class="context-menu animate-fade-in"
                style="
                    top: calc(100% + 4px);
                    right: 0;
                    left: auto;
                    min-width: 200px;
                "
                @mouseleave="exportMenuOpen = false"
            >
                <div class="context-menu-item" @click="exportPDF">
                    📄 Export as PDF
                </div>
                <div class="context-menu-item" @click="exportPNG">
                    🖼 Export as PNG
                </div>
                <div class="context-menu-item" @click="exportJSON">
                    📦 Export as JSON
                </div>
                <div class="context-menu-separator" />
                <div class="context-menu-item" @click="importFromFile">
                    <FolderOpen
                        :size="13"
                        style="display: inline; margin-right: 6px"
                    />
                    Import from JSON
                </div>
            </div>
        </div>


    </header>

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
                    style="margin-bottom: 16px"
                    placeholder="My Invoice Template"
                />
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

.formatting-toolbar {
    margin: 0 4px;
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
    color: #ffffff;
}

.formatting-btn.active {
    background: var(--color-accent-dim);
    color: var(--color-accent);
}
</style>
