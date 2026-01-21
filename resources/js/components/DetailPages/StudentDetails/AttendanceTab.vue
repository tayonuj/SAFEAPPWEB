<!-- ============================= -->
<!-- File: AttendanceTab.vue       -->
<!-- ============================= -->
<template>
  <div>
    <!-- LIST MODE -->
    <div v-if="mode==='classes'">
      <div class="d-flex align-items-center justify-content-between bg-100 border-200 rounded p-2 mb-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="mb-0">Student Classes </h6>
          <span class="badge bg-200 text-dark border">{{ classes.length }}</span>
        </div>
        <button class="btn btn-sm btn-primary" @click="openAddModal">
          <i class="fa fa-plus me-1"></i> නව පන්තියක් ඇතුලත් කරන්න
        </button>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm"></div>
        <span class="ms-2">Loading classes…</span>
      </div>
      <div v-else-if="error" class="text-center py-4 text-danger">{{ error }}</div>
      <div v-else>
        <div
            v-for="c in classes"
            :key="c._id || c.classId"
            class="list-group-item d-flex align-items-center justify-content-between"
        >
          <div>
            <div class="fw-semibold">{{ c.className || 'Unnamed class' }}</div>
            <div class="small text-muted" v-if="c.grade">{{ c.grade }}</div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-falcon-info" @click="openClass(c)">
              Open <i class="fa fa-chevron-right ms-1" />
            </button>
            <!-- optional: remove link later -->
          </div>
        </div>
        <div v-if="!classes.length" class="text-center text-muted py-4">
          No classes linked to this student yet.
        </div>
      </div>
    </div>

    <!-- ATTENDANCE MODE -->
    <div v-else>
      <div class="d-flex align-items-center justify-content-between bg-100 border-200 rounded p-2 mb-2">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="backToClasses">
            <i class="fa fa-arrow-left" />
          </button>
          <div>
            <div class="fw-semibold">{{ selectedClass?.className }}</div>
            <div class="small text-muted" v-if="selectedClass?.grade">{{ selectedClass.grade }}</div>
          </div>
        </div>
        <span class="badge bg-200 text-dark border">{{ attendance.length }} records</span>
      </div>

      <div v-if="loadingAttendance" class="text-center py-4">
        <div class="spinner-border spinner-border-sm"></div>
        <span class="ms-2">Loading attendance…</span>
      </div>
      <div v-else-if="error" class="text-center py-4 text-danger">{{ error }}</div>
      <div v-else>
        <template v-if="sections.length">
          <div v-for="sec in sections" :key="sec.title" class="mb-3">
            <div class="fw-bold mb-1">{{ sec.title }}</div>
            <div class="list-group shadow-none">
              <div
                  v-for="item in sec.data"
                  :key="item._id || item.marked_at"
                  class="list-group-item d-flex align-items-center justify-content-between"
              >
                <div>
                  <div class="fw-semibold">
                    {{ pretty(item.marked_date) || pretty(item.created_at) || item.marked_at || '—' }}
                  </div>
                  <div class="small text-muted">Operator: {{ item.operator || '—' }}</div>
                </div>
                <i class="fa fa-check-circle text-success"></i>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="text-center text-muted py-4">No attendance records for this class.</div>
      </div>
    </div>

    <!-- ADD CLASS MODAL -->
    <transition name="fade">
      <div v-if="addModal.open" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="mb-0">Student to class link</h6>
            <button class="btn btn-sm btn-link" @click="closeAddModal"><i class="fa fa-times"></i></button>
          </div>
          <p class="small text-muted mb-3">
            මේ ශිෂ්‍යයා වෙනත් පන්තියකට එකතු කරන්න. පහළ ලැයිස්තුවෙන් පන්තිය තෝරන්න.
          </p>

          <div v-if="addModal.loading" class="text-center py-3">
            <div class="spinner-border spinner-border-sm"></div>
            <span class="ms-2">Classes loading…</span>
          </div>
          <div v-else>
            <label class="form-label">පන්තිය තෝරන්න</label>
            <select v-model="addModal.selectedClassId" class="form-select mb-3">
              <option value="">—</option>
              <option
                  v-for="c in addModal.allClasses"
                  :key="c._id || c.classId"
                  :value="c.classId"
              >
                {{ c.className }} ({{ c.grade }})
              </option>
            </select>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-2">
            <button class="btn btn-outline-secondary btn-sm" @click="closeAddModal">Cancel</button>
            <button class="btn btn-primary btn-sm" :disabled="addModal.saving || !addModal.selectedClassId" @click="saveNewLink">
              <span v-if="!addModal.saving">Add</span>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../composables/application/notificationHandling";

const props = defineProps({
  studentId: { type: String, required: true }
});
const baseURL = inject('$baseURL');

const mode = ref('classes');
const classes = ref([]);              // current student's classes (class_has_students)
const attendance = ref([]);
const selectedClass = ref(null);

const loading = ref(true);
const loadingAttendance = ref(false);
const error = ref('');

// add-modal state
const addModal = ref({
  open: false,
  loading: false,
  saving: false,
  allClasses: [],
  selectedClassId: ''
});

const pretty = (v) => {
  try {
    const d = new Date(v?.$date || v);
    return d.toLocaleString();
  } catch (_) {
    return '—';
  }
};

