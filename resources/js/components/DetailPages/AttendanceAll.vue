<template>
  <div class="container-fluid py-3">
    <!-- Breadcrumb -->
    <div class="mt-1 mb-3">
      <nav
          style="--falcon-breadcrumb-divider:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&quot;)"
          aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
          <li class="breadcrumb-item active" aria-current="page">Attendance & Payments (All)</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>
        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h5 class="mb-0 text-primary position-relative">
              <span class="bg-201 dark__bg-1100 pe-3"><b>Attendance & Payments</b></span>
              <span class="border position-absolute top-50 translate-middle-y w-75 z-n1"></span>
            </h5>
            <small class="text-muted ms-1">
              <b>{{ titleMonth }}</b> • {{ selectedClassName }}
            </small>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary" @click="goBack">
              <i class="fa fa-arrow-left me-1"></i> Back
            </button>
            <button class="btn btn-outline-primary" :disabled="initialLoading" @click="onRefresh">
              <i class="fa fa-rotate me-1"></i> Refresh
            </button>
          </div>
        </div>

        <!-- Scan / Find row -->
        <div class="mt-3 d-flex align-items-center gap-2 flex-wrap">
          <div class="input-group" style="max-width:380px;">
            <span class="input-group-text"><i class="fa fa-barcode"></i></span>
            <input
                class="form-control"
                type="text"
                inputmode="numeric"
                placeholder="Scan ID/Type ID"
                v-model="scanField"
                @keyup.enter="onManualFind"
            />
            <button class="btn btn-outline-primary" @click="onManualFind">Find</button>
          </div>

          <button
              class="btn"
              :class="scanArmed ? 'btn-warning' : 'btn-success'"
              @click="toggleScan"
              :title="scanArmed ? 'Scan is ON — type on the reader' : 'Click to scanner'"
          >
            <i :class="scanArmed ? 'fa fa-stop' : 'fa fa-wifi-strong'"></i>
            <span class="ms-1">{{ scanArmed ? 'Scan ON' : 'ID Scan' }}</span>
          </button>

          <span v-if="scanArmed" class="badge rounded-pill bg-100 text-dark border">
            Scanner armed • press <b>Enter</b> after scan
          </span>

          <span v-if="directFilterActive" class="badge rounded-pill bg-info text-dark ms-auto">
            Filter: {{ directFilterLabel }}
            <button class="btn btn-sm btn-link text-dark ms-1 p-0" @click="clearDirectFilter" title="Clear filter">
              <i class="fa fa-times"></i>
            </button>
          </span>
        </div>

        <!-- Filters -->
        <div class="mt-3">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <!-- Month switcher -->
            <button class="btn btn-sm btn-quiet" @click="changeMonth(-1)" :disabled="initialLoading">
              <i class="fa fa-chevron-left text-primary"></i>
            </button>
            <div class="badge rounded-pill bg-200 text-dark px-3 py-2">{{ titleMonth }}</div>
            <button class="btn btn-sm btn-quiet" @click="changeMonth(1)" :disabled="initialLoading">
              <i class="fa fa-chevron-right text-primary"></i>
            </button>

            <!-- Class dropdown -->
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
                {{ selectedClassName }}
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click.prevent="onSelectClass('ALL')">All Classes</a></li>
                <li><hr class="dropdown-divider"></li>
                <li v-for="c in classes" :key="c.classId">
                  <a class="dropdown-item" href="#" @click.prevent="onSelectClass(c.classId)">
                    {{ c.className }} <span class="text-700">({{ c.classId }})</span>
                  </a>
                </li>
              </ul>
            </div>

            <!-- Chips -->
            <div class="ms-1 d-flex flex-wrap gap-2">
              <button
                  class="btn btn-sm"
                  :class="chip==='ALL' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="setChip('ALL')"
              >All</button>
              <button
                  class="btn btn-sm"
                  :class="chip==='PAID' ? 'btn-success' : 'btn-outline-success'"
                  @click="setChip('PAID')"
              >Paid</button>
              <button
                  class="btn btn-sm"
                  :class="chip==='UNPAID' ? 'btn-warning' : 'btn-outline-warning'"
                  @click="setChip('UNPAID')"
              >Unpaid</button>
            </div>

            <!-- Search by NAME or GUARDIAN MOBILE -->
            <div class="ms-auto search-box" style="min-width:240px; max-width: 380px;">
              <div class="position-relative">
                <input
                    class="form-control search-input"
                    type="search"
                    placeholder="Search by name or guardian mobile"
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
              <small class="text-muted">Name (min {{ MIN_SEARCH_CHARS }}) or phone like 07… / 94…</small>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="row mt-3 g-3">
          <div class="col-12 col-md-4">
            <div class="card border-200">
              <div class="card-body py-2 d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-700 small">Records in view</div>
                  <div class="fs-5 fw-bold">{{ filtered.length }}</div>
                </div>
                <i class="fa fa-list text-primary fs-4"></i>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-200">
              <div class="card-body py-2 d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-700 small">Paid (this month)</div>
                  <div class="fs-5 fw-bold">{{ paidCount }}</div>
                </div>
                <i class="fa fa-check-circle text-success fs-4"></i>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-200">
              <div class="card-body py-2 d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-700 small">Total collected</div>
                  <div class="fs-5 fw-bold">{{ totalCollected.toLocaleString() }} /=</div>
                </div>
                <i class="fa fa-coins text-info fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- List / Empty / Loader -->
        <div class="mt-3">
          <div v-if="initialLoading" class="py-5 text-center">
            <div class="spinner-border" role="status"></div>
            <div class="mt-2 text-muted">Loading attendance…</div>
          </div>

          <template v-else>
            <div v-if="!filtered.length" class="py-5 text-center text-muted">
              <i class="fa fa-calendar-xmark fa-2x mb-2"></i>
              <div class="fw-bold">No attendance</div>
              <div>Try a different month or class.</div>
              <div v-if="error" class="text-danger mt-2">{{ error }}</div>
            </div>

            <div class="row g-2">
              <div v-for="it in filtered" :key="it._key" class="col-12 col-md-6 col-lg-4">
                <div class="card shadow-sm border-200 h-100">
                  <div class="card-body d-flex gap-2">
                    <div
                        class="rounded-circle bg-200 d-flex align-items-center justify-content-center overflow-hidden"
                        style="width:46px;height:46px;"
                    >
                      <template v-if="it.studentImage">
                        <img :src="it.studentImage" style="width:46px;height:46px;object-fit:cover;" alt="avatar"/>
                      </template>
                      <template v-else>
                        <span class="text-700 fw-bold">{{ (it.studentName || 'S').charAt(0) }}</span>
                      </template>
                    </div>

                    <div class="flex-grow-1">
                      <div class="fw-semibold">{{ it.studentName || '—' }}</div>
                      <div class="small text-muted">
                        {{ it.className || it.classId || '—' }} •
                        <span class="text-700">{{ it.when }}</span>
                      </div>
                      <div class="mt-2 d-flex align-items-center gap-2">
                        <span
                            class="badge"
                            :class="isPaid(it) ? 'bg-success' : 'bg-warning text-dark'"
                            title="Payment status for month"
                        >
                          {{ isPaid(it) ? `Paid${paidAmount(it) ? ` • ${paidAmount(it)}` : ''}` : 'Unpaid' }}
                        </span>
                      </div>
                    </div>

                    <div class="d-flex flex-column align-items-end">
                      <button
                          class="btn btn-sm btn-link text-danger"
                          :disabled="deleting[it._oid]"
                          @click="confirmDelete(it)"
                          title="Delete this record"
                      >
                        <span v-if="deleting[it._oid]" class="spinner-border spinner-border-sm"></span>
                        <span v-else><i class="fa fa-trash"></i></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No pagination anymore -->
            <div class="text-center text-muted mt-3" v-if="filtered.length">
              You’re all caught up 🎉
            </div>
          </template>
        </div>
      </CardBody>
    </Card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, onBeforeUnmount } from 'vue';
