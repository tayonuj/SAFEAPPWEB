<template>
  <div class="row g-3">
    <div class="col-12">
      <label class="form-label">සතියේ දිනයන්</label>
      <div class="d-flex flex-wrap gap-2">
        <button
            v-for="d in days"
            :key="d"
            type="button"
            class="btn btn-sm"
            :class="modelSelected.includes(d) ? 'btn-primary' : 'btn-outline-primary'"
            :disabled="!editing"
            @click="$emit('toggle-day', d)"
        >
          {{ d }}
        </button>
      </div>
    </div>

    <div class="col-12" v-if="modelSelected.length">
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead class="bg-200">
          <tr>
            <th style="width:200px">දිනය</th>
            <th style="width:220px">වේලාව</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="d in modelSelected" :key="d">
            <td class="fw-semibold">{{ d }}</td>
            <td><input type="time" class="form-control" v-model="modelTime[d]" :readonly="!editing" /></td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" type="button" :disabled="!editing" @click="$emit('remove-day', d)">
                <i class="fa fa-times"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <small class="text-muted">අවම වශයෙන් දිනයක් වත් සහිත විය යුතුය.</small>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  days: { type: Array, default: () => [] },
  modelSelected: { type: Array, default: () => [] },
  modelTime: { type: Object, default: () => ({}) },
  editing: { type: Boolean, default: false },
});
defineEmits(['toggle-day','remove-day']);
</script>
