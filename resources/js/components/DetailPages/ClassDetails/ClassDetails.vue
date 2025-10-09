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
          <li class="breadcrumb-item"><a href="/classes">පංති</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ className || 'පන්ති විස්තර' }}</li>
        </ol>
      </nav>
    </div>

    <Card>
      <CardBody>
        <CardBody>
          <!-- Header -->
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-5">
              <div class="avatar avatar-2xl">
                <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center" style="width:54px;height:54px;">
                  <span class="text-white fw-bold">{{ (className || 'C').charAt(0) }}</span>
                </div>
              </div>
              <div>
                <h5 class="mb-0">{{ className || '—' }} - {{ grade }}</h5>
                <div class="text-muted small">Class ID: <span class="badge bg-100 text-dark border">{{ classId }}</span></div>
              </div>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary" @click="goBack"><i class="fa fa-arrow-left me-1"></i> Back</button>
              <button class="btn" :class="editing ? 'btn-warning' : 'btn-primary'" @click="toggleEdit">
                <i :class="editing ? 'fa fa-times me-1' : 'fa fa-pen me-1'"></i>
                {{ editing ? 'Cancel' : 'Edit' }}
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <ul class="nav nav-tabs mt-3" role="tablist">
            <li class="nav-item"><button class="nav-link" :class="{active: activeTab==='students'}" @click="activeTab='students'">සිසුන්</button></li>
            <li class="nav-item"><button class="nav-link" :class="{active: activeTab==='schedule'}" @click="activeTab='schedule'">දිනයන්</button></li>
            <li class="nav-item"><button class="nav-link" :class="{active: activeTab==='details'}" @click="activeTab='details'">විස්තර</button></li>
          </ul>

          <div class="tab-content p-3 border border-top-0 rounded-bottom">
            <div v-show="activeTab==='students'">
              <StudentsTab
                  :students="students"
                  @add-student="openAddStudentModal"
                  @open-student="openStudent"
              />
            </div>

            <div v-show="activeTab==='schedule'">
              <ScheduleTab
                  :days="DAYS"
                  :model-selected="selectedDays"
                  :model-time="timePerDay"
                  :editing="editing"
                  @toggle-day="onDayToggle"
                  @remove-day="onDayRemove"
              />
            </div>

            <div v-show="activeTab==='details'">
              <DetailsTab
                  :class-name="className"
                  :grade="grade"
                  :class-fee="classFee"
                  :lecturer-name="lecturerName"
                  :lecturer-id="lecturerId"
                  :lecturer-image="lecturerImage"
                  :editing="editing"
                  @scan-lecturer="armLecturerScan"
                  @update:class-name="v=>className=v"
                  @update:grade="v=>grade=v"
                  @update:class-fee="v=>classFee=v"
              />
            </div>

            <div class="mt-3" v-if="editing && activeTab!=='students'">
              <button class="btn btn-success" @click="saveUpdates"><i class="fa fa-save me-1"></i> සුරකින්න</button>
            </div>
          </div>
        </CardBody>
      </CardBody>
    </Card>

    <!-- HID Modal: Lecturer scan -->
    <transition name="fade">
      <div v-if="hidLecturer.armed" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0">Lecturer Card Scan</h6>
            <button class="btn btn-sm btn-link" @click="disarmLecturerScan"><i class="fa fa-times"></i></button>
          </div>
          <div class="mt-2 small text-muted">Tap a card on the reader. Listening…</div>
          <div class="mt-3 p-3 bg-100 rounded border d-flex align-items-center">
            <i class="fa fa-nfc-signal fs-4 me-2"></i>
            <div>
              <div class="fw-semibold">Status: <span class="text-primary">{{ hidLecturer.statusText }}</span></div>
              <div class="small text-muted">Auto-closes in {{ hidLecturer.remainingSec }}s</div>
            </div>
          </div>
          <input ref="hidLecturerRef" type="text" class="visually-hidden" autocomplete="off" @keydown.prevent="onLecturerKey" />
          <div class="mt-3 d-flex justify-content-end">
            <button class="btn btn-outline-secondary btn-sm" @click="disarmLecturerScan">Cancel</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- HID Modal: Add student scan -->
    <transition name="fade">
      <div v-if="hidStudent.armed" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0">Student Card Scan</h6>
            <button class="btn btn-sm btn-link" @click="disarmStudentScan"><i class="fa fa-times"></i></button>
          </div>
          <div class="mt-2 small text-muted">Tap a student card on the reader. Listening…</div>
          <div class="mt-3 p-3 bg-100 rounded border d-flex align-items-center">
            <i class="fa fa-nfc-signal fs-4 me-2"></i>
            <div>
              <div class="fw-semibold">Status: <span class="text-primary">{{ hidStudent.statusText }}</span></div>
              <div class="small text-muted">Auto-closes in {{ hidStudent.remainingSec }}s</div>
            </div>
          </div>
          <input ref="hidStudentRef" type="text" class="visually-hidden" autocomplete="off" @keydown.prevent="onStudentKey" />
          <div class="mt-3 d-flex justify-content-end">
            <button class="btn btn-outline-secondary btn-sm" @click="disarmStudentScan">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted, computed } from 'vue';
