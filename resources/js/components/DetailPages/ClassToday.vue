<template>

  <div class="mt-3 mb-4">
    <nav
        style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);"
        aria-label="breadcrumb"
    >
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
        <li class="breadcrumb-item"><a href="/today-classes">අද පංති</a></li>
        <li class="breadcrumb-item active" aria-current="page">අද {{  className || classId }}</li>
      </ol>
    </nav>
  </div>

  <div class="container-fluid py-3">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h5 class="mb-0">Today • {{ className || classId }}</h5>
        <small class="text-muted">Arrived: {{ arrivedCount }} / {{ filteredStudents.length }}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-primary" :disabled="loading" @click="refresh">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>
        <router-link class="btn btn-outline-secondary" to="/today-classes">
          <i class="fa fa-arrow-left me-1"></i> Back
        </router-link>
      </div>
    </div>

    <!-- Scan / Find + Search -->
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <!-- Scan / Manual ID -->
      <div class="input-group" style="max-width:380px;">
        <span class="input-group-text"><i class="fa fa-barcode"></i></span>
        <input
            class="form-control"
            type="text"
            inputmode="numeric"
            placeholder="Scan card / type Student ID"
            v-model="scanField"
            @keyup.enter="onManualFind"
        />
        <button class="btn btn-outline-primary" @click="onManualFind">Find</button>
      </div>

      <button
          class="btn"
          :class="scanArmed ? 'btn-warning' : 'btn-success'"
          @click="toggleScan"
          :title="scanArmed ? 'Scan is ON — type on the reader' : 'Click to arm scanner'"
      >
        <i :class="scanArmed ? 'fa fa-stop' : 'fa fa-wifi-strong'"></i>
        <span class="ms-1">{{ scanArmed ? 'Scan ON' : 'Arm Scanner' }}</span>
      </button>

      <span v-if="scanArmed" class="badge rounded-pill bg-100 text-dark border">
        Scanner armed • press <b>Enter</b> after scan
      </span>

      <!-- Search name or guardian mobile -->
      <div class="ms-auto search-box" style="min-width:240px; max-width: 380px;">
        <div class="position-relative">
          <input
              class="form-control search-input"
              type="search"
              placeholder="Search name or guardian phone (07… / 94…)"
              v-model="search"
              @input="onChangeSearch"
          />
          <span class="fas fa-search search-box-icon"></span>
          <button
              v-if="search"
              class="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y me-1"
              @click="clearSearch"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
        <small class="text-muted">Name (min {{ MIN_SEARCH_CHARS }}) or full phone</small>
      </div>
    </div>

    <!-- Session banner -->
    <div class="alert" :class="endedToday ? 'alert-success' : 'alert-info'">
      <i :class="endedToday ? 'fa fa-check-circle me-2' : 'fa fa-bell me-2'"></i>
      <span v-if="endedToday">
        Class ended for today at <b>{{ endedAtLocal }}</b>.
      </span>
      <span v-else>
        Class is active. When finished, click <b>End Class</b> to lock the day.
      </span>
      <button v-if="!endedToday" class="btn btn-sm btn-danger ms-2" :disabled="loading" @click="endClass">
        <i class="fa fa-flag-checkered me-1"></i> End Class
      </button>
    </div>

    <!-- List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
      <div class="mt-2 text-muted">Loading students…</div>
    </div>

    <div v-else class="row g-2">
      <div
          v-for="s in filteredStudents"
          :key="s.studentId"
          class="col-12 col-md-6 col-xl-4"
      >
        <div
            class="card shadow-sm border-200 h-100 student-card"
            :id="`stu-${s.studentId}`"
            :class="highlightId === s.studentId ? 'pulse' : ''"
        >
          <div class="card-body d-flex gap-3">
            <div
                class="rounded-circle bg-100 d-flex align-items-center justify-content-center overflow-hidden"
                style="width:46px;height:46px;"
            >
              <template v-if="s.studentImage">
                <img :src="s.studentImage" style="width:46px;height:46px;object-fit:cover;" alt="avatar"/>
              </template>
              <template v-else>
                <span class="text-700 fw-bold">{{ (s.studentName || 'S').charAt(0) }}</span>
              </template>
            </div>
            <div class="flex-grow-1">
              <div class="fw-700">{{ s.studentName || '—' }}</div>
              <div class="small text-muted">{{ s.studentId }}</div>
              <div class="mt-2">
                <span
                    class="badge"
                    :class="arrivedMap[s.studentId] ? 'bg-success' : 'bg-warning text-dark'">
                  {{ arrivedMap[s.studentId] ? `Arrived • ${arrivedMap[s.studentId].time}` : 'Not arrived' }}
                </span>
              </div>
            </div>
            <div class="text-end">
              <small class="text-700">{{ className || classId }}</small>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!filteredStudents.length && !loading" class="text-center text-muted py-5">
        <i class="fa fa-user-slash fa-2x mb-2"></i>
        <div class="fw-bold">No students matched</div>
        <div>Try a different name or phone.</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, inject, onMounted, onBeforeUnmount, ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import generalAxiosRequest from '../../composables/application/generalAxiosRequest';
