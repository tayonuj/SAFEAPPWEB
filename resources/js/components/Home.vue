<template>
  <div class="dashboard">
    <!-- Hero -->
    <div class="hero card border-0 shadow-sm mb-4">
      <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="hero-avatar d-flex align-items-center justify-content-center">
            <i class="fa fa-school"></i>
          </div>
          <div>
            <h4 class="mb-1 fw-800 text-primary">ආයුබෝවන් Thissa Higher Education Centre!</h4>
            <div class="text-700 small">
              <i class="fa fa-clock me-1"></i> {{ currentTime }}
              <span class="mx-2">•</span>
              <span class="badge rounded-pill bg-100 text-dark border">සජීවී දත්ත</span>
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-falcon-primary" :disabled="loadingAll" @click="refreshAll">
            <span v-if="loadingAll" class="spinner-border spinner-border-sm me-2"></span>
            Refresh
          </button>
          <router-link to="/attendance" class="btn btn-warning">
            <i class="fa fa-wifi-strong"></i> පැමිණීම ළකුනු කරන්න
          </router-link>
        </div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="row g-3 mb-3">
      <div class="col-sm-6 col-xl-3">
        <KpiCard
            title="අද පැමිණීම"
            :value="todayAttendanceCount"
            icon="fa fa-calendar-check"
            tone="success"
            :sub="todayAttendanceSub"
            href="/attendanceandpayments"
        />
      </div>
      <div class="col-sm-6 col-xl-3">
        <KpiCard
            title="සිසු සිසුවියන්"
            :value="totalStudents"
            icon="fa fa-user-graduate"
            tone="primary"
            sub="All time"
            href="/students"
        />
      </div>
      <div class="col-sm-6 col-xl-3">
        <KpiCard
            title="ගුරු මහත්ම/මහත්මීන්"
            :value="totalLecturers"
            icon="fa fa-chalkboard-teacher"
            tone="info"
            sub="Active"
            href="/lecturers"
        />
      </div>
      <div class="col-sm-6 col-xl-3">
        <KpiCard
            title="පන්ති"
            :value="totalClasses"
            icon="fa fa-layer-group"
            tone="warning"
            sub="Running"
            href="/classes"
        />
      </div>
    </div>

    <!-- Money row -->
    <div class="row g-3">
      <div class="col-12 col-xl-7">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h6 class="mb-0 fw-800">මෙම මස මුදල් ලැබීම්</h6>
                <small class="text-muted">{{ titleMonth }}</small>
              </div>
              <div class="text-end">
                <div class="fs-4 fw-800">රු. {{ monthCollected.toLocaleString() }}</div>
                <small class="text-700">ලැබීම් රිසිට්පත් ඇත</small>
              </div>
            </div>

            <!-- Sparkline -->
            <div class="sparkline-wrap">
              <svg :viewBox="spark.viewBox" class="sparkline">
                <polyline
                    :points="spark.points"
                    fill="none"
                    vector-effect="non-scaling-stroke"
                />
                <line
                    v-for="(g,i) in spark.gridY" :key="i"
                    :x1="0" :x2="spark.w" :y1="g" :y2="g"
                    class="spark-grid"
                />
              </svg>
            </div>

            <div class="d-flex justify-content-between text-700 small mt-2">
              <span>දිනපතා ලැබීම්</span>
              <span>උපරිම: රු. {{ monthMaxDay.toLocaleString() }}</span>
            </div>

            <div class="mt-3 d-flex flex-wrap gap-2">
              <span class="badge bg-100 text-dark border">ලැබීම් රිසිට්පත් : {{ monthPaidCount }}</span>
              <span class="badge bg-success">දිනපතා සාමාන්‍ය අගය: රු. {{ avgPerDay.toLocaleString() }}</span>
              <router-link class="btn btn-sm btn-outline-primary ms-auto" to="/attendanceandpayments">
                View details
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick actions & health -->
      <div class="col-12 col-xl-5">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="mb-0 fw-800">Quick මෙනුව</h6>
              <button class="btn btn-sm btn-quiet" @click="refreshAll" :disabled="loadingAll">
                <i class="fa fa-rotate me-1"></i> Sync
              </button>
            </div>

            <div class="row g-2">
              <div class="col-6">
                <ActionTile icon="fa fa-qrcode" label="පැමිණීම ළකුනු කරන්න" to="/attendance" hint="Mark today" />
              </div>
              <div class="col-6">
                <ActionTile icon="fa fa-users" label="සිසු සිසුවියන්ගේ විස්තර" to="/students" hint="ඇතුලත්/වෙනස් කරන්න " />
              </div>
              <div class="col-6">
                <ActionTile icon="fa fa-wallet" label="පැමිණීම් හා ගෙවීම්" to="/attendanceandpayments" hint="සම්පූරණ විස්තර" />
              </div>
              <div class="col-6">
                <ActionTile icon="fa fa-chalkboard" label="පන්ති විස්තර" to="/classes" hint="කාළ සටහන" />
              </div>
              <div class="col-6">
                <ActionTile icon="fa fa-calendar-day" label="අද දින පන්ති" to="/today-classes" hint="සජීවී දත්ත" />
              </div>

              <div class="col-6">
                <ActionTile icon="fa fa-book" label="පුනරීක්ශණ විභාග" to="/assessments" hint="පන්ති විභාග හා ළකුණු" />
              </div>

            </div>

            <hr class="my-3"/>

            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span class="status-dot bg-success"></span>
                <div>
                  <div class="fw-700">දත්ත පද්ධතිය</div>
                  <small class="text-700">සියල්ලම සාමාන්‍යයයි</small>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-secondary" @click="refreshAll" :disabled="loadingAll">
                <i class="fa fa-plug me-1"></i> නැවත බලන්න
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from "vue";
import generalAxiosRequest from "../composables/application/generalAxiosRequest";

