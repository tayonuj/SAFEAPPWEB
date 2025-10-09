<!-- ============================= -->
<!-- File: StudentDetails.vue      -->
<!-- ============================= -->
<template>
  <div class="container">
    <!-- Breadcrumb -->
    <div class="mt-3 mb-4">
      <nav
          style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);"
          aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/public">මුල් පිටුව</a></li>
          <li class="breadcrumb-item"><a href="/students">සිසු සිසුවියන්</a></li>
          <li class="breadcrumb-item active" aria-current="page">විස්තර</li>
        </ol>
      </nav>
    </div>

    <Card>
      <!-- Header / Profile strip -->
      <div class="position-relative bg-primary rounded-3 p-3 p-md-4 text-white">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <img
                v-if="profileImage"
                :src="profileImage"
                class="rounded-circle border border-2 border-white object-fit-cover"
                style="width:88px;height:88px;"
                alt="avatar"
            />
            <div
                v-else
                class="rounded-circle d-flex align-items-center justify-content-center bg-100 text-800"
                style="width:88px;height:88px;"
            >
              <i class="fa fa-user fa-2x"></i>
            </div>
            <div>
              <h5 class="mb-1 text-white">{{ student?.name || '—' }}</h5>
              <div class="d-flex align-items-center gap-2 small">
                <span class="badge bg-100 text-dark border">{{ student?.studentId || routeId }}</span>
                <span :class="['badge', student?.active ? 'bg-success' : 'bg-danger']">
                  {{ student?.active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button v-if="canEdit && !editing" class="btn btn-light" @click="startEdit">
              <i class="fa fa-pen me-1" /> Edit
            </button>
            <button v-else-if="canEdit && editing" class="btn btn-outline-light" @click="cancelEdit">
              <i class="fa fa-times me-1" /> Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs (Bootstrap) -->
      <div class="px-3 px-md-4">
        <ul class="nav nav-tabs mt-3" id="studentTabs" role="tablist">
          <li class="nav-item">
            <a
                class="nav-link active"
                id="tab-info-link"
                data-bs-toggle="tab"
                href="#tab-info"
                role="tab"
                aria-controls="tab-info"
                aria-selected="true"
            >
              විස්තර
            </a>
          </li>
          <li class="nav-item">
            <a
                class="nav-link"
                id="tab-classes-link"
                data-bs-toggle="tab"
                href="#tab-classes"
                role="tab"
                aria-controls="tab-classes"
                aria-selected="false"
            >
              පන්ති
            </a>
          </li>
          <li class="nav-item">
            <a
                class="nav-link"
                id="tab-payments-link"
                data-bs-toggle="tab"
                href="#tab-payments"
                role="tab"
                aria-controls="tab-payments"
                aria-selected="false"
            >
              ගෙවීම්
            </a>
          </li>
        </ul>

        <div class="tab-content p-3" id="studentTabsContent">
          <!-- Info -->
          <div
              class="tab-pane fade show active"
              id="tab-info"
              role="tabpanel"
              aria-labelledby="tab-info-link"
          >
            <InfoTab
                v-if="student"
                :student="student"
                :editing="editing"
                :can-edit="canEdit"
                :edited-name="editedName"
                :edited-image="editedImage"
                @update:edited-name="v => (editedName = v)"
                @update:edited-image="v => (editedImage = v)"
                @request-refresh="newId => fetchStudent(newId || student.studentId)"
            />
          </div>

          <!-- Classes / Attendance -->
          <div
              class="tab-pane fade"
              id="tab-classes"
              role="tabpanel"
              aria-labelledby="tab-classes-link"
          >
            <AttendanceTab v-if="student" :student-id="student.studentId" />
          </div>

          <!-- Payments -->
          <div
              class="tab-pane fade"
              id="tab-payments"
              role="tabpanel"
              aria-labelledby="tab-payments-link"
          >
            <PaymentsTab v-if="student" :student-id="student.studentId" />
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import Card from "../../bootstrap/Card.vue";
import InfoTab from './InfoTab.vue';
import PaymentsTab from './PaymentsTab.vue';
import AttendanceTab from './AttendanceTab.vue';
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import { convertAnyDateTime } from "../../../composables/application/timeconversion";
import notificationHandling from "../../../composables/application/notificationHandling";

// ✅ get studentId from route props (router has props:true)
const props = defineProps({
  studentId: { type: String, required: false }
});

const $loading = inject('$loading');
const baseURL = inject('$baseURL');

const student = ref(null);
const editing = ref(false);
const editedName = ref('');
const editedImage = ref('');
const canEdit = ref(true);

const routeId = computed(() => props.studentId ?? '');
const profileImage = computed(() => editedImage.value || student.value?.image || '');

function startEdit() {
  editing.value = true;
  editedName.value = student.value?.name || '';
  editedImage.value = student.value?.image || '';
}
function cancelEdit() {
  editing.value = false;
  editedName.value = student.value?.name || '';
  editedImage.value = student.value?.image || '';
}

async function fetchStudent(studentId) {
  const loader = $loading?.show?.();
  try {
    const payload = {
      url: `${baseURL}/api/v1/general-queries/readData`,
      data: JSON.stringify({
        collection: 'students',
        attr: 'studentId',
        filter_array: JSON.stringify([studentId])
      })
    };
    const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
    const arr = Array.isArray(json_data?.value) ? json_data.value : (Array.isArray(json_data) ? json_data : []);
    if (arr.length) {
      const s = arr[0];
      // If you need only date part, make sure your helper returns "YYYY-MM-DD"
      s.birthdate = convertAnyDateTime(s.birthdate, 'YYYY-MM-DD') || s.birthdate;
      student.value = s;
      editedName.value = s.name;
      editedImage.value = s.image;
    } else {
      notificationHandling('error', 'Student not found');
    }
  } catch (e) {
    notificationHandling('error', e?.message || 'Failed to load student');
  } finally {
    loader?.hide?.();
  }
}

// Load on mount + react if the param changes while kept-alive
onMounted(() => {
  if (routeId.value) fetchStudent(routeId.value);
});
watch(routeId, (id) => { if (id) fetchStudent(id); });
</script>

<style scoped>
.object-fit-cover { object-fit: cover; }
</style>
