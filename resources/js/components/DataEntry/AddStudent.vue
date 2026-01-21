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
          <li class="breadcrumb-item"><a href="/students">සිසු සීසුවියන්</a></li>
          <li class="breadcrumb-item active" aria-current="page">නව සිසු ඇතුලත් කිරීම</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>
        <!-- Header -->
        <div class="d-flex mb-3 mt-3 align-items-center justify-content-between">
          <div class="col">
            <h5 class="mb-0 text-primary position-relative">
              <span class="bg-201 dark__bg-1100 pe-3"><b>සිසුන් ඇතුලත් කරන්න</b></span>
              <span class="border position-absolute top-50 translate-middle-y w-75 z-n1"></span>
            </h5>
            <small class="text-muted" style="margin-left: 15px">
              කාඩ් අංකය <b>මුලින්</b>ම ස්කෑන් කර  සුරකින්න.
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
              <!-- Left: avatar & student/card id -->
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
                    <label class="form-label mb-1">සිසු/කාඩ් අංකය</label>
                    <div class="input-group">
                      <span class="input-group-text bg-100 border-200"><i class="fa fa-id-card"></i></span>
                      <input class="form-control" :value="studentId" readonly :class="{ 'is-invalid': errors.studentId }" />
                      <button type="button" class="btn btn-outline-primary" @click="armHidScan" :disabled="hid.armed">
                        <i class="fa fa-wifi-3"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback" v-if="errors.studentId">කරුණාකර කාඩ්පත ස්කෑන් කරන්න</div>
                    <small class="text-muted">
                      click <i class="fa fa-wifi-3"></i> Scan to fill. Required before saving.
                    </small>
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
                    <input class="form-control" v-model.trim="form.studentMobile" inputmode="tel" />
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
                    <label class="form-label">උපන්දිනය <span class="text-danger">*</span></label>
                    <input
                        type="date"
                        class="form-control"
                        :class="{ 'is-invalid': errors.birthdate }"
                        v-model="birthdateStr"
                        @change="updateAgeFromBirthdate"
                    />
                    <div class="invalid-feedback" v-if="errors.birthdate">උපන්දිනය අවශ්‍යයි</div>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">වයස</label>
                    <input class="form-control" :value="form.age" readonly />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">පාසල</label>
                    <input class="form-control" v-model.trim="form.school" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">ජා.හැ. අංකය</label>
                    <input class="form-control" v-model.trim="form.nic" />
                  </div>

                  <div class="col-12">
                    <label class="form-label">ලිපිනය</label>
                    <input class="form-control" v-model.trim="form.address" />
                  </div>

                  <div class="col-12">
                    <label class="form-label">භාරකරුවා කවුද? <span class="text-danger">*</span></label>
                    <div class="d-flex flex-wrap gap-3" :class="{ 'border rounded p-2 is-invalid': errors.guardianType }">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" id="g1" value="Mother" v-model="form.guardianType" />
                        <label class="form-check-label" for="g1">මව</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" id="g2" value="Father" v-model="form.guardianType" />
                        <label class="form-check-label" for="g2">පියා</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" id="g3" value="Other" v-model="form.guardianType" />
                        <label class="form-check-label" for="g3">වෙනත්</label>
                      </div>
                    </div>
                    <div class="invalid-feedback d-block" v-if="errors.guardianType">භාරකරුවා තෝරන්න</div>
                  </div>

                  <div class="col-12" v-if="form.guardianType === 'Other'">
                    <label class="form-label">භාරකරුවාගේ ඥාති සම්බන්ධතාවය</label>
                    <input class="form-control" v-model.trim="form.otherGuardianType" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">භාරකරුවාගේ නම <span class="text-danger">*</span></label>
                    <input
                        class="form-control"
                        v-model.trim="form.guardianName"
                        :class="{ 'is-invalid': errors.guardianName }"
                    />
                    <div class="invalid-feedback" v-if="errors.guardianName">භාරකරුවාගේ නම අවශ්‍යයි</div>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">භාරකරුවාගේ දුරකථන අංකය <span class="text-danger">*</span></label>
                    <input
                        class="form-control"
                        v-model.trim="form.guardianMobile"
                        inputmode="tel"
                        :class="{ 'is-invalid': errors.guardianMobile }"
                        placeholder="07XXXXXXXX"
                    />
                    <div class="invalid-feedback" v-if="errors.guardianMobile">
                      වලංගු දුරකථන අංකයක් ඇතුල් කරන්න
                    </div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">භාරකරුවාගේ ලිපිනය</label>
                    <input class="form-control" v-model.trim="form.guardianAddress" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">භාරකරුවාගේ රැකියාව</label>
                    <input class="form-control" v-model.trim="form.guardianOccupation" />
                  </div>

                  <!-- ========================= -->
                  <!-- NEW: Select classes here  -->
                  <!-- ========================= -->
                  <div class="col-12">
                    <label class="form-label">මෙම ශිෂ්‍යයා යොමුවිය යුතු පන්ති</label>
                    <small class="text-muted d-block mb-2">මෙමඟින් සිසුවා පන්ති වලට ඇතුලත් වේ</small>
                    <div class="border rounded p-2 bg-100" style="max-height: 210px; overflow-y: auto;">
                      <div v-if="classesLoading" class="small text-muted">
                        <i class="fa fa-spinner fa-spin me-1"></i> පන්ති ලෝඩ් වෙමින්...
                      </div>
                      <div v-else-if="allClasses.length === 0" class="small text-muted">පන්ති නොමැත.</div>
                      <div v-else class="row g-2">
                        <div
                            v-for="cls in allClasses"
                            :key="cls._id || cls.classId"
                            class="col-12 col-md-6"
                        >
                          <div class="form-check">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                :id="`cls_${cls.classId}`"
                                :value="cls.classId"
                                v-model="selectedClassIds"
                            />
                            <label class="form-check-label" :for="`cls_${cls.classId}`">
                              {{ cls.className }} <span class="text-muted small">({{ cls.grade }})</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- ========================= -->

                  <div class="col-12 d-grid gap-2 mt-2">
                    <button type="submit" class="btn btn-primary" :disabled="isSaving">
                      <span v-if="!isSaving">තහවුරු කරන්න</span>
                      <span v-else class="spinner-border spinner-border-sm"></span>
                    </button>
                  </div>

                  <div class="col-12" v-if="linkSuccessId">
                    <div class="alert alert-success d-flex align-items-center" role="alert">
                      <i class="fa fa-check-circle me-2"></i>
                      කාඩ් අංකය <b class="ms-1">{{ linkSuccessId }}</b> ලෙස සෙට් කළා
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardBody>
      </CardBody>
    </Card>

    <!-- HID Modal (focus hidden input) -->
    <transition name="fade">
      <div v-if="hid.armed" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0">Student Card Scan</h6>
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
const baseURL = inject('$baseURL');

