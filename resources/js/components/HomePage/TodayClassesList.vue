<template>

  <div class="mt-3 mb-4">
    <nav
        style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);"
        aria-label="breadcrumb"
    >
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
        <li class="breadcrumb-item active" aria-current="page">අද පංති</li>
      </ol>
    </nav>
  </div>


  <div class="container-fluid py-3">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h5 class="mb-0">Today’s Classes</h5>
        <small class="text-muted">
          {{ titleToday }} • Live arrivals
        </small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-primary" :disabled="loading" @click="refresh">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>
        <router-link to="/" class="btn btn-outline-secondary">
          <i class="fa fa-arrow-left me-1"></i> Dashboard
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
      <div class="mt-2 text-muted">Loading today’s classes…</div>
    </div>

    <template v-else>
      <div v-if="!classesView.length" class="text-center text-muted py-5">
        <i class="fa fa-calendar-xmark fa-2x mb-2"></i>
        <div class="fw-bold">No classes with arrivals yet</div>
        <div>Once students start arriving, classes will appear here.</div>
      </div>

      <div class="row g-3">
        <div v-for="c in classesView" :key="c.classId" class="col-12 col-md-6 col-xl-4">
          <div class="card shadow-sm border-200 h-100 hover-card">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="rounded-circle bg-100 d-flex align-items-center justify-content-center"
                   style="width:46px;height:46px;">
                <i class="fa fa-chalkboard fs-5 text-primary"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-700">{{ c.className || c.classId }}</div>
                <div class="small text-700">Arrived: <b>{{ c.arrived }}</b></div>
              </div>
              <router-link class="btn btn-sm btn-outline-primary"
                           :to="`/classes/${c.classId}/today`">
                Open
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import generalAxiosRequest from '../../composables/application/generalAxiosRequest';
import notificationHandling from '../../composables/application/notificationHandling';

const baseURL  = inject('$baseURL');
const $loading = inject('$loading');

const loading = ref(false);
const classesAll = ref([]);         // [{classId, className}]
const todayAttendance = ref([]);    // attendance rows today

const titleToday = new Intl.DateTimeFormat('en-US', {
  weekday:'short', month:'short', day:'numeric'
}).format(new Date());

// helpers
async function apiPost(endpoint, dataObj){
  const payload = { url: `${baseURL}/api/v1/general-queries/${endpoint}`, data: JSON.stringify(dataObj) };
  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  return json_data?.value ?? json_data ?? {};
}
function rowsFrom(x){
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.value)) return x.value;
  if (Array.isArray(x?.data)) return x.data;
  return [];
}

async function loadAllClasses(){
  const json = await apiPost('readData', {
    collection: 'classes',
    paginate: false,
    project: JSON.stringify(['classId','className'])
  });
  classesAll.value = rowsFrom(json).map(r => ({ classId:r.classId, className:r.className || r.classId }));
}

async function loadTodayAttendance(){
  const tzStart = new Date(); tzStart.setHours(0,0,0,0);
  const tzEnd   = new Date(); tzEnd.setHours(23,59,59,999);
  const json = await apiPost('queryCollection', {
    collection: 'attendance',
    payload: JSON.stringify([
      { field:'marked_date', operator: '>=', value: tzStart.toISOString() },
      { field:'marked_date', operator: '<=', value: tzEnd.toISOString() }
    ])
  });
  todayAttendance.value = rowsFrom(json);
}

// derive class list with arrived count (include classes even if 0 arrivals)
const classesView = computed(() => {
  const map = new Map();
  for (const r of todayAttendance.value){
    const cid = r.classId;
    map.set(cid, (map.get(cid)||0)+1);
  }
  return classesAll.value
      .map(c => ({ ...c, arrived: map.get(c.classId)||0 }))
      .filter(c => c.arrived > 0)   // show only classes with activity today
      .sort((a,b) => b.arrived - a.arrived);
});

async function refresh(){
  const loader = $loading?.show?.();
  loading.value = true;
  try{
    await Promise.all([loadAllClasses(), loadTodayAttendance()]);
  }catch(e){
    notificationHandling('error', e?.message || 'Failed to load');
  }finally{
    loading.value = false;
    loader?.hide?.();
  }
}

onMounted(refresh);
</script>

<style scoped>
.border-200{ border-color:#edf2f7; }
.text-700{ color:#475569; }
.bg-100{ background:#f8fafc; }
.hover-card{ transition: transform .06s ease, box-shadow .06s ease; }
.hover-card:hover{ transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.08)!important; }
</style>
