import { onMounted, onUnmounted, nextTick } from "vue";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, BorderStyle, AlignmentType, HeadingLevel,
} from "docx";
import { useBlockStore } from "../stores/blocks.js";
import { useCanvasStore } from "../stores/canvas.js";
import { useTemplateStore } from "../stores/template.js";
import { usePreviewStore } from "../stores/preview.js";

/**
 * Creates and triggers a temporary download link
 */
function triggerDownload(href, filename) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 200);
}

/**
 * Captures the canvas as an image at 100% zoom
 */
async function captureCanvas(blockStore, canvasStore) {
  const paper = document.getElementById("canvas-paper");
  if (!paper) throw new Error("Canvas element not found");
  
  const previewStore = usePreviewStore();

  const selectedBackup = [...blockStore.selectedIds];
  blockStore.clearSelection();
  paper.classList.add("export-active");

  const backupZoom = canvasStore.zoom;
  const backupPreview = previewStore.isPreviewMode;
  
  canvasStore.setZoom(1);
  previewStore.isPreviewMode = true;

  await nextTick();
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));

  try {
    const canvas = await html2canvas(paper, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: paper.offsetWidth,
      height: paper.offsetHeight,
    });
    return { canvas, selectedBackup, backupZoom, backupPreview, paper };
  } catch (err) {
    restoreCanvas({ paper, selectedBackup, backupZoom, backupPreview }, canvasStore, blockStore);
    throw err;
  }
}

/**
 * Restores canvas state after export capture
 */
function restoreCanvas({ paper, selectedBackup, backupZoom, backupPreview }, canvasStore, blockStore) {
  const previewStore = usePreviewStore();
  previewStore.isPreviewMode = backupPreview;
  canvasStore.setZoom(backupZoom);
  paper.classList.remove("export-active");
  blockStore.selectBlocks(selectedBackup);
}

// ─── DOCX helpers ────────────────────────────────────────────────────────────

/**
 * Converts a block to DOCX paragraph elements
 */
function blockToDocxElements(block) {
  const elements = [];

  if (block.type === "text" || block.type === "heading") {
    const text = block.content ?? block.text ?? "";
    elements.push(
      new Paragraph({
        children: [new TextRun({ text, size: (block.fontSize ?? 12) * 2 })],
        heading: block.type === "heading" ? HeadingLevel.HEADING_1 : undefined,
      })
    );
  } else if (block.type === "item_table" && Array.isArray(block.items)) {
    const cols = (block.columns ?? []).filter((c) => c.visible !== false);
    if (cols.length === 0) return elements;

    const colWidthPct = Math.floor(100 / cols.length);

    const headerRow = new TableRow({
      children: cols.map(
        (col) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: col.label ?? col.id, bold: true })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            width: { size: colWidthPct, type: WidthType.PERCENTAGE },
            borders: tableBorders(),
          })
      ),
      tableHeader: true,
    });

    const dataRows = block.items.map(
      (item) =>
        new TableRow({
          children: cols.map(
            (col) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: String(item[col.id] ?? "") })],
                  }),
                ],
                width: { size: colWidthPct, type: WidthType.PERCENTAGE },
                borders: tableBorders(),
              })
          ),
        })
    );

    elements.push(
      new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
      new Paragraph("") // spacer
    );
  } else if (block.type === "bank_details") {
    if (block.bankName) elements.push(new Paragraph({ children: [new TextRun({ text: `Bank: ${block.bankName}` })] }));
    if (block.accountNo) elements.push(new Paragraph({ children: [new TextRun({ text: `Account No: ${block.accountNo}` })] }));
    if (block.accountName) elements.push(new Paragraph({ children: [new TextRun({ text: `Account Name: ${block.accountName}` })] }));
    if (elements.length > 0) elements.push(new Paragraph(""));
  } else if (block.content || block.text) {
    const text = block.content ?? block.text ?? "";
    if (text) elements.push(new Paragraph({ children: [new TextRun({ text })] }));
  }

  return elements;
}

/**
 * Returns standard table border style for DOCX
 */