// ===== new: classes state =====
const allClasses = ref([]);
const classesLoading = ref(false);
const selectedClassIds = ref([]); // user picks

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
  photoFile.value = null; photoPreview.value = ''; if (fileRef.value) fileRef.value.value = '';
}

// ===== Form state (+ validation flags) =====
const isSaving = ref(false);
const linkSuccessId = ref('');
const form = reactive({
  name: '',
  age: '',
  gender: '',
  studentMobile: '',
  birthdate: '',
  school: '',
  nic: '',
  address: '',
  guardianType: '',
  otherGuardianType: '',
  guardianName: '',
  guardianMobile: '',
  guardianAddress: '',
  guardianOccupation: '',
  image: '',
});

const errors = reactive({
  studentId: false,
  birthdate: false,
  guardianType: false,
  guardianName: false,
  guardianMobile: false,
});

const birthdateStr = computed({
  get: () => (form.birthdate ? form.birthdate.slice(0,10) : ''),
  set: (v) => form.birthdate = v ? new Date(v).toISOString() : '',
});

function updateAgeFromBirthdate(){
  try{
    if (!form.birthdate){ form.age = ''; return; }
    const today = new Date();
    const bd = new Date(form.birthdate);
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    form.age = String(age);
  }catch(_){ form.age = ''; }
}