async function loadClasses() {
  loading.value = true;
  error.value = '';
  try {
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readDataAdvanced`,
      data: JSON.stringify({
        collection: 'class_has_students',
        filter_array: JSON.stringify([
          { attribute: 'studentId', condition: '=', value: props.studentId }
        ]),
        condition_type: false,
        project: JSON.stringify(['classId', 'className', 'grade', 'updated_at'])
      })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const arr = Array.isArray(json_data?.value) ? json_data.value : (Array.isArray(json_data) ? json_data : []);
    arr.sort((a, b) => new Date(b?.updated_at || 0) - new Date(a?.updated_at || 0));
    classes.value = arr;
  } catch (e) {
    error.value = 'Failed to load classes';
  } finally {
    loading.value = false;
  }
}

async function openClass(c) {
  mode.value = 'attendance';
  selectedClass.value = c;
  loadingAttendance.value = true;
  error.value = '';
  attendance.value = [];
  try {
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readDataAdvanced`,
      data: JSON.stringify({
        collection: 'attendance',
        filter_array: JSON.stringify([
          { attribute: 'studentId', condition: '=', value: props.studentId },
          { attribute: 'classId', condition: '=', value: c.classId }
        ]),
        condition_type: false,
        project: JSON.stringify([
          'classId',
          'className',
          'studentId',
          'marked_at',
          'marked_date',
          'operator',
          'created_at',
          '_id'
        ])
      })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const list = Array.isArray(json_data?.value)
        ? json_data.value
        : (Array.isArray(json_data) ? json_data : []);
    list.sort(
        (a, b) =>
            new Date(b?.marked_date?.$date || b?.created_at) -
            new Date(a?.marked_date?.$date || a?.created_at)
    );
    attendance.value = list;
  } catch (e) {
    error.value = 'Failed to load attendance';
  } finally {
    loadingAttendance.value = false;
  }
}

function backToClasses() {
  mode.value = 'classes';
  selectedClass.value = null;
  attendance.value = [];
  error.value = '';
}

// group by date
const sections = computed(() => {
  const map = new Map();
  attendance.value.forEach((r) => {
    const key = new Date(r?.marked_date?.$date || r?.created_at).toISOString().slice(0, 10);
    (map.get(key) || map.set(key, []).get(key)).push(r);
  });
  const out = Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  out.sort((A, B) => new Date(B.title) - new Date(A.title));
  out.forEach((s) =>
      s.data.sort(
          (a, b) =>
              new Date(b?.marked_date?.$date || b?.created_at) -
              new Date(a?.marked_date?.$date || a?.created_at)
      )
  );
  return out;
});

// ==== ADD CLASS FLOW ====

function openAddModal() {
  addModal.value.open = true;
  addModal.value.selectedClassId = '';
  loadAllClassesForModal();
}

function closeAddModal() {
  addModal.value.open = false;
}

async function loadAllClassesForModal() {
  addModal.value.loading = true;
  try {
    // load ALL classes (you can filter by active later)
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({
        collection: 'classes',
        attr: 'classId',
        filter_array: JSON.stringify([]) // nothing -> all
      })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const arr = Array.isArray(json_data?.value) ? json_data.value : [];
    // filter out classes that student already has
    const existingIds = new Set(classes.value.map((c) => String(c.classId)));
    addModal.value.allClasses = arr.filter((c) => !existingIds.has(String(c.classId)));
  } catch (e) {
    // non-fatal
    addModal.value.allClasses = [];
  } finally {
    addModal.value.loading = false;
  }
}

async function saveNewLink() {
  if (!addModal.value.selectedClassId) return;
  addModal.value.saving = true;
  try {
    // 1) get class object
    const clsPayload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({
        collection: 'classes',
        attr: 'classId',
        filter_array: JSON.stringify([addModal.value.selectedClassId])
      })
    };
    const { json_data: clsRes } = await generalAxiosRequest('curl-requests/post', clsPayload, false);
    const cls = Array.isArray(clsRes?.value) && clsRes.value.length ? clsRes.value[0] : null;
    if (!cls) {
      notificationHandling('error', 'Class not found');
      return;
    }

    // 2) get student object (to get _id, name, guardianMobile…)
    const stuPayload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({
        collection: 'students',
        attr: 'studentId',
        filter_array: JSON.stringify([props.studentId])
      })
    };
    const { json_data: stuRes } = await generalAxiosRequest('curl-requests/post', stuPayload, false);
    const stu = Array.isArray(stuRes?.value) && stuRes.value.length ? stuRes.value[0] : null;
    if (!stu) {
      notificationHandling('error', 'Student not found');
      return;
    }

    // 3) build link record (same shape you used in class page)
    const newRow = {
      classId: cls.classId,
      classOBJId: cls._id,
      className: cls.className,
      grade: cls.grade,
      studentId: stu.studentId,
      studentOBJId: stu._id,
      studentName: stu.name || 'Student',
      guardianMobile: stu.guardianMobile || '',
      studentImage: stu.image || ''
    };

    // 4) save
    const savePayload = {
      url: `${baseURL}/api/v1/general-queries/addData`,
      data: JSON.stringify({
        collection: 'class_has_students',
        data: JSON.stringify(newRow)
      })
    };
    const saved = await generalAxiosRequest('curl-requests/post', savePayload, false);
    if (saved) {
      notificationHandling('success', 'පන්ති සම්බන්ධ කිරීම සාර්ථකයි!');
      // refresh list
      await loadClasses();
      closeAddModal();
    } else {
      notificationHandling('error', 'Failed to create link');
    }
  } catch (e) {
    notificationHandling('error', e?.message || 'Failed to create link');
  } finally {
    addModal.value.saving = false;
  }
}

onMounted(loadClasses);
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1080;
}
.modal-card {
  width: min(560px,92vw);
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0,0,0,.15);
  padding: 16px 18px;
}
.fade-enter-active,
.fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
