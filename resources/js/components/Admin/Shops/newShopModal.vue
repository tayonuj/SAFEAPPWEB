<template>
  <Modal ref="detailModal" title="ඒකක වර්ග ">
    <div class="container">
      <div class="row">
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="shopName"
            :label="'කඩේ නම'"
            :required="true"
            :size="'medium'"
            @update:modelValue="value => shopName = value"
            :formSubmitted="formSubmitted"
        />
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="ownerName"
            :label="'හිමිකරුගේ නම'"
            :required="true"
            :size="'medium'"
            @update:modelValue="value => ownerName = value"
            :formSubmitted="formSubmitted"
        />
      </div>

      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="shopTelNo"
            :label="'දුරකථන අංකය'"
            :required="true"
            :size="'medium'"
            @update:modelValue="value => shopTelNo = value"
            :formSubmitted="formSubmitted"
        />
      </div>

      <div class="col-lg-6 col-md-6 col-sm-12">
        <uj-input
            :model-value="shopAddress"
            :label="'ලිපිනය'"
            :required="true"
            :size="'medium'"
            @update:modelValue="value => shopAddress = value"
            :formSubmitted="formSubmitted"
        />
      </div>

        <div class="col-lg-6 col-md-6 col-sm-12">
          <uj-select
              :model-value="shopLine"
              :label="'Sales ලයින් එක/Area එක'"
              :required="true"
              :items="['අම්බලන්තොට','ලුණම','තිස්සමහාරාම','සූරියවැව','හම්බන්තොට']"
              :validation-types="['required']"
              :size="'medium'"
              @update:modelValue="value => shopLine = value"
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
import UjSelect from "../../Reusables/UIComponents/ujSelect.vue";
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const tblHeader = [
  { text: 'කඩේ නම', value: 'shopName' },
  { text: 'හිමිකරුගේ නම', value: 'ownerName' },
  { text: 'දුරකථන අංකය', value: 'shopTelNo' },
  { text: 'ලිපිනය', value: 'shopAddress' },
];

const detailModal = ref(null);
const loader = ref(null);
const categories = ref([]);

const handleShowModal = async (dataset) => {
  detailModal.value.showModal();

  console.log('show dataset', dataset);
  categories.value = dataset;
};

const shopName = ref(null);
const ownerName = ref(null);
const shopTelNo = ref(null);
const shopAddress = ref(null);
const shopLine = ref(null);
const formSubmitted = ref(false);
const store = useStore();



const submitForm = async () => {
  loader.value = $loading.show();

  let formData = {
    shopName : shopName.value,
    ownerName : ownerName.value,
    shopTelNo : shopTelNo.value,
    shopAddress : shopAddress.value,
    shopLine : shopLine.value,

  }

  console.log("Form Data Submitted:", formData);
  formSubmitted.value = true;

  setTimeout(async () => {
    if (store.getters.hasValidationErrors) {
      notificationHandling("error", "Please resolve the errors before submitting!");
    } else {
      console.log("Saving dataset:", formData);

      const payload = {
        url: baseURL + '/api/v1/general-queries/addData',
        data: JSON.stringify({
          collection: 'shops',
          data: JSON.stringify(formData),
        })
      };

      const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'Shops');
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
