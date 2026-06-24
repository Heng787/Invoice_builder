import { onMounted, onUnmounted, nextTick } from "vue";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useBlockStore } from "../stores/blocks.js";
import { useCanvasStore } from "../stores/canvas.js";
import { useTemplateStore } from "../stores/template.js";

/**
 * Appends an anchor to the DOM, clicks it, then removes it after a frame.
 * More reliable than clicking a detached element.
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
 * Captures the canvas paper at zoom 1 using html2canvas.
 *
 * BUG FIX: Previously the code set paper.style.transform = 'scale(1)' then
 * awaited nextTick(), which caused Vue to re-apply its reactive zoom transform,
 * undoing the reset. The fix is to go through the store so Vue itself renders
 * the paper at scale 1 before capture.
 */
async function captureCanvas(blockStore, canvasStore) {
  const paper = document.getElementById("canvas-paper");
  if (!paper) throw new Error("Canvas element not found");

  const selectedBackup = [...blockStore.selectedIds];
  blockStore.clearSelection();
  paper.classList.add("export-active");

  const backupZoom = canvasStore.zoom;
  canvasStore.setZoom(1);

  // Two frames: one for Vue to react, one for the browser to paint
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
    return { canvas, selectedBackup, backupZoom, paper };
  } catch (err) {
    restoreCanvas(
      { paper, selectedBackup, backupZoom },
      canvasStore,
      blockStore,
    );
    throw err;
  }
}

function restoreCanvas(
  { paper, selectedBackup, backupZoom },
  canvasStore,
  blockStore,
) {
  canvasStore.setZoom(backupZoom);
  paper.classList.remove("export-active");
  blockStore.selectBlocks(selectedBackup);
}

export function useExport() {
  const blockStore = useBlockStore();
  const canvasStore = useCanvasStore();
  const templateStore = useTemplateStore();

  async function handleExportPDF() {
    document.dispatchEvent(
      new CustomEvent("export:start", { detail: { type: "pdf" } }),
    );
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

      // JPEG at 95% quality produces smaller, faster PDFs than PNG
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const filename = `${templateStore.currentTemplateName || "invoice-template"}.pdf`;
      doc.save(filename);

      document.dispatchEvent(
        new CustomEvent("export:done", { detail: { type: "pdf", filename } }),
      );
    } catch (err) {
      console.error("PDF export failed:", err);
      document.dispatchEvent(
        new CustomEvent("export:error", { detail: { message: err.message } }),
      );
    }
  }

  async function handleExportPNG() {
    document.dispatchEvent(
      new CustomEvent("export:start", { detail: { type: "png" } }),
    );
    try {
      const captureResult = await captureCanvas(blockStore, canvasStore);
      const { canvas } = captureResult;
      restoreCanvas(captureResult, canvasStore, blockStore);

      const filename = `${templateStore.currentTemplateName || "invoice-template"}.png`;
      const imgData = canvas.toDataURL("image/png");
      triggerDownload(imgData, filename);

      document.dispatchEvent(
        new CustomEvent("export:done", { detail: { type: "png", filename } }),
      );
    } catch (err) {
      console.error("PNG export failed:", err);
      document.dispatchEvent(
        new CustomEvent("export:error", { detail: { message: err.message } }),
      );
    }
  }

  onMounted(() => {
    document.addEventListener("canvas:export-pdf", handleExportPDF);
    document.addEventListener("canvas:export-png", handleExportPNG);
  });

  onUnmounted(() => {
    document.removeEventListener("canvas:export-pdf", handleExportPDF);
    document.removeEventListener("canvas:export-png", handleExportPNG);
  });
}
