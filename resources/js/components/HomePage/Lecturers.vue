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
          <li class="breadcrumb-item active" aria-current="page">ගුරු මහත්ම/මහත්මීන්</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>
        <!-- Header -->
        <div class="d-flex mb-3 mt-3 align-items-center justify-content-between">
          <div class="col">
            <h5 class="mb-0 text-primary position-relative">
              <span class="bg-201 dark__bg-1100 pe-3"><b>ගුරු ලැයිස්තුව</b></span>
              <span class="border position-absolute top-50 translate-middle-y w-75 z-n1"></span>
            </h5>
            <small class="text-muted" style="margin-left: 15px">
              නමෙන් සෙවීම – නැතහොත් කාඩ්පත ස්කෑන් කරන්න
            </small>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-success" @click="goToAdd()">
              <i class="fa fa-plus me-1" /> නව ගුරුවරයෙක්
            </button>
          </div>
        </div>

        <CardBody>
          <!-- Search & Scan Row -->
          <div class="row g-2 align-items-center mb-3">
            <div class="col-12 col-md-7">
              <div class="row">
                <div class="col-md-5">
                  <div class="search-box" data-list='{"valueNames":["title"]}'>
                    <form class="position-relative" data-bs-toggle="search" data-bs-display="static">
                      <input
                          class="form-control search-input fuzzy-search"
                          type="search"
                          aria-label="Search"
                          ref="searchInputRef"
                          placeholder="ගුරුවරයාගේ නම"
                          v-model="search"
                          @input="onSearchInput"
                      />
                      <span class="fas fa-search search-box-icon"></span>
                    </form>
                  </div>
                </div>
                <div class="col-md-4">
                  <button
                      class="btn btn-falcon-warning mt-1 btn-sm"
                      style="margin-left: 10px"
                      @click="armHid()"
                      :disabled="hid.armed"
                  >
                    <i class="fa fa-wifi me-2"></i>
                    <span v-if="!hid.armed">Scan</span>
                    <span v-else>Listening… {{ hid.remainingSec }}s</span>
                  </button>
                </div>
              </div>
              <small class="text-muted">
                අඩුම අක්ෂර {{ MIN_SEARCH_CHARS }} යි. සෙවීම ස්වයංක්‍රීයව {{ (DEBOUNCE_MS/1000).toFixed(1) }}s කින් ක්‍රියා කරයි.
              </small>
            </div>

            <div class="col-12 col-md-5 d-flex align-items-center justify-content-md-end">
              <div class="badge rounded-pill bg-200 text-dark me-2">Total: {{ total ?? '…' }}</div>
              <div class="badge rounded-pill bg-primary text-white">Showing: {{ lecturers.length }}</div>
            </div>
          </div>

          <!-- List / Table -->
          <div class="table-responsive">
            <table class="table table-striped table-bordered align-middle mb-0">
              <thead class="bg-200">
              <tr>
                <th style="width:60px">#</th>
                <th>නම</th>
                <th style="width:180px">Lecturer ID</th>
                <th style="width:120px">Status</th>
                <th style="width:90px"></th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="initialLoading">
                <td colspan="5" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm" role="status" />
                  <span class="ms-2 text-muted">Loading lecturers…</span>
                </td>
              </tr>
              <tr v-else-if="!lecturers.length">
                <td colspan="5" class="text-center py-4 text-muted">
                  <i class="fa fa-users me-2" /> No lecturers found
                </td>
              </tr>

              <tr v-for="(t, idx) in lecturers" :key="t.lecturerId || idx" class="hover-row">
                <td>
                  <div class="avatar avatar-xl">
                    <img v-if="t.image" class="rounded-circle" :src="t.image" alt="" />
                    <img v-else class="rounded-circle" src="https://logifortech.com/img/teacher.png" alt="" />
                  </div>
                </td>
                <td>
                  <div class="fw-semibold">{{ t.name || '—' }}</div>
                </td>
                <td>
                  <span class="badge bg-100 text-dark border">{{ t.lecturerId }}</span>
                </td>
                <td>
                    <span :class="['badge rounded-pill d-block p-2', t.active ? 'bg-success' : 'bg-danger']">
                      {{ t.active ? 'Active' : 'Inactive' }}
                    </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-falcon-info" @click="openDetails(t.lecturerId)">
                    විස්තර
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer / Pagination -->
          <div class="d-flex align-items-center justify-content-between mt-3">
            <div class="text-muted small">Page {{ page }} of {{ lastPage }}</div>
            <div class="btn-group">
              <button
                  class="btn btn-outline-secondary btn-sm"
                  :disabled="page<=1 || loadingPage"
                  @click="gotoPage(page-1)"
              >
                <i class="fa fa-chevron-left"></i>
              </button>
              <button
                  class="btn btn-outline-secondary btn-sm"
                  :disabled="page>=lastPage || loadingPage"
                  @click="gotoPage(page+1)"
              >
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </CardBody>
      </CardBody>
    </Card>

    <!-- HID Modal -->
    <transition name="fade">
      <div v-if="hid.armed" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0">Lecturer Card Scan</h6>
            <button class="btn btn-sm btn-link" @click="disarmHid"><i class="fa fa-times"></i></button>
          </div>
          <div class="mt-2 small text-muted">Tap a card on the reader. Listening for input…</div>
          <div class="mt-3 p-3 bg-100 rounded border d-flex align-items-center">
            <i class="fa fa-nfc-signal fs-4 me-2"></i>
            <div>
              <div class="fw-semibold">Status: <span class="text-primary">{{ hid.statusText }}</span></div>
              <div class="small text-muted">Auto-closes in {{ hid.remainingSec }}s</div>
            </div>
          </div>

          <!-- Hidden focused input to capture HID keystrokes -->
          <input
              ref="hidInputRef"
              type="text"
              class="visually-hidden"
              autocomplete="off"
              @keydown.prevent="onHidKeydown"
          />

          <div class="mt-3 d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary btn-sm" @click="disarmHid">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, inject } from 'vue';
