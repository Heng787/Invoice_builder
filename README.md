# InvoiceForge — Vue Component Library

A professional, browser-based drag-and-drop document builder packaged as a Vue 3 component library. 
Easily embed a fully-featured invoice, receipt, and quote designer directly into your own web applications — **no backend required**.

---

## What It Does

InvoiceForge lets your users design and export document templates visually using a drag-and-drop canvas. Think of it like a simple version of Canva, but specifically built for business documents.

**Key capabilities:**
- 🖱️ **Drag-and-drop editor** — add, move, and resize content blocks on a canvas
- 🗂️ **Ready-made templates** — Invoice, Receipt, Quote, Purchase Order, Delivery Note, and more
- 🖨️ **Export to PDF, PNG, or JSON** — ready to print or share
- 💾 **Data binding** — Easily load initial JSON data in and receive the updated JSON payload via standard Vue events (`@save`).
- 🌐 **English ↔ Khmer translation** — one-click language switch with automatic currency change (USD ↔ KHR)
- 📐 **Multiple paper sizes** — A4, A5, 58mm and 80mm thermal receipts

---

## Installation & Integration

InvoiceForge is distributed as an NPM package that can be seamlessly embedded in any Vue 3 application.

### 1. Install

```bash
npm install invoice-forge
```

> **⚠️ Important Requirement: Pinia**
> InvoiceForge relies on `pinia` for internal state management. If your host application doesn't already use Pinia, you MUST install it and add it to your Vue app before mounting the component.
> ```javascript
> // main.js in your host app
> import { createApp } from 'vue'
> import { createPinia } from 'pinia'
> import App from './App.vue'
> 
> const app = createApp(App)
> app.use(createPinia()) // REQUIRED
> app.mount('#app')
> ```

### 2. Embed in your App

Import the component and the bundled CSS. You can pass your existing saved invoice templates via the `:initial-data` prop, and catch updates when the user clicks save via the `@save` event.

```vue
<script setup>
import { InvoiceForge } from 'invoice-forge'
import 'invoice-forge/style.css' // Required: injects the isolated Tailwind CSS

// Load your user's existing template from your database
const existingInvoiceData = {
  // ... document schema ...
}

function handleSave(invoiceData) {
  // invoiceData contains the full JSON schema of the document.
  // Save it back to your database!
  console.log('Saved document data:', invoiceData)
}
</script>

<template>
  <div class="h-screen w-full">
    <!-- Embed the builder -->
    <InvoiceForge 
      :initial-data="existingInvoiceData" 
      @save="handleSave" 
    />
  </div>
</template>
```

> **⚠️ Important Requirement: Sizing**
> InvoiceForge fills 100% width and height of its parent container. The host application **must** give the wrapping element explicit dimensions (e.g., `h-screen` or a fixed pixel height), otherwise the builder will collapse and break.

---

## Prop & Event API

### Props
- `:initial-data` (Object): The JSON schema of the document template. If provided, the builder treats this as the source of truth. If omitted, the builder will fall back to using an internal `localStorage` draft mechanism as a safety net.
  - *Note: `initial-data` is only read once on mount. To load a different document, you must remount the component using a `:key` binding.*

### Events
- `@save(data)`: Emitted when the user triggers a save (e.g., clicking the Save button or using `Ctrl+S`). The payload `data` is the complete JSON schema representing the canvas layout, blocks, and settings.
  - *Note: PDF/PNG export happens entirely inside the component's own UI (Export button) and downloads directly in the browser. It does NOT emit an event back to the host app. Only `@save` emits data back.*

---

## Tech Overview

Built with modern, lightweight web technologies. The library output is fully bundled and isolated so it will not clash with your host application's styling.

| Layer | Technology |
|---|---|
| Framework | Vue 3 |
| State | Pinia (Peer Dependency) |
| Styling | Tailwind CSS (Bundled in `style.css`) |
| Export | Browser Print API (PDF), Canvas API (PNG) |

---

*Last updated: June 2026*