// ===== StudentId from HID scan =====
const studentId = ref('');

// ===== Validation helpers =====
function validMobile(m){
  const digits = String(m || '').replace(/\D+/g,'');
  return digits.length >= 9;
}
function validateRequired(){
  errors.studentId = !studentId.value;
  errors.birthdate = !form.birthdate;
  errors.guardianType = !form.guardianType;
  errors.guardianName = !form.guardianName?.trim();
  errors.guardianMobile = !validMobile(form.guardianMobile);

  if (errors.studentId){ notificationHandling('error','කරුණාකර කාඩ්පත ස්කෑන් කරන්න'); return false; }
  if (errors.birthdate){ notificationHandling('error','උපන්දිනය අවශ්‍යයි'); return false; }
  if (errors.guardianType){ notificationHandling('error','භාරකරුවා තෝරන්න'); return false; }
  if (errors.guardianName){ notificationHandling('error','භාරකරුවාගේ නම අවශ්‍යයි'); return false; }
  if (errors.guardianMobile){ notificationHandling('error','වලංගු භාරකරුවාගේ දුරකථන අංකය ඇතුල් කරන්න'); return false; }
  return true;
}

// ===== load all classes when page open =====
async function loadAllClasses(){
  classesLoading.value = true;
  try{
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({
        collection: 'classes',
        attr: 'classId',
        filter_array: JSON.stringify([])
      })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const arr = Array.isArray(json_data?.value) ? json_data.value : [];
    // sort by name maybe
    arr.sort((a,b)=> (a.className||'').localeCompare(b.className||''));
    allClasses.value = arr;
  }catch(e){
    allClasses.value = [];
  }finally{
    classesLoading.value = false;
  }
}