import Card from "../../bootstrap/Card.vue";
import CardBody from "../../bootstrap/CardBody.vue";
import StudentsTab from "../ClassDetails/StudentsTab.vue";
import ScheduleTab from "../ClassDetails/ScheduleTab.vue";
import DetailsTab from "../ClassDetails/DetailsTab.vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../composables/application/notificationHandling";

const $loading = inject('$loading');
const baseURL = inject('$baseURL');
const router = inject('$router', null);
const props = defineProps({ classId: { type: String, required: false } });

// tabs & state
const activeTab = ref('students');
const editing = ref(false);

// class core
const identifier = ref(null);
const classId = ref('');
const className = ref('');
const grade = ref('');
const classFee = ref('');

// lecturer
const lecturerId = ref('');
const lecturerName = ref('');
const lecturerImage = ref('');

// schedule
const DAYS = ['සඳුදා','අඟහරුවාදා','බදාදා','බ්‍රහස්පතින්දා','සිකුරාදා','සෙනසුරාදා','ඉරිදා'];
const selectedDays = ref([]);
const timePerDay = reactive({});

// students list (class_has_students)
const students = ref([]);

// ===== navigation =====
function goBack(){
  history.length > 1 ? history.back() :
      (router ? router.push('/classes') : (window.location.href='/classes'));
}
const routeId = computed(() => props.classId ?? '');

// ===== load data =====
async function loadClass() {
  const id = routeId.value;
  if (!id) return;
  const loader = $loading?.show?.();
  try {
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({ collection:'classes', attr:'classId', filter_array: JSON.stringify([id]) })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const cls = json_data.value?.[0];
    if (!cls) { notificationHandling('error','Class not found'); return; }

    identifier.value = cls._id;
    classId.value = cls.classId;
    className.value = cls.className || '';
    grade.value = cls.grade || '';
    lecturerId.value = cls.lecturerId || '';
    lecturerName.value = cls.lecturerName || '';
    lecturerImage.value = cls.lecturerImage || '';
    classFee.value = cls.classFee != null ? String(cls.classFee) : '';

    selectedDays.value = Array.isArray(cls.schedule) ? cls.schedule.map(s => s.day) : [];
    Object.keys(timePerDay).forEach(k => delete timePerDay[k]);
    (cls.schedule || []).forEach(s => timePerDay[s.day] = s.time || '');
  } catch(e){
    notificationHandling('error', e?.message || 'Failed to load class');
  } finally { loader?.hide?.(); }
}

async function loadStudents() {
  const id = routeId.value;
  if (!id) return;
  try{
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({ collection:'class_has_students', attr:'classId', filter_array: JSON.stringify([id]) })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    students.value = Array.isArray(json_data.value) ? json_data.value : [];
  }catch(_) { /* non-fatal */ }
}

onMounted(async () => { await loadClass(); await loadStudents(); });

