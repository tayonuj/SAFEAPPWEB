<template>
  <div class="mt-3 mb-4">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
        <li class="breadcrumb-item"><a href="/assessments">පුනරීක්ශණ විභාග</a></li>
        <li class="breadcrumb-item active" aria-current="page">ළකුණු ඇතුලත් කරන්න</li>
      </ol>
    </nav>
  </div>

  <div class="container-fluid py-3" v-if="test">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h5 class="mb-0">{{ test.title }}</h5>
        <small class="text-muted">
          {{ test.testId || test._id?.$oid || test._id }} • Total: {{ test.totalMarks }} • Class: {{ test.className }}
        </small>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead class="table-light">
            <tr>
              <th style="width: 64px">#</th>
              <th>Student</th>
              <th style="width: 160px">Marks</th>
              <th style="width: 240px">Remark</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, idx) in rows" :key="row.studentId">
              <td>{{ idx + 1 }}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img v-if="row.image" :src="row.image" class="rounded" style="width:32px;height:32px;object-fit:cover"/>
                  <div>
                    <div class="fw-semibold">{{ row.name || row.studentId }}</div>
                    <small class="text-muted">{{ row.studentId }}</small>
                  </div>
                </div>
              </td>
              <td>
                <input
                    type="number"
                    class="form-control form-control-sm"
                    :max="test.totalMarks"
                    min="0"
                    v-model.number="row.marks"
                    placeholder="0"
                />
              </td>
              <td>
                <input class="form-control form-control-sm" v-model.trim="row.remark" placeholder="Optional"/>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="4" class="text-center text-muted py-4">No students found for this class.</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-3 d-flex gap-2">
      <button class="btn btn-success" :disabled="saving" @click="save">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2"/>Save Marks
      </button>
      <button class="btn btn-outline-secondary" @click="reload">Reload</button>
    </div>
  </div>

  <div v-else class="container-fluid py-3">
    <div class="alert alert-info">Loading test…</div>
  </div>
</template>

<script setup>
import { ref, onMounted ,computed} from 'vue';
import { useRoute } from 'vue-router';
import { ClassesAPI, TestsAPI } from '../../../composables/application/assesment/api';
import notificationHandling from "../../../composables/application/notificationHandling";

// ---- route-prop pattern ----
const props = defineProps({
  testId: { type: String, required: false }
});
const routeId = computed(() => props.testId ?? '');

const test = ref(null);
const classStudents = ref([]);
const currentMarks = ref([]);
const rows = ref([]);
const saving = ref(false);

async function loadTest() {
  const res = await TestsAPI.get(routeId.value); // uses readData under the hood
  // Accept either direct doc or {data: doc}
  test.value = res?.data || res || null;
}

async function loadStudents() {
  if (!test.value?.classId) return;
  const list = await ClassesAPI.studentsByClass(test.value.classId);
  classStudents.value = (list || []).map(s => ({
    studentId: String(s.studentId),
    name: s.studentName || s.name,
    image: s.image || s.studentImage || null,
  }));
}

async function loadMarks() {
  const list = await TestsAPI.getMarks(routeId.value); // returns embedded marks array
  currentMarks.value = Array.isArray(list) ? list : (list?.data || []);
}

function mergeRows() {
  const markMap = new Map((currentMarks.value || []).map(m => [String(m.studentId), m]));
  rows.value = (classStudents.value || []).map(s => ({
    studentId: s.studentId,
    name: s.name,
    image: s.image,
    marks: markMap.get(String(s.studentId))?.marks ?? null,
    remark: markMap.get(String(s.studentId))?.remark ?? '',
  }));
}

async function reload() {
  await loadTest();
  await loadStudents();
  await loadMarks();
  mergeRows();
}

async function save() {
  saving.value = true;
  try {
    // Normalize numbers and clamp to [0, totalMarks]
    const max = Number(test.value?.totalMarks) || Infinity;
    const payload = rows.value.map(r => ({
      studentId: String(r.studentId),
      marks: Math.min(Math.max(Number(r.marks ?? 0), 0), max),
      remark: r.remark || ''
    }));

    await TestsAPI.saveMarks(routeId.value, payload); // updateData on tests.{marks}
    await loadMarks();
    mergeRows();
    notificationHandling('success','ළකුණු පද්ධතියට ඇතුලත් කරන ලදී')
  } finally {
    saving.value = false;
  }
}

onMounted(reload);
</script>
