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
          <li class="breadcrumb-item"><a href="/lecturers">ගුරු මහත්ම/මහත්මීන්</a></li>
          <li class="breadcrumb-item active" aria-current="page">නව ගුරුවරයෙකු</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>
        <!-- Header -->
        <div class="d-flex mb-3 mt-3 align-items-center justify-content-between">
          <div class="col">
            <h5 class="mb-0 text-primary position-relative">
              <span class="bg-201 dark__bg-1100 pe-3"><b>ගුරුවරුන් ඇතුලත් කරන්න</b></span>
              <span class="border position-absolute top-50 translate-middle-y w-75 z-n1"></span>
            </h5>
            <small class="text-muted" style="margin-left: 15px">
              <b>මුලින්ම</b> කාඩ් අංකය ස්කෑන් කර සුරකින්න.
            </small>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-falcon-warning d-flex align-items-center" @click="armHidScan" :disabled="hid.armed">
              <i class="fa fa-wifi me-2"></i>
              <span v-if="!hid.armed">Scan Card</span>
              <span v-else>Listening… {{ hid.remainingSec }}s</span>
            </button>
            <button class="btn btn-danger" @click="resetForm">
              <i class="fa fa-broom me-1"></i> Clear
            </button>
          </div>
        </div>

        <CardBody>
          <form @submit.prevent="onSubmit">
            <div class="row g-3">
              <!-- Left: avatar & lecturer/card id -->
              <div class="col-12 col-lg-4">
                <div class="card shadow-none border-200">
                  <div class="card-body text-center">
                    <div class="position-relative d-inline-block mb-2">
                      <img v-if="photoPreview" :src="photoPreview" class="rounded-circle border object-fit-cover" style="width:110px;height:110px;" alt="avatar" />
                      <div v-else class="rounded-circle d-flex align-items-center justify-content-center bg-200 text-700" style="width:110px;height:110px;">
                        <i class="fa fa-user fa-2x"></i>
                      </div>
                    </div>

                    <div class="d-grid gap-2 mt-2">
                      <label class="btn btn-sm btn-falcon-info mb-0">
                        <i class="fa fa-image me-1"></i> ගැලරියෙන් තෝරන්න
                        <input ref="fileRef" type="file" accept="image/*" class="d-none" @change="onPickFile" />
                      </label>
                      <button type="button" class="btn btn-sm btn-outline-secondary" @click="removePhoto" :disabled="!photoPreview">
                        <i class="fa fa-times me-1"></i> ඉවත් කරන්න
                      </button>
                    </div>

                    <hr />
                    <label class="form-label mb-1">Lecturer/Card ID</label>
                    <div class="input-group">
                      <span class="input-group-text bg-100 border-200"><i class="fa fa-id-card"></i></span>
                      <input class="form-control" :value="lecturerId" readonly :class="{ 'is-invalid': idError }" />
                      <button type="button" class="btn btn-outline-primary" @click="armHidScan" :disabled="hid.armed">
                        <i class="fa fa-wifi-3"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback" v-if="idError">කරුණාකර කාඩ්පත ස්කෑන් කරන්න</div>
                    <small class="text-muted">Scan to fill. Card is <b>required</b> before saving.</small>

                    <div v-if="linkSuccessId" class="alert alert-success mt-2 py-2">
                      <i class="fa fa-check-circle me-1"></i> සම්බන්ධ කළා: <b>{{ linkSuccessId }}</b>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: form fields -->
              <div class="col-12 col-lg-8">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">නම</label>
                    <input class="form-control" v-model.trim="form.name" required placeholder="නම" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">දුරකථන අංකය</label>
                    <input class="form-control" v-model.trim="form.lecturerMobile" inputmode="tel" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">ස්ත්‍රී/පුරුෂ භාවය</label>
                    <select class="form-select" v-model="form.gender">
                      <option value="">— තෝරන්න —</option>
                      <option value="Male">පිරිමි</option>
                      <option value="Female">ගැහැනු</option>
                    </select>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">උපන්දිනය</label>
                    <input type="date" class="form-control" v-model="birthdateStr" @change="updateAgeFromBirthdate" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">වයස</label>
                    <input class="form-control" :value="form.age" readonly />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">ජා.හැ. අංකය</label>
                    <input class="form-control" v-model.trim="form.nic" />
                  </div>

                  <div class="col-12">
                    <label class="form-label">ලිපිනය</label>
                    <input class="form-control" v-model.trim="form.address" />
                  </div>

                  <div class="col-12 d-grid gap-2 mt-2">
                    <button type="submit" class="btn btn-primary" :disabled="isSaving">
                      <span v-if="!isSaving">තහවුරු කරන්න</span>
                      <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
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
import { ref, reactive, computed, onMounted, inject } from 'vue';
import Card from "../bootstrap/Card.vue";
import CardBody from "../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";
import generalFileuploadAxiosRequest from "../../composables/application/generalFileuploadAxiosRequest";
import notificationHandling from "../../composables/application/notificationHandling";

