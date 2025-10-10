<!-- components/Attendance/AttendanceMarking.vue -->
<template>
  <div class="container-fluid py-3">

    <!-- Breadcrumb -->
    <div class="mt-1 mb-3">
      <nav
          style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);"
          aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
          <li class="breadcrumb-item"><a href="/attendance">අද පංති</a></li>
          <li class="breadcrumb-item active" aria-current="page">පැමිණීම සටහන් කිරීම</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>

        <!-- Header / Controls -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h5 class="mb-0 text-primary position-relative">
              <span class="bg-201 dark__bg-1100 pe-3"><b>පැමිණීම සටහන් කිරීම</b></span>
              <span class="border position-absolute top-50 translate-middle-y w-75 z-n1"></span>
            </h5>
            <small class="text-muted ms-1">
              තෝරාගත් පන්ති: <b>{{ classIdChips.join(', ') || '—' }}</b>
            </small>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary" @click="goBack">
              <i class="fa fa-arrow-left me-1"></i> Back
            </button>

            <button
                class="btn"
                :class="armed ? 'btn-warning' : 'btn-success'"
                @click="toggleArm"
                :disabled="loading"
            >
              <i :class="armed ? 'fa fa-stop' : 'fa fa-nfc-signal'"></i>
              <span class="ms-2">{{ armed ? 'Stop scan' : 'Start scan' }}</span>
            </button>

            <!-- Quick pause 8s -->
            <button
                v-if="armed && !pauseRemaining"
                class="btn btn-outline-primary"
                @click="quickPause(8)"
                :disabled="loading"
            >
              <i class="fa fa-hand me-2"></i> Pause 8s
            </button>
            <button
                v-if="pauseRemaining"
                class="btn btn-outline-secondary"
                disabled
            >
              Resuming in {{ pauseRemaining }}s…
            </button>
          </div>
        </div>

        <!-- Chips (class filter toggle) -->
        <div class="mt-3">
          <span class="me-2 fw-semibold">පන්ති තෝරන්න:</span>
          <button
              v-for="c in uniqueClasses"
              :key="c.classId"
              type="button"
              class="btn btn-sm me-2 mb-2"
              :class="selectedClassIds.has(c.classId) ? 'btn-primary' : 'btn-outline-primary'"
              @click="toggleClassFilter(c.classId)"
          >
            {{ c.className }} <small class="opacity-75">({{ c.classId }})</small>
          </button>
          <button
              v-if="uniqueClasses.length"
              class="btn btn-sm btn-link text-decoration-none"
              @click="resetClassFilter"
          >
            Reset
          </button>
        </div>

        <!-- Scanner hint -->
        <div class="mt-2 small text-muted" v-if="armed && !pauseRemaining">
          Scanning is <b>ON</b>. Hold <b>Ctrl</b> (⌘ on Mac) to click without pausing. Press <b>Esc</b> to stop scanning.
        </div>

        <!-- Counters -->
        <div class="row mt-3 g-3">
          <div class="col-12 col-md-4">
            <div class="card border-200">
              <div class="card-body py-2 d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-700 small">මුළු සිසුන්</div>
                  <div class="fs-5 fw-bold">{{ totalStudents }}</div>
                </div>
                <i class="fa fa-users text-primary fs-4"></i>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-200">
              <div class="card-body py-2 d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-700 small">පැමිණි</div>
                  <div class="fs-5 fw-bold">{{ attendedFiltered.length }}</div>
                </div>
                <i class="fa fa-check-circle text-success fs-4"></i>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="card border-200">
              <div class="card-body py-2 d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-700 small">අද දිනය</div>
                  <div class="fs-5 fw-bold">{{ today }}</div>
                </div>
                <i class="fa fa-calendar-day text-info fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance list -->
        <div class="card mt-3">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h6 class="mb-0">පැමිණි සිසුන්</h6>
            <span class="badge bg-200 text-dark">Showing {{ attendedFiltered.length }}</span>
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
              <tr v-else-if="!attendedFiltered.length">
                <td colspan="5" class="text-center text-muted py-4">තවමත් සිසුන් පැමිණියේ නැත.</td>
              </tr>
              <tr v-for="(s, i) in attendedFiltered" :key="s.studentId + '-' + i">
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
                  <button
                      class="badge border-0"
                      :class="s.paymentStatus==='paid' ? 'bg-success' : 'bg-warning text-dark'"
                      @click="s.paymentStatus==='paid' ? null : openPaymentFor(s)"
                      :title="s.paymentStatus==='paid' ? 'Paid' : 'Click to add payment'"
                      style="cursor: pointer"
                  >
                    {{ s.paymentStatus==='paid' ? 'ගෙවූවා' : 'ගෙවීම නැත' }}
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

      </CardBody>
    </Card>

    <!-- Scanner SHIELD -->
    <div
        v-if="armed && !pauseRemaining"
        class="scanner-shield"
        :class="clickThrough ? 'pe-none' : 'pe-all'"
        tabindex="0"
        ref="shieldRef"
        @keydown.stop.prevent="onKey"
        @keypress.stop.prevent
        @keyup.stop.prevent
        @mousedown.stop.prevent="!clickThrough"
        @mouseup.stop.prevent="!clickThrough"
        @click.stop.prevent="!clickThrough"
        @touchstart.stop.prevent="!clickThrough"
        @touchend.stop.prevent="!clickThrough"
    ></div>

    <!-- Tiny hint -->
    <div v-if="armed && !pauseRemaining" class="click-hint">
      Hold <b>Ctrl</b>/<b>⌘</b> to click without pausing &nbsp;•&nbsp; Press <b>Esc</b> to stop
    </div>

    <!-- Payment Modal -->
    <div v-if="paymentModal.visible" class="modal-backdrop-custom">
      <div class="modal-card">
        <div class="d-flex align-items-center justify-content-between">
          <h6 class="mb-0">ගෙවීම් ඇතුලත් කරන්න</h6>
          <button class="btn btn-sm btn-link" @click="closePayment">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="mt-3 d-flex align-items-center gap-3">
          <div
              class="rounded-circle bg-200 d-flex align-items-center justify-content-center overflow-hidden"
              style="width:64px;height:64px;"
          >
            <template v-if="paymentModal.student?.studentImage">
              <img :src="paymentModal.student.studentImage" style="width:64px;height:64px;object-fit:cover;" alt="avatar"/>
            </template>
            <template v-else>
              <span class="text-700 fs-4 fw-bold">{{ (paymentModal.student?.studentName || 'S').charAt(0) }}</span>
            </template>
          </div>

          <div>
            <div class="fw-bold">{{ paymentModal.student?.studentName }}</div>
            <div class="small text-muted">
              {{ paymentModal.student?.studentId }} • {{ paymentModal.student?.className }}
            </div>
          </div>

          <div class="ms-auto small text-muted" v-if="paymentModal.countdown > 0">
            Will auto-close in {{ paymentModal.countdown }}s
          </div>
        </div>

        <div class="mt-3">
          <label class="form-label small text-muted">Amount (LKR)</label>
          <input
              type="number"
              class="form-control"
              v-model="paymentModal.amount"
              min="0"
              step="1"
              @focus="cancelPaymentCountdown"
          />
        </div>

        <div class="mt-3 d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" @click="closePayment">Cancel</button>
          <button class="btn btn-primary" @click="submitPayment" :disabled="!Number(paymentModal.amount)">
            Submit
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Card from "../../bootstrap/Card.vue";
import CardBody from "../../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../composables/application/notificationHandling";

