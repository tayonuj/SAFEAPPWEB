<!-- ============================= -->
<!-- File: PaymentsTab.vue         -->
<!-- ============================= -->
<template>
  <div>
    <div class="row g-2 align-items-center mb-3">
      <div class="col-12 col-md-6">
        <div class="input-group">
          <span class="input-group-text bg-100 border-200"><i class="fa fa-search"></i></span>
          <input class="form-control" v-model="search" placeholder="Search by class or month…" />
        </div>
      </div>
      <div class="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
        <button class="btn btn-sm" :class="chip('all')" @click="filter='all'">All</button>
        <button class="btn btn-sm" :class="chip('paid')" @click="filter='paid'">Paid</button>
        <button class="btn btn-sm" :class="chip('unpaid')" @click="filter='unpaid'">Unpaid</button>
      </div>
    </div>

    <div class="alert bg-100 border-200" v-if="rows.length">
      <div class="d-flex justify-content-between">
        <span class="text-muted">Total Paid</span>
        <b class="text-success">{{ LKR(totals.paid) }}</b>
      </div>
      <div class="d-flex justify-content-between mt-1">
        <span class="text-muted">Total Unpaid</span>
        <b class="text-danger">{{ LKR(totals.unpaid) }}</b>
      </div>
    </div>

    <div v-if="loading" class="text-center py-4"><div class="spinner-border spinner-border-sm"/> <span class="ms-2">Loading payments…</span></div>
    <div v-else-if="error" class="text-center py-4 text-danger">{{ error }}</div>

    <div v-else>
      <div v-if="!sections.length" class="text-center text-muted py-4">No payment records match your filters.</div>
      <div v-for="sec in sections" :key="sec.title" class="mb-3">
        <div class="d-flex align-items-baseline justify-content-between mb-1">
          <h6 class="mb-0">{{ sec.title }}</h6>
          <div class="d-flex gap-2">
            <span v-if="sec.totals.paid" class="badge bg-success-subtle text-success border">{{ LKR(sec.totals.paid) }} paid</span>
            <span v-if="sec.totals.unpaid" class="badge bg-danger-subtle text-danger border">{{ LKR(sec.totals.unpaid) }} due</span>
          </div>
        </div>
        <div class="list-group shadow-none">
          <div v-for="item in sec.data" :key="item._id || item.month+item.className" class="list-group-item d-flex align-items-center justify-content-between">
            <div>
              <div class="fw-semibold">{{ item.month || '—' }}</div>
              <div class="text-muted small">{{ item.className || '—' }}</div>
            </div>
            <div class="text-end">
              <div class="fw-bold">{{ LKR(item.amount) }}</div>
              <span :class="['badge', item.paid? 'bg-success' : 'bg-danger']">{{ item.paid? 'Paid':'Unpaid' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";

const props = defineProps({ studentId: { type: String, required: true } });
const baseURL = inject('$baseURL');

const payments = ref([]); const loading = ref(true); const error = ref('');
const search = ref(''); const filter = ref('all');
const LKR = (n)=> isNaN(n)? '—' : `රු ${Number(n).toLocaleString('en-LK',{maximumFractionDigits:0})}`;
const chip = (k)=> ({ 'btn-outline-primary': filter.value!==k, 'btn-primary': filter.value===k });

async function load(){
  loading.value = true; error.value='';
  try{
    const payload = { url: `${baseURL}/api/v1/general-queries/readData`, data: JSON.stringify({ collection:'class_fees', attr:'studentId', filter_array: JSON.stringify([props.studentId]) }) };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    payments.value = Array.isArray(json_data?.value) ? json_data.value : (Array.isArray(json_data) ? json_data : []);
  }catch(e){ error.value = 'Failed to load payments'; }
  finally{ loading.value = false; }
}

const rows = computed(()=> payments.value.filter(p=>{
  const q=(search.value||'').trim().toLowerCase();
  if (filter.value==='paid' && !p.paid) return false;
  if (filter.value==='unpaid' && p.paid) return false;
  if (!q) return true;
  return (p.className||'').toLowerCase().includes(q) || (p.month||'').toLowerCase().includes(q);
}));

const sections = computed(()=>{
  const map = new Map();
  rows.value.forEach(r=>{ const k=r.className||'—'; (map.get(k)||map.set(k,[]).get(k)).push(r); });
  const out = Array.from(map.entries()).map(([title,data])=>({ title, data, totals:{ paid:data.filter(d=>d.paid).reduce((s,d)=>s+(+d.amount||0),0), unpaid:data.filter(d=>!d.paid).reduce((s,d)=>s+(+d.amount||0),0) } }));
  out.sort((A,B)=> B.totals.unpaid - A.totals.unpaid);
  out.forEach(s=> s.data.sort((a,b)=> (a.paid===b.paid? String(b.month||'').localeCompare(String(a.month||'')) : a.paid?1:-1)) );
  return out;
});

const totals = computed(()=> rows.value.reduce((acc,r)=>{ const n=+r.amount||0; r.paid? acc.paid+=n: acc.unpaid+=n; return acc; },{paid:0,unpaid:0}));

onMounted(load);
</script>
