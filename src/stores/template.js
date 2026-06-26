import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useBlockStore } from "./blocks.js";
import { useCanvasStore } from "./canvas.js";
import { useSettingsStore } from "./settings.js";

const STORAGE_KEY = "invoiceforge_templates";

export const useTemplateStore = defineStore("template", () => {
  const folders = ref([]);
  const currentTemplateName = ref("");
  const currentTemplateId = ref(null);
  const currentFolderId = ref(null);
  const isDirty = ref(false);

  // Computed templates: flattens all templates from all folders
  const templates = computed(() => {
    const list = [];
    folders.value.forEach((f) => {
      if (Array.isArray(f.templates)) {
        f.templates.forEach((t) => {
          list.push({
            ...t,
            schema: t.data || t.schema,
            data: t.data || t.schema,
          });
        });
      }
    });
    return list;
  });

  // Action: Read from localStorage
  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        folders.value = parsed.folders || [];
      } else {
        folders.value = [];
      }
    } catch (e) {
      console.error("Failed to load templates from localStorage", e);
      folders.value = [];
    }
  }

  // Action: Write to localStorage
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders: folders.value }));
    } catch (e) {
      console.error("Failed to save templates to localStorage", e);
    }
  }

  // Action: Create folder
  function createFolder(name) {
    if (!name || !name.trim()) return null;
    const newFolder = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      templates: [],
    };
    folders.value.push(newFolder);
    saveToStorage();
    return newFolder;
  }

  // Action: Rename folder
  function renameFolder(id, name) {
    if (!name || !name.trim()) return;
    const folder = folders.value.find((f) => f.id === id);
    if (folder) {
      folder.name = name.trim();
      saveToStorage();
    }
  }

  // Action: Delete folder and all templates inside
  function deleteFolder(id) {
    folders.value = folders.value.filter((f) => f.id !== id);
    if (currentFolderId.value === id) {
      currentFolderId.value = null;
      currentTemplateId.value = null;
      currentTemplateName.value = "";
    }
    saveToStorage();
  }

  // Helper to generate a small thumbnail from the fabric canvas
  function generateThumbnail() {
    try {
      const canvasStore = useCanvasStore();
      const canvas = canvasStore.fabricCanvas;
      if (canvas && typeof canvas.toDataURL === "function") {
        return canvas.toDataURL({
          format: "png",
          quality: 0.4,
          multiplier: 0.1,
        });
      }
    } catch (e) {
      console.error("Failed to generate thumbnail:", e);
    }
    return null;
  }

  // Action: Save or update template
  function saveTemplate(name, folderId, canvasData) {
    if (!name || !name.trim()) return;
    const folder = folders.value.find((f) => f.id === folderId);
    if (!folder) return;

    const thumbnail = generateThumbnail();
    const cleanData = JSON.parse(JSON.stringify(canvasData));

    // Determine if updating an existing template
    const tid = currentTemplateId.value || crypto.randomUUID();
    let existingTemplate = null;
    let oldFolder = null;

    // Search for template in all folders
    for (const f of folders.value) {
      const t = f.templates?.find((temp) => temp.id === tid);
      if (t) {
        existingTemplate = t;
        oldFolder = f;
        break;
      }
    }

    if (existingTemplate) {
      existingTemplate.name = name.trim();
      existingTemplate.data = cleanData;
      existingTemplate.updatedAt = new Date().toISOString();
      if (thumbnail) {
        existingTemplate.thumbnail = thumbnail;
      }

      // If the destination folder is different, move it
      if (oldFolder && oldFolder.id !== folderId) {
        oldFolder.templates = oldFolder.templates.filter((t) => t.id !== tid);
        folder.templates.push(existingTemplate);
      }
    } else {
      const newTemplate = {
        id: tid,
        name: name.trim(),
        thumbnail: thumbnail || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: cleanData,
      };
      folder.templates.push(newTemplate);
    }

    currentTemplateId.value = tid;
    currentTemplateName.value = name.trim();
    currentFolderId.value = folderId;
    isDirty.value = false;
    saveToStorage();
  }

  // Flag to temporarily disable dirty check during loading
  let isLoading = false;

  // Action: Load template onto canvas
  function loadTemplate(templateData) {
    isLoading = true;

    const blockStore = useBlockStore();
    const canvasStore = useCanvasStore();
    const settingsStore = useSettingsStore();

    // Data can be nested in .data property, .schema property, or top-level schema
    const schema = templateData.data || templateData.schema || templateData;

    // Load blocks and properties onto store
    if (Array.isArray(schema.blocks)) {
      // Re-map IDs if loading a preset (read-only, no stored id or isPreset flag)
      const freshBlocks = schema.blocks.map((b) => ({
        ...b,
        id: templateData.isPreset ? crypto.randomUUID() : (b.id || crypto.randomUUID()),
      }));
      blockStore.setBlocks(freshBlocks);
    } else {
      blockStore.setBlocks([]);
    }

    if (schema.format) canvasStore.setFormat(schema.format);
    if (schema.orientation) canvasStore.setOrientation(schema.orientation);

    if (schema.settings) {
      if (schema.settings.currency) settingsStore.setCurrency(schema.settings.currency);
      if (schema.settings.globalFont) settingsStore.setGlobalFont(schema.settings.globalFont);
      if (schema.settings.globalFontSize) settingsStore.setGlobalFontSize(schema.settings.globalFontSize);
      if (schema.settings.documentType) settingsStore.setDocumentType(schema.settings.documentType);
      if (schema.settings.company) settingsStore.setCompany(schema.settings.company);
      if (schema.settings.globalFormat) {
        settingsStore.globalFormat = {
          ...settingsStore.globalFormat,
          ...schema.settings.globalFormat
        };
      }
    }

    // Set template meta
    if (templateData.isPreset) {
      // Presets are loaded as new template
      currentTemplateId.value = null;
      currentTemplateName.value = templateData.name || "";
      currentFolderId.value = null;
    } else {
      currentTemplateId.value = templateData.id || null;
      currentTemplateName.value = templateData.name || "";
      // Find the folder containing it
      const parentFolder = folders.value.find((f) => f.templates?.some((t) => t.id === templateData.id));
      currentFolderId.value = parentFolder ? parentFolder.id : null;
    }

    // Allow Vue watcher queues to flush before enabling dirty checking
    setTimeout(() => {
      isLoading = false;
      isDirty.value = false;
    }, 150);
  }

  // Action: Rename template
  function renameTemplate(folderId, templateId, name) {
    if (!name || !name.trim()) return;
    const folder = folders.value.find((f) => f.id === folderId);
    if (folder) {
      const template = folder.templates?.find((t) => t.id === templateId);
      if (template) {
        template.name = name.trim();
        template.updatedAt = new Date().toISOString();
        if (currentTemplateId.value === templateId) {
          currentTemplateName.value = name.trim();
        }
        saveToStorage();
      }
    }
  }

  // Action: Delete template
  function deleteTemplate(folderId, templateId) {
    const folder = folders.value.find((f) => f.id === folderId);
    if (folder) {
      folder.templates = (folder.templates || []).filter((t) => t.id !== templateId);
      if (currentTemplateId.value === templateId) {
        currentTemplateId.value = null;
        currentTemplateName.value = "";
        currentFolderId.value = null;
      }
      saveToStorage();
    }
  }

  // Action: Move template between folders
  function moveTemplate(templateId, fromFolderId, toFolderId) {
    const fromFolder = folders.value.find((f) => f.id === fromFolderId);
    const toFolder = folders.value.find((f) => f.id === toFolderId);
    if (fromFolder && toFolder) {
      const idx = fromFolder.templates?.findIndex((t) => t.id === templateId) ?? -1;
      if (idx !== -1) {
        const [template] = fromFolder.templates.splice(idx, 1);
        template.updatedAt = new Date().toISOString();
        toFolder.templates = toFolder.templates || [];
        toFolder.templates.push(template);
        if (currentTemplateId.value === templateId) {
          currentFolderId.value = toFolderId;
        }
        saveToStorage();
      }
    }
  }

  // Helper actions to maintain backwards compatibility
  function exportAsJson(schema) {
    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(currentTemplateName.value || "template").replace(/\s+/g, "_")}.json`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function importFromJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const schema = JSON.parse(e.target.result);
          resolve(schema);
        } catch {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Automatic dirty state tracking
  const blockStore = useBlockStore();
  const canvasStore = useCanvasStore();
  const settingsStore = useSettingsStore();

  watch(
    [
      () => blockStore.blocks,
      () => canvasStore.formatId,
      () => canvasStore.orientation,
      () => settingsStore.company,
      () => settingsStore.documentType,
      () => settingsStore.currency,
      () => settingsStore.globalFont,
      () => settingsStore.globalFontSize,
    ],
    () => {
      if (isLoading) return;
      isDirty.value = true;
    },
    { deep: true }
  );

  // Initialize
  loadFromStorage();

  return {
    folders,
    currentTemplateName,
    currentTemplateId,
    currentFolderId,
    isDirty,
    templates,
    loadFromStorage,
    saveToStorage,
    createFolder,
    renameFolder,
    deleteFolder,
    saveTemplate,
    loadTemplate,
    renameTemplate,
    deleteTemplate,
    moveTemplate,
    exportAsJson,
    importFromJson,
  };
});