const $loading = inject('$loading');
const baseURL  = inject('$baseURL');
const router   = inject('$router', null);
const route    = inject('$route',  null);

// ---------- ROUTE CLASS IDS ----------
const classIdsParam = computed(() => {
  const q = route?.query?.classIds ?? new URLSearchParams(location.search).get('classIds');
  return (q || '').split(',').map(s => s.trim()).filter(Boolean);
});

// ---------- STATE ----------
const loading = ref(false);
const studentsInClass = ref([]);
const paymentsInMonth = ref([]);
const attended = ref([]);
const selectedClassIds = ref(new Set());
const classIdChips = computed(() => Array.from(selectedClassIds.value));
const today = new Date().toLocaleDateString();

// Scanner state
const armed = ref(true);
const pauseRemaining = ref(0);
const clickThrough = ref(false);
const shieldRef = ref(null);

// HID parsing
const buffer = ref('');
let lastTick = 0;
let idleTimer = null;
let pauseTimer = null;

// duplicate-burst guard
let lastScanId = '';
let lastScanAt = 0;

// Payment modal state
const paymentModal = ref({
  visible: false,
  student: null,
  amount: null,
  countdown: 0,
});
let paymentCountdownTimer = null;

// ---------- COMPUTED ----------
const uniqueClasses = computed(() => {
  const map = {};
  (studentsInClass.value || []).forEach(r => { map[r.classId] = r.className; });
  return Object.keys(map).map(k => ({ classId: k, className: map[k] }));
});

