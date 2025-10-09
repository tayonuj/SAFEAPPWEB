<template>
  <div class="container">
    <!-- Breadcrumb -->
    <div class="mt-3 mb-4">
      <nav
          style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);"
          aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
          <li class="breadcrumb-item"><a href="/classes">පංති</a></li>
          <li class="breadcrumb-item active" aria-current="page">නව පංතියක්</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>
        <!-- Header -->
        <div class="d-flex mb-3 mt-3 align-items-center justify-content-between">
          <div class="col">
            <h5 class="mb-0 text-primary position-relative">
              <span class="bg-201 dark__bg-1100 pe-3"><b>පන්ති තොරතුරු</b></span>
              <span class="border position-absolute top-50 translate-middle-y w-75 z-n1"></span>
            </h5>
            <small class="text-muted ms-2">මුලින්ම ගුරු කාඩ්පත scan කර lecturer සම්බන්ධ කරන්න.</small>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-falcon-warning d-flex align-items-center" @click="armLecturerScan" :disabled="hid.armed">
              <i class="fa fa-wifi me-2"></i>
              <span v-if="!hid.armed">Scan Lecturer</span>
              <span v-else>Listening… {{ hid.remainingSec }}s</span>
            </button>
            <button class="btn btn-outline-secondary" @click="resetForm">
              <i class="fa fa-broom me-1"></i> Clear
            </button>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit">
          <div class="row g-3">
            <!-- Left: meta -->
            <div class="col-12 col-lg-4">
              <div class="card shadow-none border-200">
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Class ID</label>
                    <div class="input-group">
                      <span class="input-group-text bg-100 border-200"><i class="fa fa-hashtag"></i></span>
                      <input class="form-control" :value="classId" readonly />
                      <button type="button" class="btn btn-outline-secondary" @click="regenClassId">
                        <i class="fa fa-sync"></i>
                      </button>
                    </div>
                    <small class="text-muted">අංකය වෙනස් කිරීමට අවශ්‍යනම් නැවත සකසන්න.</small>
                  </div>

                  <hr>

                  <label class="form-label mb-1">ගුරු කාඩ්පත් අංකය</label>
                  <div class="input-group">
                    <span class="input-group-text bg-100 border-200"><i class="fa fa-id-card"></i></span>
                    <input class="form-control" :value="lecturer.lecturerId || ''" readonly :class="{ 'is-invalid': lecError }" />
                    <button type="button" class="btn btn-outline-primary" @click="armLecturerScan" :disabled="hid.armed">
                      <i class="fa fa-wifi-3"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback" v-if="lecError">කරුණාකර ගුරු කාඩ්පත scan කරන්න</div>

                  <div v-if="lecturer.name" class="d-flex align-items-center gap-2 mt-2">
                    <img v-if="lecturer.image" :src="lecturer.image" class="rounded-circle object-fit-cover" style="width:46px;height:46px;border:1px solid #e5e7eb" />
                    <div v-else class="rounded-circle d-flex align-items-center justify-content-center bg-200 text-700" style="width:46px;height:46px;">
                      <i class="fa fa-user"></i>
                    </div>
                    <div>
                      <div class="fw-semibold">{{ lecturer.name }}</div>
                      <small class="text-muted">{{ lecturer.lecturerId }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: fields -->
            <div class="col-12 col-lg-8">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">පංති නම</label>
                  <input class="form-control" v-model.trim="form.className" required placeholder="e.g. Physics" />
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">ශ්‍රේණිය</label>
                  <input class="form-control" v-model.trim="form.grade" required placeholder="e.g. Grade 11" />
                </div>

                <div class="col-12">
                  <label class="form-label">ගුරු</label>
                  <input class="form-control" :value="lecturer.name || ''" placeholder="Scan කර ස්වයංක්‍රීයව පුරවයි" readonly />
                </div>

                <!-- Schedule -->
                <div class="col-12">
                  <label class="form-label">සතියේ දිනයන් + වේලාව</label>
                  <div class="row g-2">
                    <div class="col-12">
                      <div class="d-flex flex-wrap gap-2">
                        <button
                            v-for="d in DAYS"
                            :key="d"
                            type="button"
                            class="btn btn-sm"
                            :class="selectedDays.has(d) ? 'btn-primary' : 'btn-outline-primary'"
                            @click="toggleDay(d)"
                        >
                          {{ d }}
                        </button>
                      </div>
                    </div>

                    <div class="col-12" v-if="selectedDays.size">
                      <div class="table-responsive">
                        <table class="table table-sm align-middle mb-0">
                          <thead class="bg-200">
                          <tr>
                            <th style="width:180px">දිනය</th>
                            <th style="width:220px">වේලාව</th>
                            <th></th>
                          </tr>
                          </thead>
                          <tbody>
                          <tr v-for="d in [...selectedDays]" :key="d">
                            <td class="fw-semibold">{{ d }}</td>
                            <td>
                              <input type="time" class="form-control" v-model="timePerDay[d]" />
                            </td>
                            <td class="text-end">
                              <button class="btn btn-sm btn-outline-danger" type="button" @click="removeDay(d)">
                                <i class="fa fa-times"></i>
                              </button>
                            </td>
                          </tr>
                          </tbody>
                        </table>
                      </div>
                      <small class="text-muted">අවම වශයෙන් දිනයක් වත් සහිත විය යුතුය.</small>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label">පන්ති ගාස්තුව (විකල්ප)</label>
                  <input class="form-control" v-model.number="form.classFee" type="number" min="0" step="1" placeholder="e.g. 1500" />
                </div>

                <div class="col-12 d-grid gap-2 mt-2">
                  <button type="submit" class="btn btn-primary">
                    සුරකින්න
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>

    <!-- HID Modal for lecturer scan -->
    <transition name="fade">
      <div v-if="hid.armed" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0">Lecturer Card Scan</h6>
            <button class="btn btn-sm btn-link" @click="disarmLecturerScan"><i class="fa fa-times"></i></button>
          </div>
          <div class="mt-2 small text-muted">Tap a card on the reader. Listening for input…</div>
          <div class="mt-3 p-3 bg-100 rounded border d-flex align-items-center">
            <i class="fa fa-nfc-signal fs-4 me-2"></i>
            <div>
              <div class="fw-semibold">Status: <span class="text-primary">{{ hid.statusText }}</span></div>
              <div class="small text-muted">Auto-closes in {{ hid.remainingSec }}s</div>
            </div>
          </div>

          <input ref="hidInputRef" type="text" class="visually-hidden" autocomplete="off" @keydown.prevent="onHidKeydown" />

          <div class="mt-3 d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary btn-sm" @click="disarmLecturerScan">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import Card from "../bootstrap/Card.vue";
import CardBody from "../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";
import notificationHandling from "../../composables/application/notificationHandling";

const $loading = inject('$loading');
const baseURL = inject('$baseURL');
const router = inject('$router', null);

// Sinhala days (same order used in mobile)
const DAYS = ['සඳුදා','අඟහරුවාදා','බදාදා','බ්‍රහස්පතින්දා','සිකුරාදා','සෙනසුරාදා','ඉරිදා'];

// ===== form state =====
const classId = ref('');
const form = reactive({
  className: '',
  grade: '',
  classFee: null,
});
const lecturer = reactive({
  lecturerId: '',
  name: '',
  image: ''
});

const selectedDays = reactive(new Set());
const timePerDay = reactive({}); // { [day]: 'HH:mm' }

const lecError = ref(false);

// ===== HID (USB keyboard) for lecturer scan =====
const hid = reactive({ armed:false, statusText:'Waiting For Card', buffer:'', lastTick:0, idleTimer:null, countdownTimer:null, remainingSec:0 });
const hidInputRef = ref(null);

function armLecturerScan(){
  if (hid.armed) return;
  hid.armed = true; hid.statusText='Waiting For Card'; hid.buffer=''; hid.lastTick=0; hid.remainingSec=15;
  hid.countdownTimer = setInterval(()=>{ hid.remainingSec -= 1; if (hid.remainingSec<=0) disarmLecturerScan(); }, 1000);
  setTimeout(()=>hidInputRef.value?.focus?.(),30);
}
function disarmLecturerScan(){
  hid.armed=false; hid.statusText='idle'; hid.buffer='';
  if (hid.idleTimer){ clearTimeout(hid.idleTimer); hid.idleTimer=null; }
  if (hid.countdownTimer){ clearInterval(hid.countdownTimer); hid.countdownTimer=null; }
}
function onHidKeydown(e){
  if (!hid.armed) return;
  const now = performance.now();
  const GAP_MS = 120;
  if (!hid.lastTick || now - hid.lastTick > GAP_MS*3) hid.buffer='';
  hid.lastTick = now;
  if (e.key === 'Enter'){ finalizeLecturerScan(); return; }
  if (/^\d$/.test(e.key)){ hid.statusText='reading…'; hid.buffer += e.key; }
  if (hid.idleTimer) clearTimeout(hid.idleTimer);
  hid.idleTimer = setTimeout(()=>finalizeLecturerScan(), GAP_MS*4);
}
async function finalizeLecturerScan(){
  if (!hid.buffer) return;
  const id = hid.buffer.replace(/\D+/g,'');
  hid.statusText='processing…';

  try{
    // lookup lecturer
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({ collection:'lecturers', attr:'lecturerId', filter_array: JSON.stringify([id]) })
    };
    const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);
    const arr = Array.isArray(json_data?.value) ? json_data.value : (Array.isArray(json_data) ? json_data : []);
    if (!arr.length){
      notificationHandling('error', 'මෙම කාඩ් අංකයට ගුරු තොරතුරු සොයාගත නොහැක.');
      disarmLecturerScan();
      return;
    }
    const lec = arr[0] || {};
    lecturer.lecturerId = id;
    lecturer.name = lec.name || '';
    lecturer.image = lec.image || '';
    lecError.value = false;
    notificationHandling('success', 'ගුරුවරයා සම්බන්ධ කළා.');
  }catch(e){
    notificationHandling('error', e?.message || 'Lookup failed');
  }finally{
    disarmLecturerScan();
  }
}

