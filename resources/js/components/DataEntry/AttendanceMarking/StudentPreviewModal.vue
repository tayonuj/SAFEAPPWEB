<template>
  <div class="modal-backdrop-custom">
    <div class="modal-card">
      <div class="d-flex align-items-center justify-content-between">
        <h6 class="mb-0">Student</h6>
        <button class="btn btn-sm btn-link" @click="$emit('close')">
          <i class="fa fa-times"></i>
        </button>
      </div>

      <div class="mt-3 d-flex align-items-center gap-3">
        <div
            class="rounded-circle bg-200 d-flex align-items-center justify-content-center overflow-hidden"
            style="width:84px;height:84px;"
        >
          <template v-if="student?.studentImage">
            <img :src="student.studentImage" style="width:84px;height:84px;object-fit:cover;" alt="avatar"/>
          </template>
          <template v-else>
            <span class="text-700 fs-3 fw-bold">{{ (student?.studentName || 'S').charAt(0) }}</span>
          </template>
        </div>

        <div>
          <div class="fw-bold fs-5">{{ student?.studentName }}</div>
          <div class="small text-muted">
            {{ student?.studentId }} • {{ student?.className }}
          </div>

          <!-- NEW: amount row (only when provided) -->
          <div v-if="amount != null" class="mt-1">
            <span class="badge bg-success">
              Paid: {{ Number(amount).toLocaleString() }} LKR
            </span>
          </div>
        </div>

        <div class="ms-auto small text-muted" v-if="countdown > 0">
          Closing in {{ countdown }}s
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  student: { type: Object, default: null },
  countdown: { type: Number, default: 0 },
  // NEW: paid amount (number or null)
  amount: { type: [Number, String], default: null }
});
defineEmits(['close']);
</script>

<style scoped>
.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1080; }
.modal-card { width: min(460px,92vw); background: var(--falcon-card-bg,#fff); border-radius: 12px; border:1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15); padding:16px 18px; }
</style>