const totalStudents = computed(() => {
  const set = new Set(
      (studentsInClass.value || [])
          .filter(r => selectedClassIds.value.has(r.classId))
          .map(r => r.studentId)
  );
  return set.size;
});

const attendedFiltered = computed(() => {
  return (attended.value || []).filter(s => selectedClassIds.value.has(s.classId));
});

// ---------- NAV ----------
function goBack(){
  history.length > 1 ? history.back() : (router ? router.push('/attendance') : (location.href='/attendance'));
}

// ---------- FILTER CHIPS ----------
function toggleClassFilter(id){
  const set = selectedClassIds.value;
  if (set.has(id)) set.delete(id); else set.add(id);
}
function resetClassFilter(){
  selectedClassIds.value = new Set(classIdsParam.value);
}

// ---------- LOADERS ----------
async function fetchStudentsInClasses(ids){
  if (!ids.length) return;
  const payload = {
    url: `${baseURL}/api/v1/general-queries/readData`,
    data: JSON.stringify({
      collection: 'class_has_students',
      attr: 'classId',
      filter_array: JSON.stringify(ids)
    })
  };
  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  studentsInClass.value = json_data.value && json_data.value.length ? json_data.value : [];
}

function currentMonth(){
  try{
    return new Date().toLocaleString('en-US', { month: 'long' });
  }catch{ return ''; }
}

async function fetchPaymentsForMonth(){
  const payload = {
    url: `${baseURL}/api/v1/general-queries/queryCollection`,
    data: JSON.stringify({
      collection: 'class_fees',
      payload: JSON.stringify([{ field: 'month', operator: '=', value: currentMonth(), ignoreDates: true }])
    })
  };
  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  paymentsInMonth.value = json_data.value && json_data.value.length ? json_data.value : [];
}

