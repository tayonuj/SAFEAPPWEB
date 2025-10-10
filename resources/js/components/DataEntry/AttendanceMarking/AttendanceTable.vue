<template>
  <div class="card mt-3">
    <div class="card-header d-flex align-items-center justify-content-between">
      <h6 class="mb-0">පැමිණි සිසුන්</h6>
      <span class="badge bg-200 text-dark">Showing {{ rows.length }}</span>
    </div>

    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead>
        <tr class="bg-200">
          <th>සිසුවා</th>
          <th>අංකය</th>
          <th>පන්තිය</th>
          <th class="text-center">වේලාව</th>
          <th class="text-center">ගෙවීම්</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="loading">
          <td colspan="5" class="text-center py-4">
            <div class="spinner-border spinner-border-sm" role="status"></div>
            <span class="ms-2 text-muted">Loading…</span>
          </td>
        </tr>

        <tr v-else-if="!rows.length">
          <td colspan="5" class="text-center text-muted py-4">තවමත් සිසුන් පැමිණියේ නැත.</td>
        </tr>

        <tr v-for="(s, i) in rows" :key="s.studentId + '-' + i">
          <td class="fw-semibold">
            <div class="d-flex align-items-center gap-2">
              <div class="rounded-circle bg-200 d-flex align-items-center justify-content-center" style="width:34px;height:34px;">
                <span class="text-700 fw-bold">{{ (s.studentName || 'S').charAt(0) }}</span>
              </div>
              {{ s.studentName || '—' }}
            </div>
          </td>
          <td><span class="badge bg-100 text-dark border">{{ s.studentId }}</span></td>
          <td>{{ s.className }}</td>
          <td class="text-center">
            <span class="badge bg-100 text-dark border">{{ s.time }}</span>
          </td>
          <td class="text-center">
            <!-- always clickable; parent decides -->
            <button
                class="badge border-0"
                :class="s.paymentStatus==='paid' ? 'bg-success' : 'bg-warning text-dark'"
                @click="$emit('chip-click', s)"
                :title="s.paymentStatus==='paid' ? 'View' : 'Add payment'"
                style="cursor:pointer"
            >
              {{ s.paymentStatus==='paid' ? 'ගෙවූවා' : 'ගෙවීම නැත' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  rows: { type: Array, default: () => [] }
});
defineEmits(['chip-click']);
</script>