const $loading = inject('$loading');
const baseURL  = inject('$baseURL');

// ===== Photo state =====
const fileRef = ref(null);
const photoFile = ref(null);
const photoPreview = ref('');
function onPickFile(e){
  const f = e.target.files?.[0];
  if (!f) return;
  photoFile.value = f;
  const reader = new FileReader();
  reader.onload = () => (photoPreview.value = reader.result);
  reader.readAsDataURL(f);
}
function removePhoto(){
  photoFile.value = null; photoPreview.value = ''; fileRef.value && (fileRef.value.value = '');
}

// ===== Form state =====
const isSaving = ref(false);
const linkSuccessId = ref('');
const idError = ref(false);

const form = reactive({
  lecturerId: '',      // filled by HID
  name: '',
  age: '',
  gender: '',
  lecturerMobile: '',
  birthdate: new Date().toISOString(),
  nic: '',
  address: '',
  image: '',
  active: true
});

const birthdateStr = computed({
  get: () => form.birthdate?.slice(0,10),
  set: (v) => form.birthdate = v ? new Date(v).toISOString() : new Date().toISOString(),
});

function updateAgeFromBirthdate(){
  try{
    const t = new Date(); const b = new Date(form.birthdate);
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    form.age = String(a);
  }catch(_){ form.age = ''; }
}

// Show-only mirror of lecturerId
const lecturerId = computed(()=> form.lecturerId);

// ===== Save lecturer (requires card id) =====
async function onSubmit(){
  idError.value = !form.lecturerId;
  if (!form.lecturerId){
    notificationHandling('error','කරුණාකර කාඩ්පත ස්කෑන් කරන්න');
    return;
  }

  isSaving.value = true;
  linkSuccessId.value = '';
  const loader = $loading?.show?.();
  try{
    // (extra safety) collision check again before saving
    const checkPayload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({ collection:'lecturers', attr:'lecturerId', filter_array: JSON.stringify([form.lecturerId]) })
    };
    const { json_data:existing } = await generalAxiosRequest('curl-requests/post', checkPayload, false);
    const arr = Array.isArray(existing?.value) ? existing.value : (Array.isArray(existing)? existing : []);
    if (arr.length){
      notificationHandling('error','මෙම කාඩ් අංකය දැනටමත් වෙනත් ගුරුවරයෙකුට සම්බන්ධයි.');
      isSaving.value = false; loader?.hide?.(); return;
    }

    let imageUrl = form.image;
    if (photoFile.value && !imageUrl){
      const file = { name: `lecturer_${form.lecturerId}.jpg`, type: photoFile.value.type || 'image/jpeg', uri: photoFile.value };
      const {json_data }= await generalFileuploadAxiosRequest('SMARTTUTER','Lecturers', photoFile.value,false,$loading);
      if (String(json_data.value || '').includes('Error:')){
        notificationHandling('error', json_data.value, 'Upload Error');
        isSaving.value = false; loader?.hide?.(); return;
      }
      imageUrl = `https://storage.googleapis.com/safeapp/Files/${json_data.value}`;
    }

    const payload = {
      url: `${baseURL}/api/v1/general-queries/addData`,
      data: JSON.stringify({
        collection: 'lecturers',
        data: JSON.stringify({
          lecturerId: form.lecturerId,
          name: form.name,
          age: form.age,
          gender: form.gender,
          lecturerMobile: form.lecturerMobile,
          birthdate: form.birthdate,
          nic: form.nic,
          address: form.address,
          image: imageUrl || '',
          active: true
        })
      })
    };

    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const saved = json_data?.value || json_data;
    if (saved && saved._id){
      notificationHandling('success', `ගුරු අංකය: ${form.lecturerId} — සුරකිණි.`);
      resetForm();
    } else {
      notificationHandling('error','දත්ත සුරැකීම අසාර්ථකයි');
    }
  }catch(e){
    notificationHandling('error', e?.message || 'දත්ත සුරැකීමේ දෝෂයක්');
  }finally{
    isSaving.value = false; loader?.hide?.();
  }
}