async function fetchTodaysAttendance(){
  const tzStart = new Date(); tzStart.setHours(0,0,0,0);
  const tzEnd = new Date();   tzEnd.setHours(23,59,59,999);

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
  const rows = json_data.value && json_data.value.length ? json_data.value : [];

  const month = currentMonth();
  const mapped = rows
      .filter(r => classIdsParam.value.includes(String(r.classId)))
      .map(r => {
        const paidRow = (paymentsInMonth.value || []).find(p => p.studentId === r.studentId && p.classId === r.classId && p.month === month);
        return {
          studentId: r.studentId,
          studentName: r.studentName,
          studentImage: r.studentImage,
          classId: r.classId,
          className: r.className,
          time: r.marked_at || r.time,
          paymentStatus: paidRow?.paid ? 'paid' : 'unpaid',
        };
      });

  const seen = new Set();
  attended.value = mapped.filter(m => {
    const k = m.studentId + '|' + m.classId;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------- SAVE ATTENDANCE ----------
async function persistAttendance(row){
  const payload = {
    url: `${baseURL}/api/v1/general-queries/addData`,
    data: JSON.stringify({
      collection: 'attendance',
      data: JSON.stringify({
        classId:   row.classId,
        className: row.className,
        studentId: row.studentId,
        studentName: row.studentName,
        studentImage: row.studentImage || '',
        marked_at: row.time,
        marked_date: new Date().toISOString(),
      })
    })
  };
  await generalAxiosRequest('curl-requests/post', payload, false);
}

// ---------- SAVE PAYMENT ----------
async function persistPayment({ student, amount }){
  const data = {
    studentId: student.studentId,
    studentName: student.studentName,
    studentImage: student.studentImage || '',
    classId: student.classId,
    className: student.className,
    month: currentMonth(),
    amount: Number(amount) || 0,
    paid: true,
    paidAt: new Date().toISOString(),
  };
  const payload = {
    url: `${baseURL}/api/v1/general-queries/addData`,
    data: JSON.stringify({
      collection: 'class_fees',
      data: JSON.stringify(data)
    })
  };
  await generalAxiosRequest('curl-requests/post', payload, false);

  // update local caches
  paymentsInMonth.value = [
    ...paymentsInMonth.value.filter(p => !(p.studentId === data.studentId && p.classId === data.classId && p.month === data.month)),
    data
  ];
  attended.value = attended.value.map(a => {
    if (a.studentId === data.studentId && a.classId === data.classId){
      return { ...a, paymentStatus: 'paid' };
    }
    return a;
  });
}

// ---------- PAYMENT MODAL FLOW ----------
function openPaymentFor(row){
  // allow interaction while scanning by quick-pausing & allowing click-through
  quickPause(10);
  clickThrough.value = true;

  paymentModal.value.visible = true;
  paymentModal.value.student = { ...row };
  paymentModal.value.amount  = defaultFeeFor(row);
  startPaymentCountdown(5);
}

function defaultFeeFor(row){
  const p = (paymentsInMonth.value || []).find(x => x.studentId === row.studentId && x.classId === row.classId && x.month === currentMonth());
  return p?.amount || 2500;
}

function startPaymentCountdown(seconds){
  clearInterval(paymentCountdownTimer);
  paymentModal.value.countdown = seconds;
  paymentCountdownTimer = setInterval(() => {
    paymentModal.value.countdown -= 1;
    if (paymentModal.value.countdown <= 0){
      clearInterval(paymentCountdownTimer);
      paymentCountdownTimer = null;
      closePayment();  // <- will re-arm shield & disable clickThrough
    }
  }, 1000);
}
function cancelPaymentCountdown(){
  clearInterval(paymentCountdownTimer);
  paymentCountdownTimer = null;
  paymentModal.value.countdown = 0;
}

/* IMPORTANT FIX:
   After closing the payment popup, IMMEDIATELY:
   - disable clickThrough,
   - clear any pause,
   - focus the shield so clicks are blocked again and HID is captured.
*/
function closePayment(){
  paymentModal.value.visible = false;
  paymentModal.value.student = null;
  paymentModal.value.amount = null;
  paymentModal.value.countdown = 0;
  clearInterval(paymentCountdownTimer);
  paymentCountdownTimer = null;

  // <<< THE KEY BIT >>>
  clickThrough.value = false;       // stop letting clicks pass through
  pauseRemaining.value = 0;         // end any temporary pause immediately
  // keep scanning ON unless user stopped; refocus shield to capture HID & block clicks
  if (armed.value) nextTick(() => shieldRef.value?.focus?.());
}

async function submitPayment(){
  if (!paymentModal.value.student || !Number(paymentModal.value.amount)) return;
  const loader = $loading?.show?.();
  try{
    await persistPayment({ student: paymentModal.value.student, amount: paymentModal.value.amount });
    notificationHandling('success','ගෙවීම සුරකින්නාවුනි');
    closePayment(); // <- also re-arms shield and disables clickThrough
  }catch(e){
    notificationHandling('error', e?.message || 'Payment failed');
  }finally{
    loader?.hide?.();
  }
}

// ---------- HANDLE A SCANNED ID ----------
async function handleScannedId(rawId){
  const id = String(rawId || '').replace(/[^\dA-Za-z]/g,'');
  if (!id) return;

  // Prevent identical bursts within 650ms
  const now = Date.now();
  if (lastScanId === id && now - lastScanAt < 650) return;
  lastScanId = id; lastScanAt = now;

  const match = (studentsInClass.value || []).find(r =>
      r.studentId === id && selectedClassIds.value.has(r.classId)
  );
  if (!match){
    notificationHandling('error', 'මෙම ශිෂ්‍යයා තෝරાયેલા පන්තියකට සම්බන්ධ නැත!');
    return;
  }

  const dup = attended.value.find(a => a.studentId === id && a.classId === match.classId);
  if (dup) {
    if (dup.paymentStatus !== 'paid') openPaymentFor(dup);
    return;
  }

  const month = currentMonth();
  const paidRow = (paymentsInMonth.value || []).find(p => p.studentId === id && p.classId === match.classId && p.month === month);
  const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true });

  const row = {
    studentId: match.studentId,
    studentName: match.studentName,
    studentImage: match.studentImage || '',
    classId: match.classId,
    className: match.className,
    time,
    paymentStatus: paidRow?.paid ? 'paid' : 'unpaid',
  };

  attended.value = [row, ...attended.value];
  persistAttendance(row).catch(()=>{});

  if (row.paymentStatus !== 'paid'){
    openPaymentFor(row);
  }
}

// ---------- SHIELD KEY HANDLERS ----------
function onKey(e){
  if (paymentModal.value.visible) return;

  if (e.key === 'Escape'){ toggleArm(); return; }

  const GAP = 120;
  const isDigit = /^\d$/.test(e.key);
  const isEnter = e.key === 'Enter';

  const t = performance.now();
  if (!lastTick || t - lastTick > GAP * 3) buffer.value = '';
  lastTick = t;

  if (isDigit) buffer.value += e.key;

  clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    if (buffer.value) {
      const final = buffer.value; buffer.value = '';
      await handleScannedId(final);
    }
  }, GAP * 4);

  if (isEnter){
    clearTimeout(idleTimer);
    const final = buffer.value; buffer.value = '';
    if (final) handleScannedId(final);
  }
}