import notificationHandling from '../../composables/application/notificationHandling';
import {sendClassEndNotice} from "../../composables/application/whatsappNotifier";

const route    = useRoute();
const baseURL  = inject('$baseURL');
const $loading = inject('$loading');

const MIN_SEARCH_CHARS = 2;
const DEBOUNCE_MS = 700;
const SCAN_GAP = 140; // ms

/* ---------- class id ---------- */
const props = defineProps({ classId: { type: String, required: false } });
const classId = computed(() => props.classId ?? route.params.classId);

/* ---------- state ---------- */
const loading    = ref(false);
const className  = ref('');
const students   = ref([]);    // [{studentId, studentName, studentImage, classId}]
const arrivedMap = ref({});    // { [studentId]: {time, doc} }
const endedToday = ref(false);
const endedAtIso = ref(null);

/* ---------- search / filter ---------- */
const search = ref('');
const searchTimerRef = ref(null);
const directIds = ref([]); // when searching via phone or scanned id => restrict to these
const highlightId = ref(null); // pulse highlight a found student for a moment

const filteredStudents = computed(() => {
  let list = students.value || [];

  // direct ids filter (phone or scan)
  if (directIds.value.length) {
    const set = new Set(directIds.value);
    list = list.filter(s => set.has(s.studentId));
  } else {
    // name filter
    const term = (search.value || '').trim().toLowerCase();
    if (term.length >= MIN_SEARCH_CHARS) {
      list = list.filter(s => (s.studentName || '').toLowerCase().includes(term));
    }
  }
  return list;
});

/* ---------- derived ---------- */
const arrivedCount = computed(() => Object.keys(arrivedMap.value).length);
const endedAtLocal = computed(() => endedAtIso.value
    ? new Date(endedAtIso.value).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'})
    : ''
);

/* ---------- helpers ---------- */
function rowsFrom(x){
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.value)) return x.value;
  if (Array.isArray(x?.data)) return x.data;
  return [];
}
async function apiPost(endpoint, dataObj){
  const payload = { url: `${baseURL}/api/v1/general-queries/${endpoint}`, data: JSON.stringify(dataObj) };
  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  return json_data?.value ?? json_data ?? {};
}
function digitsOnly(s){ return String(s||'').replace(/\D+/g,''); }
function normalizePhone(raw){
  const d = digitsOnly(raw);
  if (!d) return null;
  if (d.length === 10 && d.startsWith('0')) return d;                // 07xxxxxxxx
  if ((d.length === 11 || d.length === 12) && d.startsWith('94')) return d; // 94…
  return null;
}

/* ---------- data fetchers ---------- */
async function loadClassMeta(){
  const json = await apiPost('readData', {
    collection: 'classes',
    paginate: false,
    attr: 'classId',
    filter_array: JSON.stringify([classId.value]),
    project: JSON.stringify(['classId','className'])
  });
  const row = rowsFrom(json)[0];
  className.value = row?.className || classId.value;
}

async function loadStudents(){
  const json = await apiPost('readData', {
    collection: 'class_has_students',
    paginate: false,
    attr: 'classId',
    filter_array: JSON.stringify([classId.value]),
    project: JSON.stringify(['classId','studentId','studentName','studentImage','guardianMobile','studentMobile'])
  });
  students.value = rowsFrom(json);
}

