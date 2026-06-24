# InvoiceForge — Invoice & Document Builder

A browser-based tool for creating professional invoices, receipts, quotes, and other business documents — **no coding required**.

---

## What It Does

InvoiceForge lets users design and export document templates visually using a drag-and-drop canvas. Think of it like a simple version of Canva, but specifically built for business documents.

**Key capabilities:**
- 🖱️ **Drag-and-drop editor** — add, move, and resize content blocks on a canvas
- 🗂️ **Ready-made templates** — Invoice, Receipt, Quote, Purchase Order, Delivery Note, and more
- 🖨️ **Export to PDF, PNG, or JSON** — ready to print or share
- 💾 **Save templates** — store and reload designs in the browser
- 🌐 **English ↔ Khmer translation** — one-click language switch with automatic currency change (USD ↔ KHR)
- 📐 **Multiple paper sizes** — A4, A5, 58mm and 80mm thermal receipts

---

## Document Types Supported

| Type | Description |
|---|---|
| Invoice | Standard billing document |
| Sale Order | Sales order with delivery fields |
| Receipt | Payment receipt with thank-you message |
| Quote | Quotation with validity and terms |
| Delivery Note | Shipping document with item conditions |
| Purchase Order | Buyer/seller purchase document |
| Credit Note | Refund and credit document |
| Custom | Blank canvas, build from scratch |

---

## How to Run (for developers)

**Requirements:** Node.js installed

```bash
# Install dependencies
npm install

# Start the app locally
npm run dev
```

Then open `http://localhost:5173` in a browser.

To build for production:
```bash
npm run build
```

---

## How to Use

### 1. Pick a Document Type
Select a document type from the top bar (e.g. **Invoice**, **Receipt**, **Quote**). A ready-made layout will load automatically on the canvas.

### 2. Add & Arrange Blocks
Browse the **block library** on the left panel. Drag any block onto the canvas — text, tables, images, signatures, QR codes, and more. Blocks can be freely moved, resized, and rotated.

### 3. Edit Content
Click any block on the canvas to open the **Inspector Panel** on the right. From there you can:
- Edit text, labels, and values
- Change fonts, colors, borders, and padding
- Control position and size with exact pixel values
- Show or hide individual fields

### 4. Configure Document Settings
Use the **top bar** to set:
- Company name and currency
- Paper size (A4, A5, 58mm / 80mm receipt)
- Page orientation (Portrait / Landscape)
- Global font and font size

### 5. Save Your Template
Click **Save** in the top bar, give the template a name, and it will be stored in your browser. You can reload it anytime. To back it up, use **Export → JSON** to download the template file.

### 6. Export or Print
When the document is ready:
- **Print** — opens the browser print dialog
- **Export PDF** — saves a print-quality PDF
- **Export PNG** — saves the canvas as an image

### Tips
- Use **Preview Mode** (canvas toolbar) to see the document filled with sample data
- Use **Fill Mode** to type directly onto the canvas instead of using the inspector
- Press `Ctrl+Z` / `Ctrl+Shift+Z` to undo / redo any change
- Click **Translate** to switch all text between **English and Khmer** instantly

---

## Tech Overview

Built with modern, lightweight web technologies — no server or database required.

| Layer | Technology |
|---|---|
| Framework | Vue 3 |
| Build Tool | Vite |
| State | Pinia |
| Export | Browser Print API (PDF), Canvas API (PNG) |
| Storage | Browser localStorage |

---

*Last updated: June 2026*
