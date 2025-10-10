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
          <li class="breadcrumb-item active" aria-current="page">අද පංති</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>
        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 class="mb-0 text-primary position-relative">
              <span class="bg-201 dark__bg-1100 pe-3">
                <b>අද පංති ලැයිස්තුව</b>
              </span>
              <span class="border position-absolute top-50 translate-middle-y w-75 z-n1"></span>
            </h5>
            <small class="text-muted ms-2">
              දිනය: <b>{{ todaySinhala }}</b> • අවශ්‍ය පංති කිහිපයක් , වගුවේ තීරු select කිරීමෙන් තෝරන්න
            </small>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary" @click="refresh" :disabled="loading">
              <i class="fa fa-rotate me-1"></i> Refresh
            </button>
          </div>
        </div>

        <!-- Search & selection info -->
        <div class="row g-2 align-items-center mb-3">
          <div class="col-12 col-md-7">
            <div class="row">
              <div class="col-12 col-md-7">
                <div class="search-box">
                  <form class="position-relative">
                    <input
                        class="form-control search-input"
                        type="search"
                        :placeholder="'පංති අංකය/නමෙන් සොයන්න'"
                        v-model="search"
                        @input="onSearchInput"
                        ref="searchRef"
                    />
                    <span class="fas fa-search search-box-icon"></span>
                  </form>
                </div>
                <small class="text-muted">අඩුම අක්ෂර {{ MIN_SEARCH_CHARS }} යි.</small>
              </div>
              <div class="col-12 col-md-5 mt-2 mt-md-0">
                <div class="badge rounded-pill bg-200 text-dark me-2">
                  Total: {{ allToday.length }}
                </div>
                <div class="badge rounded-pill bg-primary text-white">
                  Selected: {{ selectedCount }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-5 d-flex justify-content-md-end mt-2 mt-md-0">
            <button
                class="btn btn-success"
                :disabled="!selectedCount"
                @click="proceedToAttendance"
            >
              <i class="fa fa-check-double me-2"></i>
              Attendance Mark කරන්න ({{ selectedCount }})
            </button>
          </div>
        </div>

        <!-- List -->
        <div class="table-responsive">
          <table class="table table-striped table-bordered align-middle mb-0">
            <thead class="bg-200">
            <tr>
<!--              <th style="width:44px"></th>-->
              <th>පංති නාමය</th>
              <th>ශ්‍රේණිය</th>
              <th>ගුරුතුමා/තුමී</th>
              <th>ඊළඟ වේලාව</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-4">
                <div class="spinner-border spinner-border-sm" role="status" />
                <span class="ms-2 text-muted">Loading today’s classes…</span>
              </td>
            </tr>
            <tr v-else-if="!filtered.length">
              <td colspan="5" class="text-center py-4 text-muted">
                <i class="fa fa-calendar-xmark me-2" /> No classes found for {{ todaySinhala }}
              </td>
            </tr>

            <tr
                v-for="(c, i) in filtered"
                :key="c.classId || i"
                :class="['hover-row', isSelected(c.classId) ? 'table-primary' : '']"
                @click="toggle(c)"
                style="cursor:pointer"
            >
<!--              <td class="text-center">-->
<!--                <input-->
<!--                    class="form-check-input"-->
<!--                    type="checkbox"-->
<!--                    :checked="isSelected(c.classId)"-->
<!--                    @change.prevent="toggle(c)"-->
<!--                />-->
<!--              </td>-->
              <td class="fw-semibold">
                {{ c.className || '—' }}
                <span class="badge bg-100 text-dark border ms-2">{{ c.classId }}</span>
              </td>
              <td>{{ c.grade || '—' }}</td>
              <td>{{ c.lecturerName || '—' }}</td>
              <td>
                  <span class="badge rounded-pill bg-info text-dark">
                    {{ nextTimeOf(c) }}
                  </span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer action (mobile friendly) -->
        <div class="d-flex align-items-center justify-content-between mt-3">
          <div class="small text-muted">
            Showing {{ filtered.length }} of {{ allToday.length }}
          </div>
          <button
              class="btn btn-success"
              :disabled="!selectedCount"
              @click="proceedToAttendance"
          >
            <i class="fa fa-check-double me-2"></i>
            Attendance Mark කරන්න ({{ selectedCount }})
          </button>
        </div>
      </CardBody>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import Card from "../bootstrap/Card.vue";
import CardBody from "../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";
import notificationHandling from "../../composables/application/notificationHandling";

// ===== Injects =====
const $loading = inject('$loading');
const baseURL = inject('$baseURL');
const router  = inject('$router', null);

// ===== Constants =====
const MIN_SEARCH_CHARS = 3;
const DEBOUNCE_MS = 600;
const SINHALA_DAYS = ["ඉරිදා","සඳුදා","අඟහරුවාදා","බදාදා","බ්‍රහස්පතින්දා","සිකුරාදා","සෙනසුරාදා"];

// ===== Helpers =====
function todaySinhalaDay(){
  return SINHALA_DAYS[new Date().getDay()];
}

// quick display of next time from schedule for today
function extractTodayTime(schedule){
  const today = todaySinhalaDay();
  const row = (schedule || []).find(s => s?.day === today);
  return row?.time || '';
}

// ===== State =====
const todaySinhala = ref(todaySinhalaDay());
const loading = ref(false);
const allToday = ref([]);              // raw list from server
const search = ref('');
let searchTimer = null;
const searchRef = ref(null);

// Set for O(1) selection checks
const selected = ref(new Set());

// ===== Computed =====
const filtered = computed(() => {
  const q = (search.value || '').trim().toLowerCase();
  if (!q || q.length < MIN_SEARCH_CHARS) return allToday.value;
  return allToday.value.filter(c => {
    const name = (c.className || '').toLowerCase();
    const lec  = (c.lecturerName || '').toLowerCase();
    const id   = (c.classId || '').toLowerCase();
    return name.includes(q) || lec.includes(q) || id.includes(q);
  });
});
const selectedCount = computed(() => selected.value.size);

// ===== UI helpers =====
function isSelected(classId){ return selected.value.has(String(classId)); }
function toggle(cls){
  const id = String(cls.classId || '');
  if (!id) return;
  if (selected.value.has(id)) selected.value.delete(id);
  else selected.value.add(id);
}

function nextTimeOf(c){ return extractTodayTime(c.schedule) || '—'; }

// ===== Actions =====
async function fetchTodayClasses(){
  loading.value = true;
  const loader = $loading?.show?.();
  try{
    const payload = {
      url: `${baseURL}/api/v1/general-queries/queryCollection`,
      data: JSON.stringify({
        collection: 'classes',
        payload: JSON.stringify([{ field:'schedule.day', operator:'=', value: todaySinhala.value }]),
      })
    };
    const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);
    allToday.value = json_data.value && json_data.value.length ? json_data.value : []``;
  }catch(e){
    notificationHandling('error', e?.message || 'Failed to load today’s classes');
  }finally{
    loader?.hide?.();
    loading.value = false;
  }
}

function onSearchInput(){
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    // nothing else to do, 'filtered' reacts automatically
  }, DEBOUNCE_MS);
}

async function refresh(){
  todaySinhala.value = todaySinhalaDay();
  await fetchTodayClasses();
}

function proceedToAttendance(){
  const ids = Array.from(selected.value);
  if (!ids.length) return;
  // Prefer named route if available
  if (router){
    router.push({ name: 'AttendanceMarking', query: { classIds: ids.join(',') } });
  }else{
    const q = encodeURIComponent(ids.join(','));
    window.location.href = `/attendance/mark?classIds=${q}`;
  }
}

// ===== Lifecycle =====
onMounted(async () => {
  await fetchTodayClasses();
  searchRef.value?.focus?.();
});
</script>

<style scoped>
.hover-row:hover { background: var(--falcon-table-hover, #f8f9fa); }
.search-box .search-box-icon { width: 5px !important; }
</style>