import Card from "../bootstrap/Card.vue";
import CardBody from "../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";
import notificationHandling from "../../composables/application/notificationHandling";

// ===== Constants =====
const PAGE_SIZE = 12;
const DEBOUNCE_MS = 900;
const MIN_SEARCH_CHARS = 3;

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
const lecturers = ref([]);

const search = ref('');
const effectiveQ = ref('');
let debounceTimer = null;

const searchInputRef = ref(null);

// HID modal + buffer state
const hid = reactive({
  armed: false,
  statusText: 'Waiting For Card',
  buffer: '',
  lastTick: 0,
  idleTimer: null,
  countdownTimer: null,
  remainingSec: 0,
});
const hidInputRef = ref(null);

// ===== API =====
async function fetchLecturers({ curPage = 1, q = '' } = {}) {
  const isSearching = !!q && q.trim().length >= MIN_SEARCH_CHARS;

  const body = {
    collection: 'lecturers',
    paginate: true,
    page: curPage,
    attr: 'name',
    search_query: q,
    per_page: PAGE_SIZE,
    project: JSON.stringify(['lecturerId', 'name','image', 'active'])
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

async function loadFirstPage() {
  try {
    initialLoading.value = true;
    const { items, meta } = await fetchLecturers({ curPage: 1, q: effectiveQ.value });
    lecturers.value = items;
    page.value = meta.current_page;
    lastPage.value = meta.last_page;
    total.value = meta.total;
  } catch (e) {
    notificationHandling('error', e?.message || 'Failed to load lecturers');
  } finally {
    initialLoading.value = false;
  }
}

async function gotoPage(p) {
  if (p < 1 || p > lastPage.value) return;
  try {
    loadingPage.value = true;
    const { items, meta } = await fetchLecturers({ curPage: p, q: effectiveQ.value });
    lecturers.value = items;
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
      effectiveQ.value = '';
      await loadFirstPage();
      return;
    }
    if (term.length >= MIN_SEARCH_CHARS) {
      if (term !== effectiveQ.value) {
        effectiveQ.value = term;
        await loadFirstPage();
      }
    }
  }, DEBOUNCE_MS);
}

async function clearSearch() {
  search.value = '';
  effectiveQ.value = '';
  await loadFirstPage();
  searchInputRef.value?.focus?.();
}

// ===== Navigation =====
function openDetails(lecturerId) {
  if (!lecturerId) return;
  if (router) router.push({ name: 'LecturerDetails', params: { lecturerId } });
  else window.location.href = `/lecturers/${encodeURIComponent(lecturerId)}`;
}

function goToAdd() {
  if (router) router.push({ name: 'AddLecturer' });
  else window.location.href = '/lecturers/add';
}

// ===== HID (USB keyboard) logic =====
function armHid() {
  if (hid.armed) return;
  hid.armed = true;
  hid.statusText = 'Waiting For Card';
  hid.buffer = '';
  hid.lastTick = 0;
  hid.remainingSec = 15;

  hid.countdownTimer = setInterval(() => {
    hid.remainingSec -= 1;
    if (hid.remainingSec <= 0) disarmHid();
  }, 1000);

  setTimeout(() => hidInputRef.value?.focus?.(), 30);
}

function disarmHid() {
  hid.armed = false;
  hid.statusText = 'idle';
  hid.buffer = '';
  if (hid.idleTimer) { clearTimeout(hid.idleTimer); hid.idleTimer = null; }
  if (hid.countdownTimer) { clearInterval(hid.countdownTimer); hid.countdownTimer = null; }
}

function onHidKeydown(e) {
  if (!hid.armed) return;

  const now = performance.now();
  const GAP_MS = 120;

  if (!hid.lastTick || now - hid.lastTick > GAP_MS * 3) {
    hid.buffer = '';
  }
  hid.lastTick = now;

  if (e.key === 'Enter') {
    finalizeHidBuffer();
    return;
  }

  if (/^\d$/.test(e.key)) {
    hid.statusText = 'reading…';
    hid.buffer += e.key;
  }

  if (hid.idleTimer) clearTimeout(hid.idleTimer);
  hid.idleTimer = setTimeout(() => finalizeHidBuffer(), GAP_MS * 4);
}

function finalizeHidBuffer() {
  if (!hid.buffer) return;
  const raw = hid.buffer.trim();
  const id = raw.replace(/\D+/g, '');
  hid.statusText = 'processing…';

  setTimeout(() => {
    disarmHid();
    openDetails(id);
  }, 150);
}

// ===== Lifecycle =====
onMounted(loadFirstPage);
onBeforeUnmount(disarmHid);
</script>

<style scoped>
.hover-row:hover { background: var(--falcon-table-hover, #f8f9fa); }

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1080;
}
.modal-card {
  width: min(560px, 92vw);
  background: var(--falcon-card-bg, #fff);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  padding: 16px 18px;
}
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.search-box .search-box-icon {
  width: 5px !important;
}
</style>
