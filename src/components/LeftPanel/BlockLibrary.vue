<script setup>
import { ref } from "vue";
import BlockCategory from "./BlockCategory.vue";
import { BLOCK_CATEGORIES } from "../../constants/blockTypes.js";

// All categories open by default except logic/smart (collapsed)
const collapsedCategories = ref(new Set([]));

function toggleCategory(id) {
    if (collapsedCategories.value.has(id)) {
        collapsedCategories.value.delete(id);
    } else {
        collapsedCategories.value.add(id);
    }
}
</script>

<template>
    <div>
        <div class="panel-header" style="padding: 10px 12px 8px">
            Block Library
        </div>

        <BlockCategory
            v-for="cat in BLOCK_CATEGORIES"
            :key="cat.id"
            :category="cat"
            :collapsed="collapsedCategories.has(cat.id)"
            @toggle="toggleCategory(cat.id)"
        />
    </div>
</template>
