<template>
  <div>
    <!-- Breadcrumb -->
    <div class="mt-3 mb-4">
      <nav
          style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);"
          aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
          <li class="breadcrumb-item active" aria-current="page">පංති</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>
        <!-- Header -->
        <div class="d-flex mb-3 mt-3 align-items-center justify-content-between">
          <div class="col">
            <h5 class="mb-0 text-primary position-relative">
              <span class="bg-201 dark__bg-1100 pe-3"><b>පංති ලැයිස්තුව</b></span>
              <span class="border position-absolute top-50 translate-middle-y w-75 z-n1"></span>
            </h5>
            <small class="text-muted ms-2">පංති නාමයෙන් සොයන්න</small>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-success" @click="goToAdd()">
              <i class="fa fa-plus me-1" /> නව පංතියක්
            </button>
          </div>
        </div>

        <CardBody>
          <!-- Search row -->
          <div class="row g-2 align-items-center mb-3">
            <div class="col-12 col-md-7">
              <div class="row">
                <div class="col-md-7">
                  <div class="search-box">
                    <form class="position-relative" data-bs-toggle="search" data-bs-display="static">
                      <input
                          class="form-control search-input"
                          type="search"
                          aria-label="Search"
                          ref="searchInputRef"
                          placeholder="පංති නම"
                          v-model="search"
                          @input="onSearchInput"
                      />
                      <span class="fas fa-search search-box-icon"></span>
                    </form>
                  </div>
                  <small class="text-muted">අඩුම අක්ෂර {{ MIN_SEARCH_CHARS }}යි • {{ (DEBOUNCE_MS/1000).toFixed(1) }}sකින් සෙවීම ක්‍රියාවේ.</small>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-5 d-flex align-items-center justify-content-md-end">
              <div class="badge rounded-pill bg-200 text-dark me-2">
                Total: {{ total ?? '…' }}
              </div>
              <div class="badge rounded-pill bg-primary text-white">
                Showing: {{ classes.length }}
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-responsive">
            <table class="table table-striped table-bordered align-middle mb-0">
              <thead class="bg-200">
              <tr>
                <th style="width:38px">#</th>
                <th>පංතිය</th>
                <th style="width:120px">පංතිය අංකය</th>
                <th style="width:160px">ශ්‍රේණිය</th>
                <th>ගුරු</th>
                <th>ඊළඟ සැසිය</th>
                <th style="width:120px">සිසුන්</th>
                <th style="width:110px">ගාස්තුව</th>
                <th style="width:90px"></th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="initialLoading">
                <td colspan="9" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm" role="status" />
                  <span class="ms-2 text-muted">Loading classes…</span>
                </td>
              </tr>

              <tr v-else-if="!classes.length">
                <td colspan="9" class="text-center py-4 text-muted">
                  <i class="fa fa-book me-2" /> No classes found
                </td>
              </tr>

              <tr v-for="(c,idx) in classes" :key="c.classId || idx" class="hover-row">
                <td class="text-center">
                  <div class="avatar avatar-s rounded-circle bg-primary text-white fw-bold">
                    {{ (c.className?.[0] || '?').toUpperCase() }}
                  </div>
                </td>

                <td class="fw-semibold">
                  {{ c.className || '—' }}
                </td>

                <td><span class="badge bg-100 text-dark border">{{ c.classId }}</span></td>

                <td>{{ c.grade || '—' }}</td>

                <td>{{ c.lecturerName || '—' }}</td>

                <td>
                  <span class="small text-700">{{ nextSessionReadable(c.schedule) }}</span>
                </td>

                <td>
                    <span class="badge bg-info text-white">
                      {{ enrollmentByClass[c.classId] ?? 0 }}
                    </span>
                </td>

                <td>
                  <span v-if="Number(c.classFee||0) > 0">Rs. {{ Number(c.classFee).toLocaleString() }}</span>
                  <span v-else class="text-muted">—</span>
                </td>

                <td class="text-end">
                  <button class="btn btn-sm btn-falcon-info" @click="openDetails(c.classId)">
                    විස්තර
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="d-flex align-items-center justify-content-between mt-3">
            <div class="text-muted small">
              Page {{ page }} of {{ lastPage }}
            </div>
            <div class="btn-group">
              <button class="btn btn-outline-secondary btn-sm" :disabled="page<=1 || loadingPage" @click="gotoPage(page-1)">
                <i class="fa fa-chevron-left"></i>
              </button>
              <button class="btn btn-outline-secondary btn-sm" :disabled="page>=lastPage || loadingPage" @click="gotoPage(page+1)">
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </CardBody>
      </CardBody>
    </Card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue';
import Card from "../bootstrap/Card.vue";
import CardBody from "../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";
import notificationHandling from "../../composables/application/notificationHandling";

// ===== Constants =====
const PAGE_SIZE = 10;
const DEBOUNCE_MS = 900;
const MIN_SEARCH_CHARS = 3;

// Sinhala weekday -> JS weekday index (Sun=0)
const DAY_MAP_SI_TO_JS = {
  'ඉරිදා': 0,
  'සඳුදා': 1,
  'අඟහරුවාදා': 2,
  'බුධදා': 3,
  'බ්‍රහස්පතින්දා': 4,
  'සිකුරාදා': 5,
  'සෙනසුරාදා': 6,
};

