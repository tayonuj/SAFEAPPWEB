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

            <button
                v-if="armed && !pauseRemaining"
                class="btn btn-outline-primary"
                @click="quickPause(8)"
                :disabled="loading"
            >
              <i class="fa fa-hand me-2"></i> Pause 8s
            </button>
            <button v-if="pauseRemaining" class="btn btn-outline-secondary" disabled>
              Resuming in {{ pauseRemaining }}s…
            </button>
          </div>
        </div>

        <!-- Chips -->
        <div class="mt-3">
          <span class="me-2 fw-semibold">පන්ති තෝරන්න:</span>
          <ClassFilterChips
              :classes="uniqueClasses"
              :selected="selectedClassIds"
              @toggle="toggleClassFilter"
              @reset="resetClassFilter"
          />
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

        <!-- View toggle -->
        <div class="mt-3 d-flex align-items-center gap-2">
          <button
              class="btn btn-sm"
              :class="viewTab==='attend' ? 'btn-primary' : 'btn-outline-primary'"
              @click="viewTab='attend'"
          >
            පැමිණි සිසුන්
          </button>
          <button
              class="btn btn-sm"
              :class="viewTab==='payments' ? 'btn-primary' : 'btn-outline-primary'"
              @click="viewTab='payments'"
          >
            ගෙවීම්
          </button>
        </div>

        <!-- Attendance list -->
        <AttendanceTable
            v-if="viewTab==='attend'"
            :loading="loading"
            :rows="attendedFiltered"
            @open-payment="openPaymentFor"
            @chip-click="onChipClick"
        />

        <!-- Payments list -->
        <PaymentsPanel
            v-else
            :items="paidPayments"
            :row-clickable="true"
            @row-click="onPaymentRowClick"
        />
      </CardBody>
    </Card>

    <!-- Scanner SHIELD -->
    <ScannerShield
        v-if="armed && !pauseRemaining"
        :click-through="clickThrough"
        ref="shieldRef"
        @key="onKey"
        @allow-click="clickThrough = true"
        @block-click="clickThrough = false"
    />

    <!-- Tiny hint -->
    <div v-if="armed && !pauseRemaining" class="click-hint">
      Hold <b>Ctrl</b>/<b>⌘</b> to click without pausing &nbsp;•&nbsp; Press <b>Esc</b> to stop
    </div>

    <!-- Payment Modal (unpaid) -->
    <PaymentModal
        v-if="paymentModal.visible"
        :student="paymentModal.student"
        :amount="paymentModal.amount"
        :countdown="paymentModal.countdown"
        @update:amount="v => (paymentModal.amount = v)"
        @cancel-countdown="cancelPaymentCountdown"
        @close="closePayment"
        @submit="submitPayment"
    />

    <!-- Preview Modal (paid) -->
    <StudentPreviewModal
        v-if="previewModal.visible"
        :student="previewModal.student"
        :seconds="previewModal.seconds"
        :amount="previewModal.amount"
        @close="closePreview"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Card from "../../bootstrap/Card.vue";
import CardBody from "../../bootstrap/CardBody.vue";
import AttendanceTable from "./AttendanceTable.vue";
import ClassFilterChips from "./ClassFilterChips.vue";
import PaymentModal from "./PaymentModal.vue";
import StudentPreviewModal from "./StudentPreviewModal.vue";
import ScannerShield from "./ScannerShield.vue";
import PaymentsPanel from "./PaymentsPanel.vue";
import useHidScanner from "../../../composables/application/attendance/useHidScanner";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../composables/application/notificationHandling";
import moment from "moment/moment";
import {sendAttendanceNotice, sendPaymentReceipt} from "../../../composables/application/whatsappNotifier";

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

// view: 'attend' | 'payments'
const viewTab = ref('attend');

// Payment modal state (UNPAID)
const paymentModal = ref({
  visible: false,
  student: null,
  amount: null,
  countdown: 0,
});
let paymentCountdownTimer = null;

// Preview modal state (PAID)
const previewModal = ref({
  visible: false,
  student: null,
  seconds: 2, // default show time
  amount: null,
});
let previewTimer = null;

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

// paid list for current month & selected classes
const paidPayments = computed(() => {
  const month = currentMonth();
  return (paymentsInMonth.value || [])
      .filter(p => p.paid && p.month === month && selectedClassIds.value.has(String(p.classId)));
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
  try{ return new Date().toLocaleString('en-US', { month: 'long' }); }
  catch{ return ''; }
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
        // date anchor (start of day). Use now() if your backend wants full timestamp.
        marked_date: moment().startOf('day').toDate(),
      })
    })
  };
  await generalAxiosRequest('curl-requests/post', payload, false);

  trySendAttendanceWhatsapp(row).catch(()=>{});

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

  // update caches
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

  trySendPaymentWhatsapp(student, amount).catch(()=>{});

}

// ---------- PREVIEW (PAID) ----------
function openPreviewFor(row){
  // brief pause; no click-through
  quickPause(3);
  clickThrough.value = false;

  clearTimeout(previewTimer);
  previewModal.value.visible = true;
  previewModal.value.student = { ...row };
  previewModal.value.seconds = 2;
  previewModal.value.amount   = paidAmountFor(row);
  previewTimer = setTimeout(() => {
    closePreview();
  }, 2000);
}
function closePreview(){
  previewModal.value.visible = false;
  previewModal.value.student = null;
  clearTimeout(previewTimer);
  previewTimer = null;

  // Re-arm shield & end pause
  pauseRemaining.value = 0;
  if (armed.value) nextTick(() => shieldRef.value?.focus?.());
}