function tableBorders() {
  const b = { style: BorderStyle.SINGLE, size: 4, color: "aaaaaa" };
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────

/**
 * Escapes a value for CSV format
 */
function csvEscape(val) {
  const s = String(val ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

/**
 * Converts blocks to CSV format
 */
function blocksToCSV(blocks) {
  const lines = [];
  for (const block of blocks) {
    if (block.type === "item_table" && Array.isArray(block.items)) {
      const cols = (block.columns ?? []).filter((c) => c.visible !== false);
      lines.push(cols.map((c) => csvEscape(c.label ?? c.id)).join(","));
      for (const item of block.items) {
        lines.push(cols.map((c) => csvEscape(item[c.id])).join(","));
      }
      lines.push(""); // blank separator between tables
    }
  }
  return lines.join("\r\n");
}

// ─── Composable ──────────────────────────────────────────────────────────────

/**
 * Composable providing document export functionality (PDF, PNG, DOCX, CSV)
 */
export function useExport() {
  const blockStore = useBlockStore();
  const canvasStore = useCanvasStore();
  const templateStore = useTemplateStore();

  /**
   * Dispatches a custom event for export progress tracking
   */
  function dispatch(event, detail = {}) {
    document.dispatchEvent(new CustomEvent(event, { detail }));
  }

  // ── PDF ──────────────────────────────────────────────────────
  
  /**
   * Exports canvas as PDF
   */
  async function handleExportPDF() {
    dispatch("export:start", { type: "pdf" });
    try {
      const captureResult = await captureCanvas(blockStore, canvasStore);
      const { canvas } = captureResult;
      restoreCanvas(captureResult, canvasStore, blockStore);

      const currentFormat = canvasStore.currentFormat;
      const widthMm = currentFormat?.widthMm ?? 210;
      const heightMm = currentFormat?.heightMm ?? 297;
      const orientation = canvasStore.orientation;

      const pdfWidth = orientation === "landscape" ? heightMm : widthMm;
      const pdfHeight = orientation === "landscape" ? widthMm : heightMm;

      const doc = new jsPDF({
        orientation: orientation === "landscape" ? "l" : "p",
        unit: "mm",
        format: canvasStore.formatId.startsWith("RECEIPT")
          ? [pdfWidth, pdfHeight]
          : canvasStore.formatId.toLowerCase(),
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const filename = `${templateStore.currentTemplateName || "invoice"}.pdf`;
      doc.save(filename);
      dispatch("export:done", { type: "pdf", filename });
    } catch (err) {
      console.error("PDF export failed:", err);
      dispatch("export:error", { message: err.message });
    }
  }

  // ── PNG ──────────────────────────────────────────────────────
  
  /**
   * Exports canvas as PNG
   */
  async function handleExportPNG() {
    dispatch("export:start", { type: "png" });
    try {
      const captureResult = await captureCanvas(blockStore, canvasStore);
      const { canvas } = captureResult;
      restoreCanvas(captureResult, canvasStore, blockStore);

      const filename = `${templateStore.currentTemplateName || "invoice"}.png`;
      triggerDownload(canvas.toDataURL("image/png"), filename);
      dispatch("export:done", { type: "png", filename });
    } catch (err) {
      console.error("PNG export failed:", err);
      dispatch("export:error", { message: err.message });
    }
  }

  // ── DOCX ─────────────────────────────────────────────────────
  
  /**
   * Exports blocks as DOCX
   */
  async function handleExportDOCX() {
    dispatch("export:start", { type: "docx" });
    try {
      const sorted = [...blockStore.blocks].sort((a, b) => a.y - b.y || a.x - b.x);
      const children = sorted.flatMap((block) => blockToDocxElements(block));
      if (children.length === 0) children.push(new Paragraph(""));

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const filename = `${templateStore.currentTemplateName || "invoice"}.docx`;
      triggerDownload(url, filename);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      dispatch("export:done", { type: "docx", filename });
    } catch (err) {
      console.error("DOCX export failed:", err);
      dispatch("export:error", { message: err.message });
    }
  }

  // ── CSV ──────────────────────────────────────────────────────
  
  /**
   * Exports table blocks as CSV
   */
  function handleExportCSV() {
    dispatch("export:start", { type: "csv" });
    try {
      const csv = blocksToCSV(blockStore.blocks);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const filename = `${templateStore.currentTemplateName || "invoice"}.csv`;
      triggerDownload(url, filename);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      dispatch("export:done", { type: "csv", filename });
    } catch (err) {
      console.error("CSV export failed:", err);
      dispatch("export:error", { message: err.message });
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────
  
  /**
   * Registers export event listeners on mount
   */
  onMounted(() => {
    document.addEventListener("canvas:export-pdf", handleExportPDF);
    document.addEventListener("canvas:export-png", handleExportPNG);
    document.addEventListener("canvas:export-docx", handleExportDOCX);
    document.addEventListener("canvas:export-csv", handleExportCSV);
  });

  /**
   * Removes export event listeners on unmount
   */
  onUnmounted(() => {
    document.removeEventListener("canvas:export-pdf", handleExportPDF);
    document.removeEventListener("canvas:export-png", handleExportPNG);
    document.removeEventListener("canvas:export-docx", handleExportDOCX);
    document.removeEventListener("canvas:export-csv", handleExportCSV);
  });
}