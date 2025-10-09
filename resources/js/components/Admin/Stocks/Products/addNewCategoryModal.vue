<template>
  <Modal ref="detailModal" title="භාණ්ඩ වර්ග ">
    <div class="container">
      <div class="row">
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="categoryName"
            :label="'නම'"
            :required="true"
            :validation-types="['required']"
            :size="'medium'"
            @update:modelValue="value => categoryName = value"
            :formSubmitted="formSubmitted"
        />
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="categoryNameEnglish"
            :label="'ඉංග්‍රීසි නම'"
            :validation-types="['required']"
            :required="true"
            :size="'medium'"
            @update:modelValue="value => categoryNameEnglish = value"
            :formSubmitted="formSubmitted"
        />
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="categoryCode"
            :label="'වර්ගයේ අංකය'"
            :required="true"
            :is-disabled="true"
            :size="'medium'"
            @update:modelValue="value => categoryCode = value"
            :formSubmitted="formSubmitted"
        />
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12"></div>

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
          :data="categories"
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
  { text: 'නම', value: 'categoryName' },
  { text: 'ඉංග්‍රීසි නම', value: 'categoryNameEnglish' },
  { text: 'වර්ගයේ අංකය', value: 'categoryCode' },
];

const detailModal = ref(null);
const loader = ref(null);
const categories = ref([]);

const handleShowModal = async (dataset) => {
  detailModal.value.showModal();

  console.log('show dataset', dataset);
  categories.value = dataset;
};

const categoryCode = ref(null);
const categoryName = ref(null);
const categoryNameEnglish = ref('');
const formSubmitted = ref(false);
const store = useStore();

watch(categoryNameEnglish, function (name) {
  categoryCode.value = `SMF${name.toUpperCase()}${categories.value?categories.value.length +1:1}`
})


const submitForm = async () => {
  formSubmitted.value = true;
  let categoryExists = _.find(categories.value,{'categoryName':categoryName.value})
  if (categoryExists){
    notificationHandling('error','නම මීට පෙර ඇතුලත් කර ඇත.');
    loader.value.hide();
    return false;
  }

  loader.value = $loading.show();

  let formData = {
    categoryName : categoryName.value,
    categoryNameEnglish : categoryNameEnglish.value,
    categoryCode : categoryCode.value,
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
          collection: 'product_categories',
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