// ===== Save student =====
async function onSubmit(){
  if (!validateRequired()) return;

  isSaving.value = true;
  linkSuccessId.value = '';
  let loader = $loading.show();
  try{
    let imageUrl = form.image;
    if (photoFile.value && !imageUrl){
      const {json_data} = await generalFileuploadAxiosRequest('SAFECARD','Students', photoFile.value,false,$loading);
      if (String(json_data.value || '').includes('Error:')){
        notificationHandling('error', json_data.value, 'Upload Error');
        isSaving.value = false; loader?.hide?.(); return;
      }
      imageUrl = `https://storage.googleapis.com/safeapp/Files/${json_data.value}`;
    }

    // 1) save student
    const payload = {
      url: `${baseURL}/api/v1/general-queries/addData`,
      data: JSON.stringify({
        collection: 'students',
        data: JSON.stringify({
          studentId: studentId.value,
          name: form.name,
          age: form.age,
          gender: form.gender,
          studentMobile: form.studentMobile,
          birthdate: form.birthdate,
          school: form.school,
          nic: form.nic,
          address: form.address,
          guardianType: form.guardianType,
          otherGuardianType: form.otherGuardianType,
          guardianName: form.guardianName,
          guardianMobile: form.guardianMobile,
          guardianAddress: form.guardianAddress,
          guardianOccupation: form.guardianOccupation,
          image: imageUrl || '',
          active: true,
        })
      })
    };

    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const saved = json_data?.value || json_data;

    if (saved && saved._id){
      // 2) if there are selected classes -> create class_has_students
      if (selectedClassIds.value.length){
        await linkStudentToClasses(saved, selectedClassIds.value);
      }

      notificationHandling('success', `සිසු අංකය: ${studentId.value} — සුරකිණි.`);
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

// ===== link student to selected classes =====
async function linkStudentToClasses(savedStudent, classIdList){
  // savedStudent = { _id, ... }
  // we also know studentId (from ref)
  for (const cid of classIdList){
    // find class object
    const cls = allClasses.value.find(c => String(c.classId) === String(cid));
    if (!cls) continue;

    const newRow = {
      classId: cls.classId,
      classOBJId: cls._id,
      className: cls.className,
      grade: cls.grade,
      studentId: studentId.value,
      studentOBJId: savedStudent._id,
      studentName: form.name || 'Student',
      guardianMobile: form.guardianMobile || '',
      studentImage: savedStudent.image || form.image || ''
    };

    const payload = {
      url: `${baseURL}/api/v1/general-queries/addData`,
      data: JSON.stringify({
        collection: 'class_has_students',
        data: JSON.stringify(newRow)
      })
    };
    // fire one by one (it’s okay because this is only at create time)
    try{
      await generalAxiosRequest('curl-requests/post', payload, false);
    }catch(_){
      // don’t break whole flow
    }
  }
}

function resetForm(){
  Object.assign(form, {
    name: '', age: '', gender: '', studentMobile: '', birthdate: '', school: '', nic: '', address: '',
    guardianType: '', otherGuardianType: '', guardianName: '', guardianMobile: '', guardianAddress: '', guardianOccupation: '', image: ''
  });
  photoFile.value = null; photoPreview.value='';
  studentId.value = '';
  selectedClassIds.value = [];   // reset selected classes
  linkSuccessId.value = '';
  Object.keys(errors).forEach(k => errors[k] = false);
}

// ===== HID scan =====
const hid = reactive({ armed:false, statusText:'Waiting For Card', buffer:'', lastTick:0, idleTimer:null, countdownTimer:null, remainingSec:0 });
const hidInputRef = ref(null);

// simple touch / mobile detect
const isTouch = typeof window !== 'undefined'
    ? ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    : false;

function armHidScan(){
  if (hid.armed) return;
  hid.armed = true; hid.statusText='Waiting For Card'; hid.buffer=''; hid.lastTick=0; hid.remainingSec=15;
  hid.countdownTimer = setInterval(()=>{ hid.remainingSec -= 1; if (hid.remainingSec<=0) disarmHid(); }, 1000);
  // DESKTOP: focus hidden input so HID keyboard can type into it
  if (!isTouch) {
    setTimeout(() => hidInputRef.value?.focus?.(), 30);
  } else {
    // MOBILE / TOUCH: attach global keydown so no keyboard opens
    document.addEventListener('keydown', onHidKeydown, { passive: false });
  }
}
function disarmHid(){
  hid.armed=false; hid.statusText='idle'; hid.buffer='';
  if (hid.idleTimer){ clearTimeout(hid.idleTimer); hid.idleTimer=null; }
  if (hid.countdownTimer){ clearInterval(hid.countdownTimer); hid.countdownTimer=null; }

  // remove global listener on touch
  if (isTouch) {
    document.removeEventListener('keydown', onHidKeydown, { passive: false });
  }
}
function onHidKeydown(e){
  if (!hid.armed) return;

  // prevent mobile from opening keyboard / scroll
  if (isTouch) {
    e.preventDefault?.();
    e.stopPropagation?.();
  }


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
    const checkPayload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({
        collection:'students',
        attr:'studentId',
        filter_array: JSON.stringify([id])
      })
    };
    const { json_data:checkRes } = await generalAxiosRequest('curl-requests/post', checkPayload, false);
    const arr = Array.isArray(checkRes?.value) ? checkRes.value : (Array.isArray(checkRes) ? checkRes : []);
    if (arr.length){
      notificationHandling('error','මෙම කාඩ් අංකය දැනටමත් වෙනත් සිසුවෙකුට සම්බන්ධයි.');
      disarmHid();
      return;
    }
  }catch(_){}
  studentId.value = id;
  linkSuccessId.value = id;
  errors.studentId = false;
  notificationHandling('success','කාඩ්පත හඳුනා ගත්තා.');
  disarmHid();
}

onMounted(()=>{
  loadAllClasses();
});
</script>

<style scoped>
.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1080; }
.modal-card { width: min(560px,92vw); background: var(--falcon-card-bg,#fff); border-radius: 12px; border:1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15); padding:16px 18px; }
.fade-enter-active,.fade-leave-active{ transition: opacity .15s ease; } .fade-enter-from,.fade-leave-to{ opacity: 0; }
.object-fit-cover{ object-fit: cover; }
.is-invalid{ border-color: #dc3545 !important; }
</style>