async function loadTodayArrivals(){
  const tzStart = new Date(); tzStart.setHours(0,0,0,0);
  const tzEnd   = new Date(); tzEnd.setHours(23,59,59,999);
  const json = await apiPost('queryCollection', {
    collection: 'attendance',
    payload: JSON.stringify([
      { field:'classId',     operator:'=',  value: classId.value },
      { field:'marked_date', operator:'>=', value: tzStart.toISOString() },
      { field:'marked_date', operator:'<=', value: tzEnd.toISOString() },
    ])
  });
  const rows = rowsFrom(json);
  const map = {};
  for (const r of rows){
    const sid = r.studentId;
    const time = r.marked_at || new Date(r.marked_date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    if (!map[sid]) map[sid] = { time, doc:r };
  }
  arrivedMap.value = map;
}

async function loadSession(){
  // check if class already ended today
  const tzStart = new Date(); tzStart.setHours(0,0,0,0);
  const tzEnd   = new Date(); tzEnd.setHours(23,59,59,999);
  const json = await apiPost('queryCollection', {
    collection: 'class_sessions',
    payload: JSON.stringify([
      { field:'classId', operator:'=', value: classId.value },
      { field:'session_date', operator:'>=', value: tzStart.toISOString() },
      { field:'session_date', operator:'<=', value: tzEnd.toISOString() },
      { field:'ended', operator:'=', value: true },
    ])
  });
  const rows = rowsFrom(json);
  if (rows.length){
    endedToday.value = true;
    endedAtIso.value = rows[0]?.endedAt || rows[0]?.updated_at || rows[0]?.created_at || null;
  } else {
    endedToday.value = false;
    endedAtIso.value = null;
  }
}

/* ---------- end class ---------- */
async function endClass(){
  if (!window.confirm(`End class "${className.value || classId.value}" for today?`)) return;
  const loader = $loading?.show?.();
  try{
    const now = new Date();
    const payload = {
      classId: classId.value,
      session_date: now.toISOString(), // anchor today
      ended: true,
      endedAt: now.toISOString()
    };
    await apiPost('addData', {
      collection: 'class_sessions',
      data: JSON.stringify(payload)
    });
    endedToday.value = true;
    endedAtIso.value = payload.endedAt;

    endedToday.value = true;
    endedAtIso.value = payload.endedAt;

    // 🔔 send WhatsApp to all who arrived today
    const note = 'ස්තූතියි!';
    const sentCount = await notifyEndClassToArrived(note);


    notificationHandling('success','Class ended for today.');
  }catch(e){
    notificationHandling('error', e?.message || 'Failed to end class');
  }finally{
    loader?.hide?.();
  }
}



// pick guardian first, then fallback to student phone
function pickPhoneForStudent(studentRow){
  return (
      studentRow?.guardianMobile ||
      studentRow?.guardianMobile_2 ||
      studentRow?.studentMobile ||
      null
  );
}

function findStudentRow(studentId){
  return (students.value || []).find(s => String(s.studentId) === String(studentId));
}

// small pause between sends (to avoid hammering webhook)
const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function notifyEndClassToArrived(extraNote = ''){
  const ids = Object.keys(arrivedMap.value || {});
  if (!ids.length) return 0;

  const date    = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const endTime = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true });

  let sent = 0;
  for (const sid of ids){
    const row   = findStudentRow(sid);
    const phone = pickPhoneForStudent(row);
    if (!phone) continue;

    await sendClassEndNotice({
      to: phone,
      className: className.value || classId.value,
      date,
      endTime,
      extra: extraNote
    }).catch(()=>{ /* ignore single send errors */ });

    sent += 1;
    // gentle pacing (adjust if needed)
    await wait(150);
  }
  return sent;
}


/* ---------- search (name or guardian/student phone) ---------- */
async function findByGuardianOrStudentMobile(msisdn){
  const gJson = await apiPost('readDataAdvanced', {
    collection: 'class_has_students',
    filter_array: JSON.stringify([
      { attribute:'guardianMobile', condition:'=', value: msisdn },
      { attribute:'classId', condition:'=', value: classId.value }
    ]),
    condition_type: false,
    paginate: false,
    project: JSON.stringify(['studentId'])
  });
  const sJson = await apiPost('readDataAdvanced', {
    collection: 'class_has_students',
    filter_array: JSON.stringify([
      { attribute:'studentMobile', condition:'=', value: msisdn },
      { attribute:'classId', condition:'=', value: classId.value }
    ]),
    condition_type: false,
    paginate: false,
    project: JSON.stringify(['studentId'])
  });

  const ids = [...new Set([...rowsFrom(gJson), ...rowsFrom(sJson)]
      .map(r => r.studentId).filter(Boolean))];
  if (!ids.length){
    notificationHandling('error','No students matched that mobile number.');
    return;
  }
  directIds.value = ids;
  // highlight and scroll the first one
  if (ids[0]) highlightAndScroll(ids[0]);
}

