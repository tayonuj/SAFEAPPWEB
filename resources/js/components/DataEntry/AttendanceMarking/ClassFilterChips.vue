<template>
  <template v-for="c in classes" :key="c.classId">
    <button
        type="button"
        class="btn btn-sm me-2 mb-2"
        :class="selected.has(c.classId) ? 'btn-primary' : 'btn-outline-primary'"
        @click="$emit('toggle', c.classId)"
    >
      {{ c.className }} <small class="opacity-75">({{ c.classId }})</small>
    </button>
  </template>
  <button v-if="classes.length" class="btn btn-sm btn-link text-decoration-none" @click="$emit('reset')">
    Reset
  </button>
</template>

<script setup>
defineProps({
  classes: { type: Array, default: () => [] },
  selected: { type: Object, required: true } // Set
});
defineEmits(['toggle','reset']);
</script>