import Card from "../bootstrap/Card.vue";
import CardBody from "../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";
import notificationHandling from "../../composables/application/notificationHandling";
import { convertAnyDateTime } from "../../composables/application/timeconversion";

const $loading = inject('$loading');
const baseURL  = inject('$baseURL');
const router   = inject('$router', null);

// ---- constants ----
const DEBOUNCE_MS = 800;
const MIN_SEARCH_CHARS = 2;
const SCAN_GAP = 140; // ms

// ---- state ----
const classes = ref([]);              // [{classId,className}]
const classIds = ref([]);             // all class IDs
const selectedClassId = ref('ALL');

const monthCursor = ref(new Date());  // JS Date (we only need month/year)
const search = ref('');
const q = ref('');
const chip = ref('ALL');              // ALL | PAID | UNPAID

const initialLoading = ref(false);
const error = ref('');
const deleting = reactive({});        // { [oid]: true }

const itemsRaw = ref([]);             // attendance rows (server)
const paidMap = reactive({});         // {'studentId|classId': {amount,paid}}

// direct filter (phone/ID search)
const directFilterActive = ref(false);
const directFilterLabel  = ref('');
let directStudentIds = [];

// scanner
const scanArmed = ref(false);
const scanField = ref('');
let scanBuffer = '';
let lastTick = 0;
let scanIdle = null;

