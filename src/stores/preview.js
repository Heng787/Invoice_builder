import { defineStore } from "pinia";
import { ref } from "vue";

export const usePreviewStore = defineStore("preview", () => {
  const isPreviewMode = ref(false);

  // Load initial preview JSON from localStorage
  const savedJson = localStorage.getItem("invoice_builder_preview_json") || "{}";
  const rawJson = ref(savedJson);
  
  let initialData = {};
  try {
    initialData = JSON.parse(savedJson);
  } catch (e) {
    console.error("Failed to parse initial preview json:", e);
  }
  const previewData = ref(initialData);

  function applyData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      previewData.value = parsed;
      rawJson.value = jsonString;
      localStorage.setItem("invoice_builder_preview_json", jsonString);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function clearData() {
    previewData.value = {};
    rawJson.value = "{}";
    localStorage.removeItem("invoice_builder_preview_json");
  }

  function setPreviewMode(val) {
    isPreviewMode.value = val;
  }

  const isPrinting = ref(false);

  return {
    isPreviewMode,
    isPrinting,
    previewData,
    rawJson,
    applyData,
    clearData,
    setPreviewMode,
  };
});
