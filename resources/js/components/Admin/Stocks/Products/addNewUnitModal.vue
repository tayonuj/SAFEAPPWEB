<template>
  <Modal ref="detailModal" title="ඒකක වර්ග ">
    <div class="container">
      <div class="row">
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="unitName"
            :label="'නම'"
            :required="true"
            :size="'medium'"
            :validation-types="['required']"
            @update:modelValue="value => unitName = value"
            :formSubmitted="formSubmitted"
        />
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="unitItemCount"
            :label="'ඒකකයට ඇති කොටස් ගණන'"
            :required="true"
            :size="'medium'"
            :validation-types="['required']"
            :type="'number'"
            @update:modelValue="value => unitItemCount = value"
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
          :data="allUnits"
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
  { text: 'නම', value: 'unitName' },
  { text: 'ඒකකයට ඇති කොටස් ගණන', value: 'unitItemCount' },
];

const detailModal = ref(null);
const loader = ref(null);
const allUnits = ref([]);

const handleShowModal = async (dataset) => {
  detailModal.value.showModal();

  console.log('show dataset', dataset);
  allUnits.value = dataset;
};

const unitName = ref(null);
const unitItemCount = ref(1);
const formSubmitted = ref(false);
const store = useStore();



const submitForm = async () => {

  formSubmitted.value = true;

  let unitExists = _.find(allUnits.value,{'unitName':unitName.value})
  if (unitExists){
    notificationHandling('error','ඒකකයේ නම මීට පෙර ඇතුලත් කර ඇත.');
    return false;
  }
  loader.value = $loading.show();

  let formData = {
    unitName : unitName.value,
    unitItemCount : unitItemCount.value,
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
          collection: 'product_units',
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

defineExpose({
  detailModal,
  handleShowModal
});
</script>