// ---- helpers ----
const titleMonth = computed(() =>
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(monthCursor.value)
);
const selectedClassName = computed(() => {
  if (selectedClassId.value === 'ALL') return 'All Classes';
  const c = classes.value.find(x => x.classId === selectedClassId.value);
  return c ? c.className : selectedClassId.value;
});
const monthName = computed(() => new Intl.DateTimeFormat('en-US', { month: 'long' }).format(monthCursor.value));
const monthStart = computed(() => { const d = new Date(monthCursor.value); d.setDate(1); d.setHours(0,0,0,0); return d; });
const monthEnd   = computed(() => { const d = new Date(monthCursor.value); d.setMonth(d.getMonth()+1); d.setDate(0); d.setHours(23,59,59,999); return d; });

function key(studentId, classId){ return `${studentId}|${classId}`; }
function isPaid(row){ return !!paidMap[key(row.studentId, row.classId)]; }
function paidAmount(row){ const k = key(row.studentId, row.classId); return paidMap[k]?.amount ?? null; }

function mapRow(r){
  const oid = r?._id?.$oid || r?._id || `${r.classId}-${r.studentId}-${Math.random()}`;
  const dateISO = r?.marked_date?.$date || r?.marked_date || r?.updated_at || r?.created_at || '';
  const d = convertAnyDateTime(dateISO, 'MMM D');
  const t = r?.marked_at || convertAnyDateTime(dateISO, 'HH:mm');
  return { ...r, _oid: oid, _key: oid, when: [d, t].filter(Boolean).join(' • ') };
}

// Apply: month (server already), plus class, direct ID filter, name search, chip
const filtered = computed(() => {
  let arr = (itemsRaw.value || []);

  // class filter (client)
  if (selectedClassId.value !== 'ALL') {
    arr = arr.filter(it => it.classId === selectedClassId.value);
  }

  // direct studentId filter (from phone/ID search)
  if (directFilterActive.value && directStudentIds.length) {
    const set = new Set(directStudentIds);
    arr = arr.filter(it => set.has(it.studentId));
  }

  // name search (client)
  const term = (q.value || '').trim().toLowerCase();
  if (term.length >= MIN_SEARCH_CHARS) {
    arr = arr.filter(it => String(it.studentName || '').toLowerCase().includes(term));
  }

  // paid/unpaid chips
  if (chip.value === 'PAID')   arr = arr.filter(isPaid);
  if (chip.value === 'UNPAID') arr = arr.filter(r => !isPaid(r));

  return arr.map(mapRow);
});

// summary
const paidCount = computed(() => filtered.value.filter(isPaid).length);
const totalCollected = computed(() =>
    filtered.value.reduce((s, r) => s + (isPaid(r) ? (paidAmount(r) || 0) : 0), 0)
);

// ---- api helpers ----
async function apiPost(endpoint, dataObj){
  const payload = { url: `${baseURL}/api/v1/general-queries/${endpoint}`, data: JSON.stringify(dataObj) };
  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  return json_data.value;
}
function rowsFrom(json){
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.value)) return json.value;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

// ---- scope: load all classes ----
async function loadAllClasses(){
  const json = await apiPost('readData', {
    collection: 'classes',
    paginate: false,
    project: JSON.stringify(['classId', 'className'])
  });
  const rows = rowsFrom(json);
  classes.value = rows.map(r => ({ classId: r.classId, className: r.className || r.classId }));
  classIds.value = classes.value.map(c => c.classId);
}

