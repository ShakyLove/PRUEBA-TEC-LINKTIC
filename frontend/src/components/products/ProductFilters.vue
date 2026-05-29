<template>
  <div class="filters-grid">
    <n-input
      v-model:value="localFilters.search"
      clearable
      placeholder="Buscar producto..."
    >
      <template #prefix>
        <FontAwesomeIcon :icon="faMagnifyingGlass" />
      </template>
    </n-input>

    <n-select
      v-model:value="localFilters.category"
      clearable
      :options="categoryOptions"
      placeholder="Categoria"
    />

    <n-select
      v-model:value="localFilters.sortBy"
      :options="sortOptions"
      placeholder="Ordenar por"
    />

    <n-select
      v-model:value="localFilters.direction"
      :options="directionOptions"
      placeholder="Direccion"
    />
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { NInput, NSelect } from "naive-ui";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["apply"]);
const localFilters = reactive({ ...props.filters });
let debounceId;

watch(
  () => props.filters,
  (nextFilters) => Object.assign(localFilters, nextFilters),
  { deep: true }
);

watch(
  () => ({ ...localFilters }),
  (nextFilters) => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      emit("apply", { ...nextFilters, page: 0 });
    }, 260);
  },
  { deep: true }
);

const categoryOptions = computed(() =>
  props.categories.map((category) => ({
    label: category,
    value: category
  }))
);

const sortOptions = [
  { label: "Mas recientes", value: "id" },
  { label: "Nombre", value: "name" },
  { label: "Precio", value: "price" },
  { label: "Categoria", value: "category" }
];

const directionOptions = [
  { label: "Ascendente", value: "asc" },
  { label: "Descendente", value: "desc" }
];
</script>

<style scoped>
.filters-grid {
  display: grid;
  grid-template-columns: minmax(260px, 1.8fr) repeat(3, minmax(160px, 1fr));
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.filters-grid :deep(.n-input),
.filters-grid :deep(.n-base-selection) {
  min-height: 40px;
}

@media (max-width: 1080px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
