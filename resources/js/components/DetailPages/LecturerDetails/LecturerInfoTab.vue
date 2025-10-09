<!-- ================================== -->
<!-- File: LecturerInfoTab.vue          -->
<!-- ================================== -->
<template>
  <div class="row g-3">
    <!-- Editable fields -->
    <div class="col-12 col-md-6">
      <label class="form-label">නම</label>
      <input class="form-control" :readonly="!editing" :value="localName" @input="e=> localName = e.target.value" />
    </div>

    <div class="col-12 col-md-6">
      <label class="form-label">දුරකථන අංකය</label>
      <input class="form-control" :readonly="!editing" v-model="form.lecturerMobile" />
    </div>

    <div class="col-12 col-md-4">
      <label class="form-label">ස්ත්‍රී/පුරුෂ භාවය</label>
      <select class="form-select" :disabled="!editing" v-model="form.gender">
        <option value="">—</option>
        <option value="Male">පිරිමි</option>
        <option value="Female">ගැහැනු</option>
      </select>
    </div>

    <div class="col-12 col-md-4">
      <label class="form-label">උපන්දිනය</label>
      <input type="date" class="form-control" :disabled="!editing" v-model="birthdateStr" />
    </div>

    <div class="col-12 col-md-4">
      <label class="form-label">වයස</label>
      <input class="form-control" :value="age" readonly />
    </div>

    <div class="col-12 col-md-6">
      <label class="form-label">ජා.හැ. අංකය</label>
      <input class="form-control" :readonly="!editing" v-model="form.nic" />
    </div>

    <div class="col-12 col-md-6">
      <label class="form-label">ලිපිනය</label>
      <input class="form-control" :readonly="!editing" v-model="form.address" />
    </div>

    <div class="col-12 col-md-6">
      <label class="form-label">ක්‍රියාකාරිත්වය</label>
      <select class="form-select" :disabled="!editing" v-model="form.active">
        <option :value="true">Active</option>
        <option :value="false">Inactive</option>
      </select>
    </div>

    <!-- Actions -->
    <div class="col-12 d-flex gap-2 mt-2" v-if="editing && canEdit">
      <button class="btn btn-primary" @click="saveChanges" :disabled="saving">
        <span v-if="!saving">යාවත්කාලීන කරන්න</span>
        <span v-else class="spinner-border spinner-border-sm"></span>
      </button>

      <button class="btn btn-outline-secondary" @click="$emit('request-refresh')">Refresh</button>

      <!-- Optional: re-link card (HID) -->
      <button class="btn btn-success ms-auto" @click="armHidLink" :disabled="hid.armed">
        <i class="fa fa-nfc-signal me-1"></i>
        <span v-if="!hid.armed">කාඩ් අංකය සම්බන්ධ කරන්න</span>
        <span v-else>Listening… {{ hid.remainingSec }}s</span>
      </button>
    </div>

    <!-- HID Modal -->
    <transition name="fade">
      <div v-if="hid.armed" class="modal-backdrop-custom">
        <div class="modal-card">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0">USB/HID Card Scan</h6>
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

          <input ref="hidInputRef" type="text" class="visually-hidden" autocomplete="off" @keydown.prevent="onHidKeydown" />
          <div class="mt-3 d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary btn-sm" @click="disarmHid">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {ref, reactive, computed, inject} from 'vue';
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../composables/application/notificationHandling";

const props = defineProps({
  lecturer: { type: Object, required: true },
  editing: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: true },
  editedName: { type: String, default: '' },
  editedImage: { type: String, default: '' },
});
const emit = defineEmits(['update:edited-name','update:edited-image','request-refresh']);

const $loading = inject('$loading');
const baseURL  = inject('$baseURL');

const saving = ref(false);
const form = reactive({ ...props.lecturer });
const localName = ref(props.editedName);

const birthdateStr = computed({
  get:()=> (form.birthdate || '').slice(0,10),
  set:(v)=> form.birthdate = v ? new Date(v).toISOString() : form.birthdate
});
const age = computed(()=>{
  try{
    const t = new Date();
    const b = new Date(form.birthdate);
    let a = t.getFullYear()-b.getFullYear();
    const m=t.getMonth()-b.getMonth();
    if(m<0||(m===0&&t.getDate()<b.getDate())) a--;
    return a;
  }catch(_){ return ''; }
});

