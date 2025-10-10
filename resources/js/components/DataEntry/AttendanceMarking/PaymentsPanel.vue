<template>
  <div class="card mt-3">
    <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
      <h6 class="mb-0">ගෙවීම් ලැබීම්</h6>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-200 text-dark">ගෙවූ සිසුන් {{ items.length }} යි</span>
        <span class="badge bg-success">මුළු එකතුව: {{ totalLkr }}</span>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead>
        <tr class="bg-200">
          <th>සිසුවා</th>
          <th>අංකය</th>
          <th>පන්තිය</th>
          <th class="text-end">ගෙවූ මුදල</th>
          <th class="text-center">මාසය</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="!items.length">
          <td colspan="5" class="text-center text-muted py-4">
            ගෙවීම් කළ ශිෂ්‍යයෝ නැත.
          </td>
        </tr>

        <tr
            v-for="(p, i) in items"
            :key="p.studentId + '-' + p.classId + '-' + p.month + '-' + i"
            class="hover-row"
            :style="{cursor: rowClickable ? 'pointer' : 'default'}"
            @click="rowClickable ? $emit('row-click', p) : null"
        >
          <td class="fw-semibold">
            <div class="d-flex align-items-center gap-2">
              <div class="rounded-circle bg-200 d-flex align-items-center justify-content-center overflow-hidden"
                   style="width:34px;height:34px;">
                <template v-if="p.studentImage">
                  <img :src="p.studentImage" style="width:34px;height:34px;object-fit:cover;" alt="avatar"/>
                </template>
                <template v-else>
                  <span class="text-700 fw-bold">{{ (p.studentName || 'S').charAt(0) }}</span>
                </template>
              </div>
              <div>
                <div>{{ p.studentName || '—' }}</div>
              </div>
            </div>
          </td>
          <td><span class="badge bg-100 text-dark border">{{ p.studentId }}</span></td>
          <td>{{ p.className }}</td>
          <td class="text-end fw-bold text-success">{{ (p.amount || 0).toLocaleString() }}</td>
          <td class="text-center"><span class="badge bg-info text-dark">{{ p.month }}</span></td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer hint -->
    <div class="card-footer small text-muted d-flex justify-content-between">
      <div>Showing {{ items.length }} payments</div>
      <div v-if="rowClickable">Tip: click a row to preview student</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, default: () => [] },   // paid rows
  rowClickable: { type: Boolean, default: true }
});
defineEmits(['row-click']);

const totalLkr = computed(() =>
    (props.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0).toLocaleString() + ' LKR'
);
</script>

<style scoped>
.hover-row:hover { background: var(--falcon-table-hover, #f8f9fa); }
</style>
