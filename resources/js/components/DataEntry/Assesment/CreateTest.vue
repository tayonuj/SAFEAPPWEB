<template>
  <div class="mt-3 mb-4">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
        <li class="breadcrumb-item"><a href="/assessments">පුනරීක්ශණ විභාග</a></li>
        <li class="breadcrumb-item active" aria-current="page">අලුත් විභාගයක්</li>
      </ol>
    </nav>
  </div>

  <div class="container-fluid py-3">
    <div class="card">
      <div class="card-body">
        <form @submit.prevent="submit">
          <div class="row g-3">
            <div class="col-12 col-lg-5">
              <label class="form-label">Class</label>
              <select
                  v-model="form.classId"
                  class="form-select"
                  :disabled="classLocked"
                  required
              >
                <option value="" disabled>Select a class</option>
                <option
                    v-for="item in classItems"
                    :key="item.value"
                    :value="item.value"
                >
                  {{ item.text }}
                </option>
              </select>
              <small v-if="classLocked" class="text-muted">
                Class fixed: {{ form.classId }}
              </small>
            </div>

            <div class="col-12 col-lg-4">
              <label class="form-label">Title</label>
              <input
                  class="form-control"
                  v-model.trim="form.title"
                  placeholder="e.g. Term Test 1"
                  required
              />
            </div>

            <div class="col-6 col-lg-2">
              <label class="form-label">Total Marks</label>
              <input
                  class="form-control"
                  v-model.number="form.totalMarks"
                  type="number"
                  min="1"
                  required
              />
            </div>

            <div class="col-6 col-lg-3">
              <label class="form-label">Date</label>
              <input class="form-control" v-model="form.date" type="date" required />
            </div>
          </div>

          <div class="mt-4 d-flex gap-2">
            <button class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" />
              Create Test
            </button>
            <router-link
                class="btn btn-outline-secondary"
                :to="{ name: 'AssessmentsHome' }"
            >
              Cancel
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, inject, watch} from 'vue';
import { ClassesAPI, TestsAPI } from '../../../composables/application/assesment/api';

const router  = inject('$router', null);

// ---- route-prop pattern ----
const props = defineProps({
  classId: { type: String, required: false }
});
const routeId = computed(() => props.classId ?? '');

// ---- state ----
const classItems = ref([]);
const classLocked = ref(!!routeId.value);
const loading = ref(false);
const className = ref(null);
const form = ref({
  classId: routeId.value || '',
  title: '',
  totalMarks: 100,
  date: new Date().toISOString().slice(0, 10)
});

// ---- helpers ----
function pad2(n){ return String(n).padStart(2,'0'); }
function generateTestId() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const HH = pad2(d.getHours());
  const MM = pad2(d.getMinutes());
  const SS = pad2(d.getSeconds());
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TST-${yyyy}${mm}${dd}-${HH}${MM}${SS}-${rand}`;
}

// ---- load classes ----
async function loadClasses() {
  if (classLocked.value && form.value.classId) {
    classItems.value = [{ value: form.value.classId, text: `${form.value.classId}` }];
    return;
  }

  const list = await ClassesAPI.list();
  classItems.value = (list || []).map((c) => ({
    value: c.classId,
    rowText: c.className ,
    text: `${c.className || c.classId} (${c.classId})`,
  }));
}

// ---- submit ----
async function submit() {
  if (!form.value.classId) {
    alert('Please select a class');
    return;
  }

  loading.value = true;
  try {
    const testId = generateTestId(); // <-- create it here

    const payload = {
      testId:testId, // <-- send to API
      classId: String(form.value.classId),
      className: className.value,
      title: form.value.title.trim(),
      totalMarks: Number(form.value.totalMarks) || 0,
      date: new Date(form.value.date).toISOString()
      // marks: [] will be initialized server-side or by API layer
    };

    await TestsAPI.create(payload);



    if (router){
      // Navigate using the same testId we just created
      await router.push({ name: 'EnterMarks', params: { testId } });
    }else{

      window.location.href = `/assessments/${testId}/marks`;
    }
  } finally {
    loading.value = false;
  }
}

watch(
    () => form.value.classId,
    (newId) => {
      const selected = classItems.value.find(i => i.value === newId);
      className.value = selected?.rowText || '';
      // alert(className.value); // optional
    },
    { immediate: false } // set to true if you want it to run on first render
);

onMounted(loadClasses);
</script>
