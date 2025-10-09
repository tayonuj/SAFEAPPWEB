<template>
  <div class="row g-3">
    <div class="col-12 col-md-6">
      <label class="form-label">පන්ති නම</label>
      <input class="form-control" :readonly="!editing" :value="className" @input="$emit('update:class-name',$event.target.value)" />
    </div>
    <div class="col-12 col-md-3">
      <label class="form-label">ශ්‍රේණිය</label>
      <input class="form-control" :readonly="!editing" :value="grade" @input="$emit('update:grade',$event.target.value)" />
    </div>
    <div class="col-12 col-md-3">
      <label class="form-label">ගාස්තුව (LKR)</label>
      <input class="form-control" :readonly="!editing" :value="classFee" @input="$emit('update:class-fee',$event.target.value)" type="number" min="0" />
    </div>

    <div class="col-12">
      <label class="form-label">ගුරු</label>
      <div class="d-flex align-items-center justify-content-between border rounded p-2">
        <div class="d-flex align-items-center gap-2">
          <img v-if="lecturerImage" :src="lecturerImage" class="rounded-circle" style="width:46px;height:46px;object-fit:cover;border:1px solid #e5e7eb" />
          <div v-else class="rounded-circle d-flex align-items-center justify-content-center bg-200 text-700" style="width:46px;height:46px;">
            <i class="fa fa-user"></i>
          </div>
          <div>
            <div class="fw-semibold">{{ lecturerName || '—' }}</div>
            <small class="text-muted">{{ lecturerId || '' }}</small>
          </div>
        </div>
        <button class="btn btn-sm btn-falcon-info" @click="$emit('scan-lecturer')" :disabled="!editing">
          <i class="fa fa-wifi me-1"></i> Scan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  className: String,
  grade: String,
  classFee: String,
  lecturerName: String,
  lecturerId: String,
  lecturerImage: String,
  editing: Boolean,
});
defineEmits(['update:class-name','update:grade','update:class-fee','scan-lecturer']);
</script>
