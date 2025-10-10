<template>
  <div class="modal-backdrop-custom">
    <div class="modal-card">
      <div class="d-flex align-items-center justify-content-between">
        <h6 class="mb-0">ගෙවීම් ඇතුලත් කරන්න</h6>
        <button class="btn btn-sm btn-link" @click="$emit('close')"><i class="fa fa-times"></i></button>
      </div>

      <div class="mt-3 d-flex align-items-center gap-3">
        <div class="rounded-circle bg-200 d-flex align-items-center justify-content-center overflow-hidden"
             style="width:96px;height:96px;">
          <template v-if="student?.studentImage">
            <img :src="student.studentImage" style="width:96px;height:96px;object-fit:cover;" alt="avatar"/>
          </template>
          <template v-else>
            <span class="text-700 fs-2 fw-bold">{{ (student?.studentName || 'S').charAt(0) }}</span>
          </template>
        </div>

        <div>
          <div class="fw-bold fs-5">{{ student?.studentName }}</div>
          <div class="small text-muted">{{ student?.studentId }} • {{ student?.className }}</div>
        </div>

        <div class="ms-auto small text-muted" v-if="countdown > 0">
          Will auto-close in {{ countdown }}s
        </div>
      </div>

      <div class="mt-3">
        <label class="form-label small text-muted">Amount (LKR)</label>
        <input type="number" class="form-control" :value="amount"
               min="0" step="1"
               @focus="$emit('cancel-countdown')"
               @input="$emit('update:amount', $event.target.value)" />
      </div>

      <div class="mt-3 d-flex justify-content-end gap-2">
        <button class="btn btn-outline-secondary" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="$emit('submit')" :disabled="!Number(amount)">Submit</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  student: { type: Object, default: null },
  amount: { type: [String, Number], default: null },
  countdown: { type: Number, default: 0 }
});
defineEmits(['update:amount','cancel-countdown','close','submit']);
</script>

<style scoped>
.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1080; }
.modal-card { width: min(520px,92vw); background: var(--falcon-card-bg,#fff); border-radius: 12px; border:1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15); padding:18px 20px; }
</style>