/* ========= Small, focused UI subcomponents ========= */
const KpiCard = {
  props: { title:String, value:[String,Number], icon:String, tone:String, sub:String, href:String },
  template: `
    <div class="card kpi shadow-sm h-100">
      <div class="card-body d-flex align-items-center gap-3">
        <div class="kpi-icon" :class="tone">
          <i :class="icon"></i>
        </div>
        <div class="flex-grow-1">
          <div class="text-700 small">{{ title }}</div>
          <div class="fs-3 fw-800">{{ (value ?? '—').toLocaleString ? (value).toLocaleString() : value }}</div>
          <div class="small text-muted">{{ sub }}</div>
        </div>
        <router-link v-if="href" :to="href" class="btn btn-sm btn-outline-primary">
          Open
        </router-link>
      </div>
    </div>
  `
};

const ActionTile = {
  props: { icon:String, label:String, to:String, hint:String },
  template: `
    <router-link :to="to" class="tile d-flex align-items-center gap-2">
      <div class="tile-icon"><i :class="icon"></i></div>
      <div>
        <div class="fw-700">{{ label }}</div>
        <small class="text-700">{{ hint }}</small>
      </div>
      <i class="fa fa-chevron-right ms-auto text-700"></i>
    </router-link>
  `
};
/* =================================================== */

const baseURL = inject("$baseURL");
const $loading = inject("$loading");

/* ======= Time ======= */
const currentTime = ref(new Date().toLocaleString());
let t;
const tick = () => (currentTime.value = new Date().toLocaleString());

/* ======= Month helpers ======= */
const monthCursor = ref(new Date());
const titleMonth = computed(() =>
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(monthCursor.value)
);
const monthName = computed(() =>
    new Intl.DateTimeFormat("en-US", { month: "long" }).format(monthCursor.value)
);
const monthStart = computed(() => {
  const d = new Date(monthCursor.value);
  d.setDate(1); d.setHours(0,0,0,0); return d;
});
const monthEnd = computed(() => {
  const d = new Date(monthCursor.value);
  d.setMonth(d.getMonth()+1); d.setDate(0); d.setHours(23,59,59,999); return d;
});