// ===== edit/save =====
function toggleEdit(){ editing.value = !editing.value; }
async function saveUpdates(){
  if (!className.value?.trim() || !grade.value?.trim() || !lecturerId.value || !selectedDays.value.length) {
    notificationHandling('error','කරුණාකර අවශ්‍ය සියල්ල ਪුරවන්න.');
    return;
  }
  const schedule = selectedDays.value.map(d => ({ day:d, time: (timePerDay[d] || '').trim() }));
  const loader = $loading?.show?.();
  try{
    const payload = {
      url: `${baseURL}/api/v1/general-queries/updateData`,
      data: JSON.stringify({
        collection: 'classes',
        identifier: identifier.value,
        data: JSON.stringify({
          className: className.value,
          grade: grade.value,
          lecturerName: lecturerName.value,
          lecturerId: lecturerId.value,
          lecturerImage: lecturerImage.value || '',
          classFee: Number(classFee.value) || 0,
          schedule
        })
      })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    if (json_data.value){
      notificationHandling('success','පන්ති තොරතුරු යාවත්කාලීන උනා!');
      editing.value = false;
    } else {
      notificationHandling('error','දත්ත යාවත්කාලීන කිරීම අසාර්ථකයි.');
    }
  } catch(e){
    notificationHandling('error', e?.message || 'Update failed');
  } finally { loader?.hide?.(); }
}

// ===== schedule handlers =====
function onDayToggle(day){
  if (!editing.value) return;
  const i = selectedDays.value.indexOf(day);
  if (i>=0) {
    selectedDays.value.splice(i,1);
    delete timePerDay[day];
  } else {
    selectedDays.value.push(day);
    if(!timePerDay[day]) timePerDay[day]='';
  }
}
function onDayRemove(day){
  const i = selectedDays.value.indexOf(day);
  if (i>=0) selectedDays.value.splice(i,1);
  delete timePerDay[day];
}

// ===== open student details =====
function openStudent(studentId){
  if (router) router.push({ name:'StudentDetails', params:{ studentId } });
  else window.location.href = `/students/${encodeURIComponent(studentId)}`;
}

/* =========================================================
   HID (Lecturer scan)
   ========================================================= */
const hidLecturer = reactive({
  armed:false, statusText:'Waiting For Card', buffer:'', lastTick:0,
  idleTimer:null, countdownTimer:null, remainingSec:0
});
const hidLecturerRef = ref(null);

function armLecturerScan(){
  if (!editing.value || hidLecturer.armed) return;
  hidLecturer.armed = true;
  hidLecturer.statusText='Waiting For Card';
  hidLecturer.buffer=''; hidLecturer.lastTick=0; hidLecturer.remainingSec=15;
  hidLecturer.countdownTimer = setInterval(()=>{
    hidLecturer.remainingSec -= 1; if (hidLecturer.remainingSec<=0) disarmLecturerScan();
  }, 1000);
  setTimeout(()=>hidLecturerRef.value?.focus?.(),30);
}
function disarmLecturerScan(){
  hidLecturer.armed=false; hidLecturer.statusText='idle'; hidLecturer.buffer='';
  if (hidLecturer.idleTimer){ clearTimeout(hidLecturer.idleTimer); hidLecturer.idleTimer=null; }
  if (hidLecturer.countdownTimer){ clearInterval(hidLecturer.countdownTimer); hidLecturer.countdownTimer=null; }
}
function onLecturerKey(e){
  if (!hidLecturer.armed) return;
  const now = performance.now(); const GAP=120;
  if (!hidLecturer.lastTick || now-hidLecturer.lastTick>GAP*3) hidLecturer.buffer='';
  hidLecturer.lastTick = now;

  if (e.key==='Enter'){
    if (hidLecturer.idleTimer){ clearTimeout(hidLecturer.idleTimer); hidLecturer.idleTimer=null; }
    finalizeLecturerScan();
    return;
  }
  if (/^\d$/.test(e.key)){ hidLecturer.statusText='reading…'; hidLecturer.buffer += e.key; }

  if (hidLecturer.idleTimer) clearTimeout(hidLecturer.idleTimer);
  hidLecturer.idleTimer = setTimeout(()=>finalizeLecturerScan(), GAP*4);
}
async function finalizeLecturerScan(){
  if (!hidLecturer.buffer) return;
  const id = hidLecturer.buffer.replace(/\D+/g,'');
  hidLecturer.statusText='processing…';
  disarmLecturerScan(); // disarm first to stop more keystrokes
  try{
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({ collection:'lecturers', attr:'lecturerId', filter_array: JSON.stringify([id]) })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const lec = Array.isArray(json_data.value) && json_data.value.length ? json_data.value[0] : null;
    if (!lec){ notificationHandling('error','Lecturer not found for this card'); return; }
    lecturerId.value = id;
    lecturerName.value = lec.name || '';
    lecturerImage.value = lec.image || '';
    notificationHandling('success','ගුරු කාඩ්පත සම්බන්ධ කළා.');
  }catch(e){ notificationHandling('error', e?.message || 'Lookup failed'); }
}

/* =========================================================
   HID (Student add) — with duplicate-guard & debounce
   ========================================================= */
const hidStudent = reactive({
  armed:false, statusText:'Waiting For Card', buffer:'', lastTick:0,
  idleTimer:null, countdownTimer:null, remainingSec:0,
  processing:false, // in-flight guard
});
const hidStudentRef = ref(null);

// Keep very-recently processed IDs for a short window
const RECENT_WINDOW_MS = 2500;
const recentStudentIds = new Map(); // id -> timestamp
function markSeen(id){ recentStudentIds.set(id, Date.now()); }
function isRecentlySeen(id){
  const t = recentStudentIds.get(id);
  if (!t) return false;
  if (Date.now() - t > RECENT_WINDOW_MS){ recentStudentIds.delete(id); return false; }
  return true;
}

function openAddStudentModal(){
  if (hidStudent.armed) return;
  hidStudent.armed = true; hidStudent.statusText='Waiting For Card';
  hidStudent.buffer=''; hidStudent.lastTick=0; hidStudent.remainingSec=15;
  hidStudent.countdownTimer = setInterval(()=>{
    hidStudent.remainingSec -= 1; if (hidStudent.remainingSec<=0) disarmStudentScan();
  }, 1000);
  setTimeout(()=>hidStudentRef.value?.focus?.(),30);
}
function disarmStudentScan(){
  hidStudent.armed=false; hidStudent.statusText='idle'; hidStudent.buffer='';
  if (hidStudent.idleTimer){ clearTimeout(hidStudent.idleTimer); hidStudent.idleTimer=null; }
  if (hidStudent.countdownTimer){ clearInterval(hidStudent.countdownTimer); hidStudent.countdownTimer=null; }
}

function onStudentKey(e){
  if (!hidStudent.armed) return;
  const now = performance.now(); const GAP=120;
  if (!hidStudent.lastTick || now-hidStudent.lastTick>GAP*3) hidStudent.buffer='';
  hidStudent.lastTick = now;

  if (e.key==='Enter'){
    if (hidStudent.idleTimer){ clearTimeout(hidStudent.idleTimer); hidStudent.idleTimer=null; } // stop idle auto-fire
    finalizeStudentScan();
    return;
  }
  if (/^\d$/.test(e.key)){ hidStudent.statusText='reading…'; hidStudent.buffer += e.key; }

  if (hidStudent.idleTimer) clearTimeout(hidStudent.idleTimer);
  hidStudent.idleTimer = setTimeout(()=>finalizeStudentScan(), GAP*4);
}

async function finalizeStudentScan(){
  // basic guards
  if (!hidStudent.buffer || hidStudent.processing) return;

  const id = hidStudent.buffer.replace(/\D+/g,'');
  if (!id) return;

  // debounce same ID repeats for a short window
  if (isRecentlySeen(id)) return;
  markSeen(id);

  // lock & disarm immediately to prevent more keystrokes
  hidStudent.processing = true;
  hidStudent.statusText='processing…';
  disarmStudentScan();

  try{
    // lookup student
    const readPayload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({ collection:'students', attr:'studentId', filter_array: JSON.stringify([id]) })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', readPayload, false);
    const stu = Array.isArray(json_data.value) && json_data.value.length ? json_data.value[0] : null;
    if (!stu){ notificationHandling('error','Student not found for this card'); return; }

    // prevent duplicates in current UI list
    if (students.value.some(s => String(s.studentId) === String(id))){
      notificationHandling('success','මෙම ශිෂ්‍යයා දැනටමත් ඇතුලත්!');
      return;
    }

    // (light) server-side check: any link for this student in THIS class?
    try {
      const checkPayload = {
        url: `${baseURL}/api/v1/general-queries/readData`,
        data: JSON.stringify({
          collection: 'class_has_students',
          attr: 'studentId',
          filter_array: JSON.stringify([id])
        })
      };
      const { json_data: checkRes } = await generalAxiosRequest('curl-requests/post', checkPayload, false);
      const existsInThisClass = (Array.isArray(checkRes?.value) ? checkRes.value : [])
          .some(row => String(row.classId) === String(classId.value));
      if (existsInThisClass){
        notificationHandling('success','මෙම ශිෂ්‍යයා දැනටමත් මෙම පන්තියෙහි ඇත!');
        return;
      }
    } catch(_) { /* non-fatal */ }

    // create link
    const newRow = {
      classId: classId.value,
      classOBJId: identifier.value,
      studentId: id,
      studentOBJId: stu._id,
      className: className.value,
      grade: grade.value,
      studentName: stu.name || 'Student',
      guardianMobile: stu.guardianMobile || '',
      studentImage: stu.image || '',
    };

    const payload = {
      url: `${baseURL}/api/v1/general-queries/addData`,
      data: JSON.stringify({ collection:'class_has_students', data: JSON.stringify(newRow) })
    };
    const saved = await generalAxiosRequest('curl-requests/post', payload, false);

    if (saved){
      students.value = [...students.value, newRow];
      notificationHandling('success','ශිෂ්‍යයා එකතු කෙරිණි!');
    } else {
      notificationHandling('error','Failed to add student');
    }
  }catch(e){
    notificationHandling('error', e?.message || 'Add student failed');
  } finally {
    // release lock after a short delay (extra protection from rapid re-fires)
    setTimeout(() => { hidStudent.processing = false; }, 300);
  }
}
</script>

<style scoped>
.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1080; }
.modal-card { width: min(560px,92vw); background: var(--falcon-card-bg,#fff); border-radius: 12px; border:1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15); padding:16px 18px; }
.fade-enter-active,.fade-leave-active{ transition: opacity .15s ease; } .fade-enter-from,.fade-leave-to{ opacity: 0; }
</style>