function resetForm(){
  Object.assign(form, {
    lecturerId:'', name:'', age:'', gender:'', lecturerMobile:'', birthdate:new Date().toISOString(),
    nic:'', address:'', image:'', active:true
  });
  photoFile.value = null; photoPreview.value='';
  linkSuccessId.value = '';
  idError.value = false;
}

// ===== HID (USB keyboard) scanning =====
const hid = reactive({ armed:false, statusText:'Waiting For Card', buffer:'', lastTick:0, idleTimer:null, countdownTimer:null, remainingSec:0 });
const hidInputRef = ref(null);

function armHidScan(){
  if (hid.armed) return;
  hid.armed = true; hid.statusText='Waiting For Card'; hid.buffer=''; hid.lastTick=0; hid.remainingSec=15;
  hid.countdownTimer = setInterval(()=>{ hid.remainingSec -= 1; if (hid.remainingSec<=0) disarmHid(); }, 1000);
  setTimeout(()=>hidInputRef.value?.focus?.(),30);
}
function disarmHid(){
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
  if (e.key === 'Enter'){ finalizeHid(); return; }
  if (/^\d$/.test(e.key)){ hid.statusText='reading…'; hid.buffer += e.key; }
  if (hid.idleTimer) clearTimeout(hid.idleTimer);
  hid.idleTimer = setTimeout(()=>finalizeHid(), GAP_MS*4);
}
async function finalizeHid(){
  if (!hid.buffer) return;
  const id = hid.buffer.replace(/\D+/g,'');
  hid.statusText='processing…';

  try{
    // collision check before accepting
    const checkPayload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({ collection:'lecturers', attr:'lecturerId', filter_array: JSON.stringify([id]) })
    };
    const { json_data:checkRes } = await generalAxiosRequest('curl-requests/post', checkPayload, false);
    const arr = Array.isArray(checkRes?.value) ? checkRes.value : (Array.isArray(checkRes) ? checkRes : []);
    if (arr.length){
      notificationHandling('error','මෙම කාඩ් අංකය දැනටමත් වෙනත් ගුරුවරයෙකුට සම්බන්ධයි.');
      disarmHid();
      return;
    }
  }catch(_){}

  form.lecturerId = id;
  linkSuccessId.value = id;
  idError.value = false;
  notificationHandling('success','කාඩ්පත හඳුනා ගත්තා.');
  disarmHid();
}

onMounted(()=>{ updateAgeFromBirthdate(); });
</script>

<style scoped>
.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1080; }
.modal-card { width: min(560px,92vw); background: var(--falcon-card-bg,#fff); border-radius: 12px; border:1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15); padding:16px 18px; }
.fade-enter-active,.fade-leave-active{ transition: opacity .15s ease; } .fade-enter-from,.fade-leave-to{ opacity: 0; }
.object-fit-cover{ object-fit: cover; }
.is-invalid{ border-color: #dc3545; }
</style>
