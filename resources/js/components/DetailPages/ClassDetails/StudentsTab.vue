<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h6 class="mb-0">සිසුන්</h6>
      <button class="btn btn-sm btn-falcon-primary" @click="$emit('add-student')">
        <i class="fa fa-user-plus me-1"></i> Add
      </button>
    </div>

    <div v-if="!students?.length" class="text-muted small">සිසුන් තවමත් එකතු වී නොමැත</div>

    <div class="list-group">
      <button
          v-for="s in students"
          :key="s.studentId"
          class="list-group-item list-group-item-action d-flex align-items-center"
          @click="$emit('open-student', s.studentId)"
      >
        <img v-if="s.studentImage" :src="s.studentImage" class="rounded-circle me-2" style="width:36px;height:36px;object-fit:cover;border:1px solid #e5e7eb" />
        <div v-else class="rounded-circle bg-200 text-700 d-flex align-items-center justify-content-center me-2" style="width:36px;height:36px;">
          <i class="fa fa-user"></i>
        </div>
        <div class="text-start">
          <div class="fw-semibold">{{ s.studentName || '—' }}</div>
          <small class="text-muted">{{ s.studentId }}</small>
        </div>
        <span class="ms-auto badge bg-100 text-dark border">{{ s.guardianMobile || '' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ students: { type: Array, default: () => [] } });
defineEmits(['add-student','open-student']);
</script>
