<template>
  <Modal ref="detailModal" title="සැපයුම් කරුවන්">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-12">
          <uj-input
              :model-value="companyName"
              :label="'සැපයුම්කරුගේ නම'"
              :required="true"
              :size="'medium'"
              :validation-types="['required']"
              @update:modelValue="value => companyName = value"
              :formSubmitted="formSubmitted"
          />
        </div>

        <div class="col-lg-6 col-md-6 col-sm-12">
          <uj-input
              :model-value="companyTelNumber"
              :label="'ආයතනයේ දු.අංකය'"
              :validation-types="['phoneNumber']"
              :size="'medium'"
              @update:modelValue="value => companyTelNumber = value"
              :formSubmitted="formSubmitted"
          />

        </div>

    </div>

    <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-12">
          <uj-input
              :model-value="repName"
              :label="'සැපයුම්කරුගේ නියෝජිතයාගේ නම'"
              :required="true"
              :size="'medium'"
              :validation-types="['required']"
              @update:modelValue="value => repName = value"
              :formSubmitted="formSubmitted"
          />
        </div>

        <div class="col-lg-6 col-md-6 col-sm-12">
          <uj-input
              :model-value="repTelNumber"
              :label="'සැපයුම්කරුගේ නියෝජිතයාගේ දු.අංකය'"
              :required="true"
              :validation-types="['required','phoneNumber']"
              :size="'medium'"
              @update:modelValue="value => repTelNumber = value"
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
          :data="companies"
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
import Modal from "../../../bootstrap/Modal.vue";
import UjInput from "../../../Reusables/UIComponents/ujInput.vue";
import VueTable from "../../../plugins/VueTable.vue";
import notificationHandling from "../../../../composables/application/notificationHandling";
import {useStore} from "vuex";
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const tblHeader = [
  { text: 'ආයතනයේ නම', value: 'companyName' },
  { text: 'ආයතනයේ දු.අංකය', value: 'companyTelNumber' },
  { text: 'රෙප්ගේ නම', value: 'repName' },
  { text: 'රෙප්ගේ දු.අංකය', value: 'repTelNumber' },
];

const detailModal = ref(null);
const loader = ref(null);
const companies = ref([]);

const handleShowModal = async (dataset) => {
  detailModal.value.showModal();
  companies.value = dataset;
  console.log('show dataset', dataset);
};

const companyName = ref(null);
const repName = ref(null);
const companyTelNumber = ref(null);
const repTelNumber = ref(null);

const formSubmitted = ref(false);
const store = useStore();



const submitForm = async () => {
  loader.value = $loading.show();


  let companyExists = _.find(companies.value,{'companyName':companyName.value})
  if (companyExists){
    notificationHandling('error','ආයතනයේ නම මීට පෙර ඇතුලත් කර ඇත.');
    return false;
  }
  formSubmitted.value = true;
  let formData = {
    companyName : companyName.value,
    companyTelNumber : companyTelNumber.value?companyTelNumber.value.toString():'',
    repName : repName.value,
    repTelNumber : repTelNumber.value?repTelNumber.value.toString():'',
  }

  console.log("Form Data Submitted:", formData);


  setTimeout(async () => {
    if (store.getters.hasValidationErrors) {
      notificationHandling("error", "කරුනාකර නිවැරදි දත්ත ඇතුලත් කරන්න!");
      loader.value.hide();
    } else {
      console.log("Saving dataset:", formData);

      const payload = {
        url: baseURL + '/api/v1/general-queries/addData',
        data: JSON.stringify({
          collection: 'companies',
          data: JSON.stringify(formData),
        })
      };

      const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'ProductCategory');
      loader.value.hide();

      if (json_data.value) {
        notificationHandling('success', 'සාර්ථකව ඇතුලත් කළා!');
        window.location.reload()
      }
    }
  }, 1000);
};
const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const loadCompanies = async () => {
  const payload = {
    url: baseURL+'/api/v1/general-queries/readData',
    data: JSON.stringify({
      collection: 'companies',
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  if (json_data.value) {
    companies.value = json_data.value;
  }
};

defineExpose({
  detailModal,
  handleShowModal
});
</script>