async function saveChanges(){
  saving.value = true; const loader = $loading?.show?.();
  try{
    const payload = {
      url: `${baseURL}/api/v1/general-queries/updateData`,
      data: JSON.stringify({
        collection:'lecturers',
        identifier: props.lecturer._id,
        data: JSON.stringify({ ...form, name: localName.value })
      })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    if (json_data){
      notificationHandling('success','දත්ත යාවත්කාලීන කිරීම සාර්ථකයි.');
      emit('request-refresh');
    }else{
      notificationHandling('error','දත්ත යාවත්කාලීන කිරීම අසාර්ථකයි.');
    }
  }catch(e){
    notificationHandling('error', e?.message || 'Update failed');
  }finally{
    saving.value = false; loader?.hide?.();
  }
}

/** ===== Optional HID re-link (collision-checked) ===== */
const hid = reactive({ armed:false, statusText:'waiting_for_card', buffer:'', lastTick:0, idleTimer:null, countdownTimer:null, remainingSec:0 });
const hidInputRef = ref(null);
function armHidLink(){
  hid.armed=true; hid.statusText='waiting_for_card'; hid.buffer=''; hid.lastTick=0; hid.remainingSec=15;
  hid.countdownTimer=setInterval(()=>{hid.remainingSec -=1; if(hid.remainingSec<=0) disarmHid();},1000);
  setTimeout(()=>hidInputRef.value?.focus?.(),30);
}
function disarmHid(){
  hid.armed=false; hid.statusText='idle'; hid.buffer='';
  if(hid.idleTimer){clearTimeout(hid.idleTimer); hid.idleTimer=null;}
  if(hid.countdownTimer){clearInterval(hid.countdownTimer); hid.countdownTimer=null;}
}
function onHidKeydown(e){
  if(!hid.armed) return;
  const now=performance.now(); const GAP=120;
  if(!hid.lastTick||now-hid.lastTick>GAP*3) hid.buffer='';
  hid.lastTick=now;
  if(e.key==='Enter'){ finalizeHid(); return; }
  if(/^\d$/.test(e.key)){ hid.statusText='reading…'; hid.buffer+=e.key; }
  if(hid.idleTimer) clearTimeout(hid.idleTimer);
  hid.idleTimer=setTimeout(()=>finalizeHid(), GAP*4);
}
async function finalizeHid(){
  if(!hid.buffer) return;
  const newId = hid.buffer.replace(/\D+/g,'');
  hid.statusText='processing…';
  try{
    // collision check
    const check = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({ collection:'lecturers', attr:'lecturerId', filter_array: JSON.stringify([newId]) })
    };
    const { json_data:chk } = await generalAxiosRequest('curl-requests/post', check, false);
    const arr = Array.isArray(chk?.value) ? chk.value : (Array.isArray(chk) ? chk: []);
    if (arr.length && arr[0]?._id !== props.lecturer._id){
      notificationHandling('error','මෙම කාඩ් අංකය වෙනත් ගුරුවරයෙකුට සම්බන්ධයි.');
      disarmHid(); return;
    }
    // update id + activate
    const upd = {
      url: `${baseURL}/api/v1/general-queries/updateData`,
      data: JSON.stringify({
        collection:'lecturers',
        identifier: props.lecturer._id,
        data: JSON.stringify({ lecturerId:newId, active:true })
      })
    };
    const { json_data:res } = await generalAxiosRequest('curl-requests/post', upd, false);
    if (res){
      notificationHandling('success','කාඩ්පත සම්බන්ධ කිරීම සාර්ථකයි!');
      emit('request-refresh', newId);
    }
  }catch(e){
    notificationHandling('error', e?.message || 'Link failed');
  }finally{
    disarmHid();
  }
}
</script>

<style scoped>
.modal-backdrop-custom { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1080; }
.modal-card { width: min(560px,92vw); background:#fff; border-radius: 12px; border:1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.15); padding:16px 18px; }
.fade-enter-active,.fade-leave-active{ transition: opacity .15s ease; } .fade-enter-from,.fade-leave-to{ opacity: 0; }
</style>