// Global listeners
function globalKeyDown(ev){
  if (!armed.value || pauseRemaining.value) return;
  if (paymentModal.value.visible) return;

  if (ev.key === 'Control' || ev.metaKey) clickThrough.value = true;

  if (/^\d$/.test(ev.key) || ev.key === 'Enter'){
    ev.preventDefault(); ev.stopPropagation();
    onKey(ev);
  }
  if (ev.key === 'Escape'){
    ev.preventDefault(); ev.stopPropagation();
    toggleArm();
  }
}
function globalKeyUp(ev){
  if (paymentModal.value.visible) return;
  // Reset clickThrough once modifiers are released
  if (ev.key === 'Control' || !ev.metaKey) clickThrough.value = false;
}

// ---------- ARM / PAUSE ----------
function toggleArm(){
  armed.value = !armed.value;
  buffer.value = '';
  // Leaving scanning ON? refocus the shield
  if (armed.value){
    pauseRemaining.value = 0;   // ensure not paused
    clickThrough.value = false; // ensure clicks are blocked again
    nextTick(()=> shieldRef.value?.focus?.());
  }
}

function quickPause(seconds = 8){
  if (!armed.value) return;
  pauseRemaining.value = seconds;
  clearInterval(pauseTimer);
  pauseTimer = setInterval(() => {
    pauseRemaining.value -= 1;
    if (pauseRemaining.value <= 0){
      clearInterval(pauseTimer);
      pauseTimer = null;
      pauseRemaining.value = 0;
      clickThrough.value = false; // <- make sure we stop click-through when resuming
      nextTick(() => shieldRef.value?.focus?.());
    }
  }, 1000);
}

// ---------- LIFECYCLE ----------
onMounted(async () => {
  selectedClassIds.value = new Set(classIdsParam.value);

  loading.value = true;
  const loader = $loading?.show?.();
  try{
    await fetchStudentsInClasses(classIdsParam.value);
    await fetchPaymentsForMonth();
    await fetchTodaysAttendance();
  }catch(e){
    notificationHandling('error', e?.message || 'Failed to load attendance data.');
  }finally{
    loader?.hide?.();
    loading.value = false;
  }

  if (armed.value) nextTick(()=> shieldRef.value?.focus?.());

  document.addEventListener('keydown', globalKeyDown, true);
  document.addEventListener('keyup',   globalKeyUp,   true);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', globalKeyDown, true);
  document.removeEventListener('keyup',   globalKeyUp,   true);
  clearTimeout(idleTimer);
  clearInterval(pauseTimer);
  clearInterval(paymentCountdownTimer);
});
</script>

<style scoped>
.scanner-shield{
  position: fixed; inset: 0;
  background: transparent;
  z-index: 2147483000;
  cursor: none;
  outline: none;
}
.pe-none { pointer-events: none; }
.pe-all  { pointer-events: auto; }

.click-hint{
  position: fixed;
  bottom: 10px;
  right: 12px;
  background: rgba(0,0,0,.55);
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 2147483001;
  user-select: none;
}

.bg-201 { background: var(--falcon-body-bg,#fff); }

.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1080; }
.modal-card { width: min(460px,92vw); background: var(--falcon-card-bg,#fff); border-radius: 12px; border:1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15); padding:16px 18px; }
</style>