// ---------- PAYMENT MODAL FLOW (UNPAID) ----------
function openPaymentFor(row){
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
      closePayment();
    }
  }, 1000);
}
function cancelPaymentCountdown(){
  clearInterval(paymentCountdownTimer);
  paymentCountdownTimer = null;
  paymentModal.value.countdown = 0;
}
function closePayment(){
  paymentModal.value.visible = false;
  paymentModal.value.student = null;
  paymentModal.value.amount = null;
  paymentModal.value.countdown = 0;
  clearInterval(paymentCountdownTimer);
  paymentCountdownTimer = null;

  // Re-arm shield immediately (stop click-through, end pause)
  clickThrough.value = false;
  pauseRemaining.value = 0;
  if (armed.value) nextTick(() => shieldRef.value?.focus?.());
}
async function submitPayment(){
  if (!paymentModal.value.student || !Number(paymentModal.value.amount)) return;
  const loader = $loading?.show?.();
  try{
    await persistPayment({ student: paymentModal.value.student, amount: paymentModal.value.amount });
    notificationHandling('success','ගෙවීම සුරකින්නාවුනි');
    closePayment();
  }catch(e){
    notificationHandling('error', e?.message || 'Payment failed');
  }finally{
    loader?.hide?.();
  }
}

// ---------- HID SCANNER ----------
const {
  armed,
  pauseRemaining,
  clickThrough,
  shieldRef,
  onKey,
  toggleArm,
  quickPause,
  attachGlobal,
  detachGlobal
} = useHidScanner({ onScan: handleScannedId, onEscape: goBack });

// Shared scan handler
let lastScanId = ''; let lastScanAt = 0;
async function handleScannedId(rawId){
  const id = String(rawId || '').replace(/[^\dA-Za-z]/g,'');
  if (!id) return;

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

  // If already in today's list, we still preview/payment based on status
  const existing = attended.value.find(a => a.studentId === id && a.classId === match.classId);

  const month = currentMonth();
  const paidRow = (paymentsInMonth.value || []).find(p => p.studentId === id && p.classId === match.classId && p.month === month);
  const isPaid = paidRow?.paid === true;
  const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true });

  const row = existing || {
    studentId: match.studentId,
    studentName: match.studentName,
    studentImage: match.studentImage || '',
    classId: match.classId,
    className: match.className,
    time,
    paymentStatus: isPaid ? 'paid' : 'unpaid',
  };

  if (!existing){
    attended.value = [row, ...attended.value];
    persistAttendance(row).catch(()=>{});
  }

  // Always show profile:
  if (row.paymentStatus === 'paid') {
    openPreviewFor(row);          // quick 2s preview
  } else {
    openPaymentFor(row);          // input popup for unpaid
  }
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
  attachGlobal();
});
onBeforeUnmount(() => {
  detachGlobal();
  clearTimeout(previewTimer);
});

// table chip click handler
function onChipClick(row){
  if (row.paymentStatus === 'paid') {
    openPreviewFor(row);   // 2s preview modal
  } else {
    openPaymentFor(row);   // payment modal with input/countdown
  }
}

// payments row click -> preview
function onPaymentRowClick(p){
  const row = {
    studentId: p.studentId,
    studentName: p.studentName,
    studentImage: p.studentImage,
    classId: p.classId,
    className: p.className,
    time: '',
    paymentStatus: 'paid',
  };
  openPreviewFor(row);
}

function paidAmountFor(row){
  // try cache
  const p = (paymentsInMonth.value || [])
      .find(x => x.studentId === row.studentId && x.classId === row.classId && x.month === currentMonth());
  if (p?.paid) return Number(p.amount) || 0;
  if (row.paymentAmount) return Number(row.paymentAmount) || 0;
  return null;
}

function findGuardianPhone(studentId, classId) {
  // Try to find from the already-fetched class_roster cache
  const rec = (studentsInClass.value || []).find(
      r => r.studentId === studentId && String(r.classId) === String(classId)
  );
  // prefer guardian numbers, then student
  return (
      rec?.guardianMobile ||
      rec?.guardianMobile_2 ||
      rec?.studentMobile ||
      ''
  );
}

async function trySendAttendanceWhatsapp(row) {
  const to = findGuardianPhone(row.studentId, row.classId);
  if (!to) return; // no phone; skip silently

  const date = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const time = row.time || new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', hour12:true });

  await sendAttendanceNotice({
    to,
    studentName: row.studentName,
    className: row.className,
    time,
    date
  });
}

async function trySendPaymentWhatsapp(student, amount) {
  const to = findGuardianPhone(student.studentId, student.classId);
  if (!to) return;

  await sendPaymentReceipt({
    to,
    studentName: student.studentName,
    className: student.className,
    amount: Number(amount) || 0
  });
}

</script>

<style scoped>
.scanner-shield{ position: fixed; inset: 0; background: transparent; z-index: 2147483000; cursor: none; outline: none; }
.pe-none { pointer-events: none; }
.pe-all  { pointer-events: auto; }
.click-hint{ position: fixed; bottom: 10px; right: 12px; background: rgba(0,0,0,.55); color: #fff; padding: 6px 10px; border-radius: 8px; font-size: 12px; z-index: 2147483001; user-select: none; }
.bg-201 { background: var(--falcon-body-bg,#fff); }
</style>