function onChangeSearch(){
  if (searchTimerRef.value) clearTimeout(searchTimerRef.value);
  searchTimerRef.value = setTimeout(async () => {
    const term = (search.value || '').trim();

    // clear
    if (!term){
      directIds.value = [];
      return;
    }

    // phone route
    const maybePhone = normalizePhone(term);
    if (maybePhone){
      await findByGuardianOrStudentMobile(maybePhone);
      return;
    }

    // name route (local filter)
    directIds.value = []; // allow name filtering to operate on full list
  }, DEBOUNCE_MS);
}
function clearSearch(){
  if (searchTimerRef.value) clearTimeout(searchTimerRef.value);
  search.value = '';
  directIds.value = [];
}

/* ---------- scan / manual find (by Student ID) ---------- */
const scanArmed = ref(false);
const scanField = ref('');
let scanBuffer = '';
let lastTick = 0;
let scanIdle = null;

function toggleScan(){
  scanArmed.value = !scanArmed.value;
  scanBuffer = '';
  if (scanArmed.value){
    window.addEventListener('keydown', onKeyScan, true);
  }else{
    window.removeEventListener('keydown', onKeyScan, true);
  }
}
function cleanupScan(){
  window.removeEventListener('keydown', onKeyScan, true);
  scanArmed.value = false;
  scanBuffer = '';
  clearTimeout(scanIdle);
}
function onKeyScan(e){
  if (!scanArmed.value) return;
  const t = performance.now();
  if (!lastTick || t - lastTick > SCAN_GAP * 3) scanBuffer = '';
  lastTick = t;

  if (/^\d$/.test(e.key)){ scanBuffer += e.key; e.preventDefault(); e.stopPropagation(); }

  clearTimeout(scanIdle);
  scanIdle = setTimeout(() => {
    if (scanBuffer){ const final=scanBuffer; scanBuffer=''; handleScanned(final); }
  }, SCAN_GAP * 4);

  if (e.key === 'Enter'){
    e.preventDefault(); e.stopPropagation();
    clearTimeout(scanIdle);
    const final = scanBuffer; scanBuffer = '';
    if (final) handleScanned(final);
  }
}
async function handleScanned(rawDigits){
  const id = digitsOnly(rawDigits);
  if (!id){ notificationHandling('error','Invalid card/ID'); return; }
  directIds.value = [id];
  highlightAndScroll(id);
}
async function onManualFind(){
  const val = scanField.value.trim();
  if (!val) return;
  const id = digitsOnly(val);
  if (!id) { notificationHandling('error','Invalid student ID'); return; }
  directIds.value = [id];
  highlightAndScroll(id);
}

/* ---------- UX helpers ---------- */
function highlightAndScroll(id){
  nextTick(() => {
    const el = document.getElementById(`stu-${id}`);
    if (el){
      el.scrollIntoView({ behavior:'smooth', block:'center' });
      highlightId.value = id;
      setTimeout(() => (highlightId.value = null), 1600);
    }
  });
}

/* ---------- lifecycle ---------- */
async function refresh(){
  const loader = $loading?.show?.();
  loading.value = true;
  try{
    await Promise.all([loadClassMeta(), loadStudents(), loadTodayArrivals(), loadSession()]);
  }catch(e){
    notificationHandling('error', e?.message || 'Failed to load');
  }finally{
    loading.value = false;
    loader?.hide?.();
  }
}

onMounted(refresh);
onBeforeUnmount(() => { cleanupScan(); });
</script>

<style scoped>
.border-200{ border-color:#edf2f7; }
.text-700{ color:#475569; }
.bg-100{ background:#f8fafc; }

.alert-info{ background:#E6F6F9; border:1px solid #cfe8ee; color:#0b7285; }
.alert-success{ background:#ecfdf5; border:1px solid #bbf7d0; color:#065f46; }

.search-box .search-input { padding-left: 32px; }
.search-box .search-box-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color:#667085;
}

/* pulse highlight on scan/find */
.student-card.pulse { box-shadow: 0 0 0 0 rgba(37,99,235,.35); animation: pulse 1.2s ease-out 1; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(37,99,235,.45); transform: translateY(0); }
  60% { box-shadow: 0 0 0 14px rgba(37,99,235,0); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); transform: translateY(0); }
}
</style>