// ===== schedule helpers =====
function toggleDay(d){
  if (selectedDays.has(d)) {
    selectedDays.delete(d);
    delete timePerDay[d];
  } else {
    selectedDays.add(d);
    if (!timePerDay[d]) timePerDay[d] = '';
  }
}
function removeDay(d){
  selectedDays.delete(d);
  delete timePerDay[d];
}

// ===== submit =====
async function onSubmit(){
  // validations
  lecError.value = !lecturer.lecturerId;
  if (!form.className?.trim() || !form.grade?.trim() || lecError.value || selectedDays.size === 0){
    notificationHandling('error','කරුණාකර අවශ්‍ය සියලුම තොරතුරු පුරවන්න (ගුරු scan, පංති නම, ශ්‍රේණිය, දිනයක් වත්).');
    return;
  }

  const schedule = [...selectedDays].map(d => ({ day: d, time: (timePerDay[d] || '').trim() }));

  const loader = $loading?.show?.();
  try{
    const payload = {
      url: `${baseURL}/api/v1/general-queries/addData`,
      data: JSON.stringify({
        collection: 'classes',
        data: JSON.stringify({
          classId: classId.value,
          className: form.className,
          grade: form.grade,
          lecturerName: lecturer.name,
          lecturerImage: lecturer.image || '',
          lecturerId: lecturer.lecturerId,
          schedule,
          classFee: form.classFee ?? null,
        })
      })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const saved = json_data?.value || json_data;
    if (saved){
      notificationHandling('success','පන්ති තොරතුරු සුරැකුණා!');
      resetForm();
      regenClassId();
    }else{
      notificationHandling('error','සුරැකීම අසාර්ථකයි');
    }
  }catch(e){
    notificationHandling('error', e?.message || 'දත්ත සුරැකීමේ දෝෂයක්');
  }finally{
    loader?.hide?.();
  }
}

function resetForm(){
  form.className = '';
  form.grade = '';
  form.classFee = null;
  lecturer.lecturerId=''; lecturer.name=''; lecturer.image='';
  [...selectedDays].forEach(d => selectedDays.delete(d));
  Object.keys(timePerDay).forEach(k => delete timePerDay[k]);
  lecError.value = false;
}

// ===== id generation =====
function regenClassId(){
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4,'0');
  classId.value = `CLS${timestamp}${random}`;
}

// ===== lifecycle =====
onMounted(()=>{ regenClassId(); });
</script>

<style scoped>
.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1080; }
.modal-card { width: min(560px,92vw); background: var(--falcon-card-bg,#fff); border-radius: 12px; border:1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15); padding:16px 18px; }
.fade-enter-active,.fade-leave-active{ transition: opacity .15s ease; } .fade-enter-from,.fade-leave-to{ opacity: 0; }
.object-fit-cover{ object-fit: cover; }
.is-invalid{ border-color: #dc3545; }
</style>
