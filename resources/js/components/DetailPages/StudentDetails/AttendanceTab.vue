
<!-- ============================= -->
<!-- File: AttendanceTab.vue       -->
<!-- ============================= -->
<template>
  <div>
    <div v-if="mode==='classes'">
      <div class="d-flex align-items-center justify-content-between bg-100 border-200 rounded p-2 mb-2">
        <h6 class="mb-0">Select a class</h6>
        <span class="badge bg-200 text-dark border">{{ classes.length }}</span>
      </div>
      <div v-if="loading" class="text-center py-4"><div class="spinner-border spinner-border-sm"/> <span class="ms-2">Loading classes…</span></div>
      <div v-else-if="error" class="text-center py-4 text-danger">{{ error }}</div>
      <div v-else>
        <div v-for="c in classes" :key="c._id || c.classId" class="list-group-item d-flex align-items-center justify-content-between">
          <div>
            <div class="fw-semibold">{{ c.className || 'Unnamed class' }}</div>
            <div class="small text-muted" v-if="c.grade">{{ c.grade }}</div>
          </div>
          <button class="btn btn-sm btn-falcon-info" @click="openClass(c)">Open <i class="fa fa-chevron-right ms-1"/></button>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="d-flex align-items-center justify-content-between bg-100 border-200 rounded p-2 mb-2">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="backToClasses"><i class="fa fa-arrow-left"/></button>
          <div>
            <div class="fw-semibold">{{ selectedClass?.className }}</div>
            <div class="small text-muted" v-if="selectedClass?.grade">{{ selectedClass.grade }}</div>
          </div>
        </div>
        <span class="badge bg-200 text-dark border">{{ attendance.length }} records</span>
      </div>

      <div v-if="loadingAttendance" class="text-center py-4"><div class="spinner-border spinner-border-sm"/> <span class="ms-2">Loading attendance…</span></div>
      <div v-else-if="error" class="text-center py-4 text-danger">{{ error }}</div>
      <div v-else>
        <template v-if="sections.length">
          <div v-for="sec in sections" :key="sec.title" class="mb-3">
            <div class="fw-bold mb-1">{{ sec.title }}</div>
            <div class="list-group shadow-none">
              <div v-for="item in sec.data" :key="item._id || item.marked_at" class="list-group-item d-flex align-items-center justify-content-between">
                <div>
                  <div class="fw-semibold">{{ pretty(item.marked_date) || pretty(item.created_at) || item.marked_at || '—' }}</div>
                  <div class="small text-muted">Operator: {{ item.operator || '—' }}</div>
                </div>
                <i class="fa fa-check-circle text-success"></i>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="text-center text-muted py-4">No attendance records for this class.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import { /* convertAnyDateTime */ } from "../../../composables/application/timeconversion";

const props = defineProps({ studentId: { type: String, required: true } });
const baseURL = inject('$baseURL');

const mode = ref('classes');
const classes = ref([]); const attendance = ref([]);
const selectedClass = ref(null);
const loading = ref(true); const loadingAttendance = ref(false); const error = ref('');

const pretty = (v)=> {
  try{ const d = new Date(v?.$date || v); return d.toLocaleString(); }catch(_){ return '—'; }
};

async function loadClasses(){
  loading.value = true; error.value='';
  try{
    const payload = { url: `${baseURL}/api/v1/general-queries/readDataAdvanced`, data: JSON.stringify({ collection:'class_has_students', filter_array: JSON.stringify([{ attribute:'studentId', condition:'=', value: props.studentId }]), condition_type:false, project: JSON.stringify(['classId','className','grade','updated_at']) }) };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const arr = Array.isArray(json_data?.value) ? json_data.value : (Array.isArray(json_data) ? json_data : []);
    arr.sort((a,b)=> new Date(b?.updated_at||0) - new Date(a?.updated_at||0));
    classes.value = arr;
  }catch(e){ error.value='Failed to load classes'; }
  finally{ loading.value=false; }
}

async function openClass(c){
  mode.value='attendance'; selectedClass.value=c; loadingAttendance.value=true; error.value=''; attendance.value=[];
  try{
    const payload = { url: `${baseURL}/api/v1/general-queries/readDataAdvanced`, data: JSON.stringify({ collection:'attendance', filter_array: JSON.stringify([{ attribute:'studentId', condition:'=', value: props.studentId }, { attribute:'classId', condition:'=', value: c.classId }]), condition_type:false, project: JSON.stringify(['classId','className','studentId','marked_at','marked_date','operator','created_at','_id']) }) };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const list = Array.isArray(json_data?.value) ? json_data.value : (Array.isArray(json_data) ? json_data : []);
    list.sort((a,b)=> new Date(b?.marked_date?.$date || b?.created_at) - new Date(a?.marked_date?.$date || a?.created_at));
    attendance.value = list;
  }catch(e){ error.value='Failed to load attendance'; }
  finally{ loadingAttendance.value=false; }
}

function backToClasses(){ mode.value='classes'; selectedClass.value=null; attendance.value=[]; error.value=''; }

const sections = computed(()=>{
  const map = new Map();
  attendance.value.forEach(r=>{ const key = new Date(r?.marked_date?.$date || r?.created_at).toISOString().slice(0,10); (map.get(key)||map.set(key,[]).get(key)).push(r); });
  const out = Array.from(map.entries()).map(([title, data])=>({ title, data }));
  out.sort((A,B)=> new Date(B.title) - new Date(A.title));
  out.forEach(s=> s.data.sort((a,b)=> new Date(b?.marked_date?.$date || b?.created_at) - new Date(a?.marked_date?.$date || a?.created_at)) );
  return out;
});

onMounted(loadClasses);
</script>
