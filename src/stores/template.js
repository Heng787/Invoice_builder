import { defineStore } from "pinia";
import { ref, computed } from "vue";

const STORAGE_KEY = "invoice_builder_templates";
const COMPONENTS_KEY = "invoice_builder_components";

export const useTemplateStore = defineStore("template", () => {
  const templates = ref(loadTemplates());
  const components = ref(loadComponents());
  const currentTemplateName = ref("Untitled Template");
  const isDirty = ref(false);

  const templateList = computed(() =>
    templates.value.map((t) => ({
      id: t.id,
      name: t.name,
      updatedAt: t.updatedAt,
    })),
  );

  function loadTemplates() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  }

  function loadComponents() {
    try {
      return JSON.parse(localStorage.getItem(COMPONENTS_KEY) ?? "[]");
    } catch {
      return [];
    }
  }

  function saveTemplate(name, schema) {
    const existing = templates.value.find((t) => t.name === name);
    if (existing) {
      existing.schema = schema;
      existing.updatedAt = new Date().toISOString();
    } else {
      templates.value.push({
        id: crypto.randomUUID(),
        name,
        schema,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    currentTemplateName.value = name;
    isDirty.value = false;
    persistTemplates();
  }

  function loadTemplate(id) {
    return templates.value.find((t) => t.id === id) ?? null;
  }

  function deleteTemplate(id) {
    templates.value = templates.value.filter((t) => t.id !== id);
    persistTemplates();
  }

  function saveComponent(name, blockData) {
    components.value.push({
      id: crypto.randomUUID(),
      name,
      blockData,
      createdAt: new Date().toISOString(),
    });
    persistComponents();
  }

  function deleteComponent(id) {
    components.value = components.value.filter((c) => c.id !== id);
    persistComponents();
  }

  function persistTemplates() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value));
  }

  function persistComponents() {
    localStorage.setItem(COMPONENTS_KEY, JSON.stringify(components.value));
  }

  function markDirty() {
    isDirty.value = true;
  }

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
    // Delay revoke so the browser has time to start the download
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

  return {
    templates,
    components,
    currentTemplateName,
    isDirty,
    templateList,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    saveComponent,
    deleteComponent,
    markDirty,
    exportAsJson,
    importFromJson,
  };
});