/* ======= Data ======= */
const loadingAll = ref(false);
const totalStudents = ref(0);
const totalLecturers = ref(0);
const totalClasses = ref(0);

const todayAttendanceCount = ref(0);
const todayAttendanceSub = computed(() => {
  const d = new Intl.DateTimeFormat("en-US", { weekday:"short", month:"short", day:"numeric" }).format(new Date());
  return d;
});

const monthCollected = ref(0);
const monthPaidCount = ref(0);
const perDayData = ref([]); // [{group:'YYYY-MM-DD', sum: number}]
const monthMaxDay = computed(() => Math.max(0, ...perDayData.value.map(d => d.sum)));
const avgPerDay = computed(() => {
  if (!perDayData.value.length) return 0;
  const total = perDayData.value.reduce((s,x) => s + (x.sum||0), 0);
  return Math.round(total / perDayData.value.length);
});

/* ======= Sparkline (SVG points) ======= */
const spark = computed(() => {
  const w = 560, h = 120, pad = 6;
  const vals = perDayData.value.map(d => d.sum);
  const n = vals.length || 1;
  const max = Math.max(1, ...vals);
  const step = (w - pad*2) / Math.max(1, n-1);

  const points = (n === 1)
      ? `${pad},${h-pad} ${w-pad},${h-pad}`
      : vals.map((v,i) => {
        const x = pad + i*step;
        const y = pad + (1 - (v/max))*(h - pad*2);
        return `${x},${y}`;
      }).join(' ');

  // subtle gridlines (4 rows)
  const gridY = Array.from({length:4}, (_,i)=> pad + (i+1)*(h-2*pad)/5);

  return { points, w, h, viewBox: `0 0 ${w} ${h}`, gridY };
});

/* ======= API helpers ======= */
async function apiPost(endpoint, dataObj){
  const payload = { url: `${baseURL}/api/v1/general-queries/${endpoint}`, data: JSON.stringify(dataObj) };
  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  return json_data?.value ?? json_data ?? {};
}
function rowsFrom(json){
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.value)) return json.value;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

/* ======= Fetchers (using your APIs) ======= */
// robust "count" using pagination total metadata
async function countCollection(collection){
  const res = await apiPost('readData', {
    collection,
    paginate: true,
    page: 1,
    per_page: 1,
    project: JSON.stringify(['_id'])
  });
  const total = Number(res?.total ?? 0);
  return isNaN(total) ? 0 : total;
}

async function fetchBasics(){
  const [st, lec, cls] = await Promise.all([
    countCollection('students'),
    countCollection('lecturers'),
    countCollection('classes'),
  ]);
  totalStudents.value = st;
  totalLecturers.value = lec;
  totalClasses.value   = cls;
}

async function fetchTodayAttendance(){
  const tzStart = new Date(); tzStart.setHours(0,0,0,0);
  const tzEnd = new Date(); tzEnd.setHours(23,59,59,999);
  const res = await apiPost('queryCollection', {
    collection: 'attendance',
    payload: JSON.stringify([
      { field:'marked_date', operator: '>=', value: tzStart.toISOString() },
      { field:'marked_date', operator: '<=', value: tzEnd.toISOString() }
    ])
  });
  todayAttendanceCount.value = rowsFrom(res).length;
}

