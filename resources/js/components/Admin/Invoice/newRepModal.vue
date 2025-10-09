<template>
  <Modal ref="detailModal" title="නියෝජිතයන් ලැයිස්තුව ">
    <div class="container">
      <div class="row">
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="repName"
            :label="'රෙප් ගේ නම'"
            :required="true"
            :validation-types="['required']"
            :size="'medium'"
            @update:modelValue="value => repName = value"
            :formSubmitted="formSubmitted"
        />
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="repMobileNo"
            :label="'රෙප් ගේ දු. අංකය'"
            :required="true"
            :validation-types="['required','phoneNumber']"
            :size="'medium'"
            @update:modelValue="value => repMobileNo = value"
            :formSubmitted="formSubmitted"
        />
      </div>

      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="repNIC"
            :label="'රෙප් ගේ ජා.හැ අංකය'"
            :required="true"
            :validation-types="['required','nic']"
            :size="'medium'"
            @update:modelValue="value => repNIC = value"
            :formSubmitted="formSubmitted"
        />
      </div>

      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="repAddress"
            :label="'රෙප් ගේ ලිපිනය'"
            :size="'medium'"
            @update:modelValue="value => repAddress = value"
            :formSubmitted="formSubmitted"
        />
      </div>

    </div>

    <div class="d-grid gap-2 mt-4 mb-4">
      <button
          class="btn btn-primary"
          type="button"
          @click="submitForm"
      >
        දත්ත ඇතුලත් කරන්න
      </button>
    </div>

      <VueTable
          :data="allReps"
          :headers="tblHeader"
          :enable-query="false"
          :rowsPerPage="10"
          tableID="leave_table"
          @show-modal="handleShowModal"
      />
    </div>
  </Modal>
</template>

<script setup>
import {inject, ref, watch} from 'vue';
import Modal from "../../bootstrap/Modal.vue";
import UjInput from "../../Reusables/UIComponents/ujInput.vue";
import VueTable from "../../plugins/VueTable.vue";
import notificationHandling from "../../../composables/application/notificationHandling";
import {useStore} from "vuex";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const tblHeader = [
  { text: 'නම', value: 'Name' },
  { text: 'දුරකථන අංකය', value: 'PhoneNumber' },
  { text: 'ජා.හැ.අං', value: 'NIC' },
  { text: 'ලිපිනය', value: 'Address' },
];

const detailModal = ref(null);
const loader = ref(null);
const allReps = ref([]);

const handleShowModal = async (dataset) => {
  detailModal.value.showModal();

  console.log('show dataset', dataset);
  allReps.value = dataset;
};

const repName = ref(null);
const repMobileNo = ref(null);
const repNIC = ref(null);
const repAddress = ref(null);
const formSubmitted = ref(false);
const store = useStore();



const submitForm = async () => {
  formSubmitted.value = true;
  let repExists = _.find(allReps.value,{'NIC':repNIC.value})
  if (repExists){
    notificationHandling('error','නියෝජිතයාගේ ජා.හැ.අං මීට පෙර ඇතුලත් කර ඇත.');
    return false;
  }

  let nameExists = _.find(allReps.value,{'Name':repName.value})
  if (nameExists){
    notificationHandling('error','නියෝජිතයාගේ නම මීට පෙර ඇතුලත් කර ඇත.');
    return false;
  }

  let formData = {
    repName : repName.value,
    repMobileNo : repMobileNo.value,
    repNIC : repNIC.value,
    repAddress : repAddress.value,
  }

  console.log("Form Data Submitted:", formData);

  loader.value = $loading.show();

  setTimeout(async () => {
    if (store.getters.hasValidationErrors) {
      notificationHandling("error", "කරුනාකර නිවැරදි දත්ත ඇතුලත් කරන්න!");
      loader.value.hide();
    } else {
      // console.log("Saving dataset:", formData);
      //
      // const payload = {
      //   url: baseURL + '/api/v1/general-queries/addData',
      //   data: JSON.stringify({
      //     collection: 'reps',
      //     data: JSON.stringify(formData),
      //   })
      // };
      // const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'Shops');
      //
      //
      // if (json_data.value) {

        await createUser()
        notificationHandling('success', 'සාර්ථකව ඇතුලත් කළා!');
      // }
    }
  }, 1000);
};


const createUser = async () => {

  let password = '1234';
  let formData = {
    Name: repName.value,
    PhoneNumber: repMobileNo.value,
    NIC: repNIC.value,
    Address: repAddress.value,
    Email: repName.value,
    password: password,
    USRACC_USER_ID:repName.value,
    role:'rep'
  }

  const payload = {
    url: baseURL + '/api/v1/auth/create/users',
    data: JSON.stringify({
      collection: 'users',
      data: JSON.stringify(formData),
    })
  };
  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'Shops');
  loader.value.hide();

  window.location.reload()
}
const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

defineExpose({
  detailModal,
  handleShowModal
});
</script>