// ===== Injections =====
const $loading = inject('$loading');
const baseURL = inject('$baseURL');
const router = inject('$router', null);

// ===== State =====
const initialLoading = ref(false);
const loadingPage = ref(false);
const total = ref(null);
const page = ref(1);
const lastPage = ref(1);
const classes = ref([]);

const search = ref('');
const q = ref('');
let debounceTimer = null;

const searchInputRef = ref(null);

// enrollment counts
const enrollmentByClass = reactive({});

// ===== API =====
async function fetchClasses({ curPage = 1, term = '' } = {}) {
  const isSearching = !!term && term.trim().length >= MIN_SEARCH_CHARS;

  const body = {
    collection: 'classes',
    paginate: true,
    page: curPage,
    attr: 'className',
    search_query: term,
    per_page: PAGE_SIZE,
    project: JSON.stringify(['classId','className','grade','lecturerName','classFee','schedule']),
  };
  const payload = {
    url: isSearching ? `${baseURL}/api/v1/general-queries/searchData` : `${baseURL}/api/v1/general-queries/readData`,
    data: JSON.stringify(body)
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  const res = json_data?.value ?? json_data ?? {};

  const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  const meta = {
    current_page: Number(res?.current_page ?? curPage),
    last_page: Number(res?.last_page ?? (items.length === PAGE_SIZE ? curPage + 1 : curPage)),
    total: typeof res?.total === 'number' ? res.total : null,
  };
  return { items, meta };
}

async function prefetchEnrollmentCounts(){
  try{
    const payload = {
      url: `${baseURL}/api/v1/general-queries/getCounts`,
      data: JSON.stringify({ collection:'class_has_students', attr:'classId', project: JSON.stringify(['classId']) })
    };
    const res = await generalAxiosRequest('curl-requests/post', payload, false);
    const arr = Array.isArray(res) ? res : [];
    arr.forEach(row => {
      if (row && row._id != null) enrollmentByClass[String(row._id)] = Number(row.count || 0);
    });
  }catch(_){ /* non-fatal */ }
}

async function loadFirstPage() {
  try {
    initialLoading.value = true;
    const { items, meta } = await fetchClasses({ curPage: 1, term: q.value });
    classes.value = items;
    page.value = meta.current_page;
    lastPage.value = meta.last_page;
    total.value = meta.total;
  } catch (e) {
    notificationHandling('error', e?.message || 'Failed to load classes');
  } finally {
    initialLoading.value = false;
  }
}

async function gotoPage(p) {
  if (p < 1 || p > lastPage.value) return;
  try {
    loadingPage.value = true;
    const { items, meta } = await fetchClasses({ curPage: p, term: q.value });
    classes.value = items;
    page.value = meta.current_page;
    lastPage.value = meta.last_page;
    total.value = meta.total;
  } catch (e) {
    notificationHandling('error', e?.message || 'Failed to load page');
  } finally {
    loadingPage.value = false;
  }
}

// ===== Search =====
function onSearchInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const term = (search.value || '').trim();
    if (!term) {
      q.value = '';
      await loadFirstPage();
      return;
    }
    if (term.length >= MIN_SEARCH_CHARS && term !== q.value) {
      q.value = term;
      await loadFirstPage();
    }
  }, DEBOUNCE_MS);
}

// ===== Helpers =====
function openDetails(classId) {
  if (router) router.push({ name: 'ClassDetails', params: { classId } });
  else window.location.href = `/classes/${encodeURIComponent(classId)}`;
}
function goToAdd() {
  if (router) router.push({ name: 'AddClass' });
  else window.location.href = '/classes/add';
}

// Build next occurrence within the next 7 days from Sinhala day/time
function nextSessionReadable(schedule = []) {
  try{
    if (!Array.isArray(schedule) || !schedule.length) return '—';

    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    let candidate = null;

    for (const s of schedule) {
      const jsDay = DAY_MAP_SI_TO_JS[s?.day];
      if (jsDay == null) continue;

      const cur = new Date(now);
      const diff = (jsDay - cur.getDay() + 7) % 7;
      cur.setDate(cur.getDate() + diff);

      if (s?.time) {
        const [H, M] = String(s.time).split(':').map(n => parseInt(n,10));
        cur.setHours(isNaN(H)?0:H, isNaN(M)?0:M, 0, 0);
        if (cur < now) cur.setDate(cur.getDate() + 7); // push to next week if past today’s time
      } else {
        cur.setHours(0,0,0,0);
      }

      if (cur <= end) {
        if (!candidate || cur < candidate) candidate = cur;
      }
    }

    if (!candidate) {
      const s0 = schedule[0];
      return s0?.day ? `${s0.day} ${s0.time || ''}` : '—';
    }

    // format: e.g., Mon, Jan 6 • 18:00
    const dow = candidate.toLocaleDateString('en-US', { weekday: 'short' });
    const dmy = candidate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const hm  = candidate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${dow}, ${dmy} • ${hm}`;
  }catch(_){
    return '—';
  }
}

// ===== Lifecycle =====
onMounted(async () => {
  await Promise.all([loadFirstPage(), prefetchEnrollmentCounts()]);
});
</script>

<style scoped>
.hover-row:hover { background: var(--falcon-table-hover, #f8f9fa); }
.search-box .search-box-icon { width: 5px !important; }
</style>
