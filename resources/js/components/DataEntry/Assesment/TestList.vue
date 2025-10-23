<template>
  <div class="container-fluid py-3">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
            <li class="breadcrumb-item active" aria-current="page">පුනරීක්ශණ විභාග</li>
          </ol>
        </nav>
<!--        <h5 class="mb-0">පුනරීක්ශණ විභාග</h5>-->
<!--        <small class="text-muted">පන්තියේ නමෙන් විභාග සොයන්න</small>-->
      </div>
      <div class="d-flex gap-2">
        <router-link class="btn btn-primary" to="/assessments/create">
          <i class="fa fa-plus me-1"/> අලුත් විභාගයක්
        </router-link>
      </div>
    </div>

    <!-- Class Picker -->
    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-6">
        <label class="form-label">Class</label>
        <select v-model="classId" class="form-select" required>
          <option value="" disabled>Class එක තෝරන්න</option>
          <option v-for="item in classItems" :key="item.value" :value="item.value">
            {{ item.text }}
          </option>
        </select>
        <div class="form-text">
          <span v-if="loading">
            <span class="spinner-border spinner-border-sm me-1"></span>Loading…
          </span>
          <span v-else-if="classId && tests.length === 0">No tests found for this class.</span>
          <span v-else>&nbsp;</span>
        </div>
      </div>
    </div>

    <div v-if="!classId" class="alert alert-info">
      කරුණාකර පන්තියක් තෝරන්න.
    </div>

    <div class="card" v-if="classId && tests.length">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead class="table-light">
            <tr>
              <th style="width: 160px">දිනය</th>
              <th>මාතෘකාව</th>
              <th style="width: 120px">එකතුව</th>
              <th style="width: 140px">සිසුන්</th>
              <th style="width: 120px"></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="t in tests" :key="t.testId || t._id?.$oid || t._id">
              <td>{{ convertAnyDateTime(t.date) }}</td>
              <td>{{ t.title }}</td>
              <td>{{ t.totalMarks }}</td>
              <td>
                  <span class="badge bg-100 text-dark border">
                    {{ Array.isArray(t.marks) ? t.marks.length : 0 }}
                  </span>
              </td>
              <td class="text-end">
                <router-link
                    class="btn btn-sm btn-outline-success"
                    :to="{ name: 'EnterMarks', params: { testId: (t.testId || t._id?.$oid || t._id) } }"
                >
                  ලකුණු ඇතුලත් කරන්න
                </router-link>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ClassesAPI, TestsAPI } from '../../../composables/application/assesment/api';
import {convertAnyDateTime} from "../../../composables/application/timeconversion";

const classId = ref('');
const classItems = ref([]);
const tests = ref([]);
const loading = ref(false);

const d = (v) => (v ? new Date(v).toLocaleDateString('en-LK') : '—');

async function loadClasses() {
  const list = await ClassesAPI.list();
  classItems.value = (list || []).map(c => ({
    value: c.classId,
    text: `${c.className || c.classId} (${c.classId})`
  }));
}

async function loadTests() {
  if (!classId.value) { tests.value = []; return; }
  loading.value = true;
  try {
    tests.value = await TestsAPI.listByClass(classId.value);
  } finally {
    loading.value = false;
  }
}

// auto-load on dropdown change
watch(classId, () => {
  loadTests();
});

onMounted(async () => {
  await loadClasses();
  if (classId.value) await loadTests(); // if preset via route/prop later
});
</script>