// Sum for current month (paid receipts)
async function fetchMonthMoney(){
  // 1) Sum total (by grouping + totalSum rollup)
  const sumRes = await apiPost('getSumByGrouping', {
    collection: 'class_fees',
    attr_group: 'classId',
    attr_sum: 'amount',
    conditions: JSON.stringify([
      { month: monthName.value },
      { paid: true }
    ])
  });
  // Response shape from service: [{ totalSum: <num>, data: [{group, sum}, ...]}]
  const totalSum = Array.isArray(sumRes) && sumRes[0]?.totalSum ? Number(sumRes[0].totalSum) : 0;
  monthCollected.value = isNaN(totalSum) ? 0 : totalSum;

  // 2) Count paid receipts (by month)
  const paidRes = await apiPost('readDataAdvanced', {
    collection: 'class_fees',
    filter_array: JSON.stringify([
      { attribute:'month', condition:'=', value: monthName.value },
      { attribute:'paid',  condition:'=', value: true }
    ]),
    condition_type: false,
    paginate: false,
    project: JSON.stringify(['_id'])
  });
  monthPaidCount.value = rowsFrom(paidRes).length;

  // 3) Per-day trend (paidAt)
  const byDay = await apiPost('getSumByDateGrouping', {
    collection: 'class_fees',
    attr_group: 'paidAt',
    attr_sum: 'amount',
    conditions: JSON.stringify([
      { paid: true },
      { month: monthName.value } // cheap limit
    ])
  });
  const arr = (Array.isArray(byDay) && byDay[0]?.data) ? byDay[0].data : [];
  // Normalize to whole month days (fill missing with 0)
  const map = new Map(arr.map(d => [d.group, Number(d.sum)||0]));
  const days = [];
  const d0 = new Date(monthStart.value), d1 = new Date(monthEnd.value);
  for (let d = new Date(d0); d <= d1; d.setDate(d.getDate()+1)){
    const key = d.toISOString().slice(0,10);
    days.push({ group:key, sum: map.get(key) || 0 });
  }
  perDayData.value = days;
}

async function refreshAll(){
  const loader = $loading?.show?.();
  loadingAll.value = true;
  try{
    await Promise.all([
      fetchBasics(),
      fetchTodayAttendance(),
      fetchMonthMoney()
    ]);
  } finally {
    loadingAll.value = false;
    loader?.hide?.();
  }
}

/* ======= Lifecycle ======= */
onMounted(async () => {
  t = setInterval(tick, 1000);
  await refreshAll();
});
onUnmounted(() => clearInterval(t));
</script>

<style scoped>
/* Layout polish */
.dashboard { }

.hero { background: linear-gradient(180deg, #f8fbff, #ffffff); border-radius: 14px; }
.hero-avatar{
  width: 54px; height: 54px; border-radius: 50%;
  background: #E6F6F9; color: #0b7285; font-size: 22px;
}

/* KPI card */
.kpi .kpi-icon{
  width: 46px; height: 46px; border-radius: 12px;
  display:flex; align-items:center; justify-content:center;
  font-size:18px;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
}
.kpi .kpi-icon.primary { background:#E8F2FF; color:#1e60d1; }
.kpi .kpi-icon.success { background:#EAF7EF; color:#1f8a4c; }
.kpi .kpi-icon.info    { background:#EAF7FB; color:#0b7285; }
.kpi .kpi-icon.warning { background:#FFF7E5; color:#b58900; }

/* Tiles */
.tile{
  background: #fff; border: 1px solid #eef2f7; border-radius: 12px; padding: 10px 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,.05);
  transition: transform .08s ease, box-shadow .08s ease;
  text-decoration: none !important; color: inherit;
}
.tile:hover{ transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,.08); }
.tile-icon{
  width: 40px; height: 40px; border-radius: 10px;
  display:flex; align-items:center; justify-content:center;
  background:#F1F5F9; color:#334155;
}
.status-dot{
  width:10px; height:10px; border-radius:50%;
  display:inline-block; margin-right:6px;
}

/* Sparkline */
.sparkline-wrap{
  width: 100%; height: 140px; background: #fcfdff; border: 1px solid #eef2f7;
  border-radius: 12px; padding: 8px; overflow: hidden;
}
.sparkline{ width: 100%; height: 100%; }
.sparkline polyline{
  stroke: #2563eb; stroke-width: 2.5; opacity: .92;
}
.spark-grid{
  stroke: #eaeef4; stroke-width: 1; opacity: .8;
}

/* Quiet button */
.btn-quiet{
  background: #E6F6F9; border: 1px solid #cfe8ee; color:#0b7285;
}
.text-700{ color:#475569; }
.fw-800{ font-weight: 800; }
</style>