// ---- payment map (this month, class scope) ----
async function loadPaymentMap(){
  const ids = selectedClassId.value === 'ALL' ? classIds.value : [selectedClassId.value];
  // reset
  Object.keys(paidMap).forEach(k => delete paidMap[k]);

  // prefer advanced
  let json = await apiPost('readDataAdvanced', {
    collection: 'class_fees',
    filter_array: JSON.stringify([
      { attribute:'month', condition:'=', value: monthName.value },
      { attribute:'paid',  condition:'=', value: true },
      { attribute:'classId', condition:'in', value: ids }
    ]),
    condition_type: false,
    paginate: false,
    project: JSON.stringify(['studentId','classId','paid','month','amount'])
  }).catch(()=>null);

  // fallback by month only
  if (!json){
    json = await apiPost('queryCollection', {
      collection: 'class_fees',
      payload: JSON.stringify([{ field:'month', operator:'=', value: monthName.value, ignoreDates: true }])
    });
  }

  const rows = rowsFrom(json).filter(r => r?.paid && (selectedClassId.value==='ALL' ? true : ids.includes(r.classId)));
  rows.forEach(r => { paidMap[key(r.studentId, r.classId)] = { paid: true, amount: Number(r.amount)||0 }; });
}

// ---- attendance fetch (NO pagination): month range via queryCollection ----
async function fetchAttendanceForMonth(){
  const tzStart = new Date(monthStart.value);
  const tzEnd   = new Date(monthEnd.value);

  const payload = {
    url: `${baseURL}/api/v1/general-queries/queryCollection`,
    data: JSON.stringify({
      collection: 'attendance',
      payload: JSON.stringify([
        { field:'marked_date', operator: '>=', value: tzStart.toISOString() },
        { field:'marked_date', operator: '<=', value: tzEnd.toISOString() }
      ])
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  const rows = rowsFrom(json_data);
  itemsRaw.value = rows;
}

// direct fetch by studentId list (NO pagination): we already have month data -> just activate filter
async function fetchAttendanceByStudentIds(studentIds){
  // We already loaded the whole month via fetchAttendanceForMonth().
  // Just ensure the direct filter is active; filtering happens in computed().
  activateDirectFilter(`Student IDs (${studentIds.length})`, studentIds);
}

// ---- reload whole month (payments + month attendance) ----
async function reloadMonth(){
  const loader = $loading?.show?.();
  initialLoading.value = true;
  error.value = '';
  try{
    await loadPaymentMap();
    await fetchAttendanceForMonth();   // always pulls the full month set (no paging)
    // If a direct filter is active, the computed 'filtered' will apply it.
  }catch(e){
    error.value = e?.message || 'Failed to load attendance';
  }finally{
    initialLoading.value = false;
    loader?.hide?.();
  }
}

// ---- navigation ----
function goBack(){
  history.length > 1 ? history.back() : (router ? router.push('/attendance') : (location.href='/attendance'));
}

// ---- filters ----
function changeMonth(delta){
  const d = new Date(monthCursor.value);
  d.setMonth(d.getMonth()+delta);
  monthCursor.value = d;
  reloadMonth();
}
function onSelectClass(cid){
  selectedClassId.value = cid;
  reloadMonth();
}
function setChip(key){ chip.value = key; }

// ---------------------------
// Name OR Phone in one search
// ---------------------------
let searchTimer = null;

function digitsOnly(s){ return String(s||'').replace(/\D+/g,''); }
function normalizePhone(raw){
  const d = digitsOnly(raw);
  if (!d) return null;
  if (d.length === 10 && d.startsWith('0')) return d;           // 07xxxxxxxx
  if ((d.length === 11 || d.length === 12) && d.startsWith('94')) return d; // 94…
  return null;
}

async function findByGuardianOrStudentMobile(msisdn){
  const ids = selectedClassId.value === 'ALL' ? classIds.value : [selectedClassId.value];

  const gJson = await apiPost('readDataAdvanced', {
    collection: 'class_has_students',
    filter_array: JSON.stringify([
      { attribute:'guardianMobile', condition:'=', value: msisdn },
      { attribute:'classId', condition:'in', value: ids }
    ]),
    condition_type: false,
    paginate: false,
    project: JSON.stringify(['studentId','classId'])
  });
  const sJson = await apiPost('readDataAdvanced', {
    collection: 'class_has_students',
    filter_array: JSON.stringify([
      { attribute:'studentMobile', condition:'=', value: msisdn },
      { attribute:'classId', condition:'in', value: ids }
    ]),
    condition_type: false,
    paginate: false,
    project: JSON.stringify(['studentId','classId'])
  });

  const rows = [...rowsFrom(gJson), ...rowsFrom(sJson)];
  const studentIds = [...new Set(rows.map(r => r.studentId).filter(Boolean))];
  if (!studentIds.length){
    notificationHandling('error','No students matched that mobile number.');
    return;
  }

  // Ensure month data is present; then activate filter
  if (!itemsRaw.value.length) await fetchAttendanceForMonth();
  activateDirectFilter(`Mobile ${msisdn}`, studentIds);
}

function activateDirectFilter(label, ids){
  directFilterActive.value = true;
  directFilterLabel.value = label;
  directStudentIds = Array.from(new Set(ids));
}
function clearDirectFilter(){
  directFilterActive.value = false;
  directFilterLabel.value = '';
  directStudentIds = [];
}

// Debounced input handler: decide phone vs name
function onChangeSearch(){
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const term = (search.value || '').trim();

    // empty => clear and reload month (no direct filter, no name filter)
    if (!term){
      q.value = '';
      if (directFilterActive.value) clearDirectFilter();
      await reloadMonth();
      return;
    }

    // phone? => guardian/student mobile search via direct filter
    const maybePhone = normalizePhone(term);
    if (maybePhone){
      q.value = '';
      await findByGuardianOrStudentMobile(maybePhone);
      return;
    }

    // name search is client-side now (no pagination)
    if (directFilterActive.value) clearDirectFilter();
    if (term.length >= MIN_SEARCH_CHARS){
      q.value = term;               // triggers computed filter
    }
  }, DEBOUNCE_MS);
}

async function clearSearch(){
  if (searchTimer) clearTimeout(searchTimer);
  search.value=''; q.value='';
  if (directFilterActive.value) clearDirectFilter();
  await reloadMonth();
}

// ---- delete ----
function confirmDelete(item){
  const when = item?.when || '';
  const msg = `${item?.studentName || 'Student'} • ${item?.className || item?.classId || ''}${when ? '\n' + when : ''}`;
  if (!window.confirm(`Delete this attendance?\n\n${msg}`)) return;
  performDelete(item);
}
async function performDelete(item){
  const oid = item?._id?.$oid || item?._id;
  if (!oid) return notificationHandling('error','Missing record ID');
  deleting[oid] = true;
  try{
    const json = await apiPost('deleteRecord', { collection:'attendance', id: oid });
    const msg = (json?.data ?? json);
    if (typeof msg === 'string' && msg.toLowerCase().includes('error')) throw new Error(msg);
    itemsRaw.value = itemsRaw.value.filter(it => (it?._id?.$oid || it?._id) !== oid);
  }catch(e){
    notificationHandling('error', e?.message || 'Delete failed');
  }finally{
    delete deleting[oid];
  }
}

// =========================
//     Scan / Manual Find
// =========================
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
  const phone = normalizePhone(rawDigits);
  if (phone){ await findByGuardianOrStudentMobile(phone); return; }
  await filterByStudentId(rawDigits);
}
function digitsOnlyForScan(s){ return String(s||'').replace(/\D+/g,''); }

async function onManualFind(){
  const val = scanField.value.trim();
  if (!val) return;
  await filterByStudentId(digitsOnlyForScan(val));
}
async function filterByStudentId(id){
  const clean = digitsOnlyForScan(id);
  if (!clean){ notificationHandling('error','Invalid student ID.'); return; }
  // Ensure month data is present; then activate filter
  if (!itemsRaw.value.length) await fetchAttendanceForMonth();
  activateDirectFilter(`Student ID ${clean}`, [clean]);
}

// ---- lifecycle ----
onMounted(async () => {
  const loader = $loading?.show?.();
  try{
    await loadAllClasses();
    await reloadMonth();
  }finally{
    loader?.hide?.();
  }
});
onBeforeUnmount(() => { cleanupScan(); });
</script>

<style scoped>
.bg-201 { background: var(--falcon-body-bg,#fff); }
.btn-quiet{ background: #E6F6F9; border: 1px solid #cfe8ee; }

.search-box .search-input { padding-left: 32px; }
.search-box .search-box-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color:#667085;
}

.card.border-200{ border-color:#edf2f7; }
.text-700{ color:#344054; }
</style>
