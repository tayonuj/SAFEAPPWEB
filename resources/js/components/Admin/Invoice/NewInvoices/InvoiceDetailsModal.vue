<template>
  <Modal ref="detailModal" :title="title" size="modal-xl">
    <div class="container p-4 bg-white rounded-lg shadow-md">
      <div class="mb-4">
        <Card>
          <CardBody>
            <div class="bg-holder bg-card" :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-1.png)` }"></div>

            <div class="flex justify-between mb-2">
              <div class="row">
                <div class="col-12 col-md-6 col-lg-6">
                  <p class="text-gray-700">ආයතනය : <span class="font-semibold">{{detailData.shopName}}</span></p>
                  <p class="text-gray-700">නියෝජිතයා (rep) : <span class="font-semibold">{{detailData.repName}}</span></p>
                  <p class="text-gray-700">බිල්පත් අංකය : <span class="font-semibold">{{detailData.invoiceNumber}}</span></p>
                  <p class="text-gray-700">බිල්පත් දිනය : <span class="font-semibold">{{formatDate(detailData.billDate?.$date?.$numberLong)}}</span></p>
                </div>
                <div class="col-12 col-md-6 col-lg-6">
                  <div class="text-right">
                    <p class="text-gray-700">බිල්පතේ මුලු වටිනාකම : <span class="font-semibold text-xl">Rs. {{numeralFormat(detailData.billAmount)}}</span></p>
                    <p class="text-gray-700">ආපසු ගත් (Returns) වටිනාකම : <span class="font-semibold text-xl">Rs. {{numeralFormat(detailData.returnAmount)}}</span></p>
                    <p class="text-gray-700">නිවැරදි මුළු මුදල (Net Total) : <span class="font-semibold text-xl">Rs. {{numeralFormat(detailData.netAmount)}}</span></p>
                  </div>
                </div>

              </div>

            </div>

          </CardBody>
        </Card>

      </div>

      <div class="row">
        <div class="col col-lg-4 col-md-4 col-sm-6">
          <button
              class="btn btn-sm btn-falcon-info mb-2"
              @click="printReciept"
          >
            රිසිට් පත ලබාගන්න
            <i class="fa fa-print"></i>
          </button>
        </div>
        <div class="col col-lg-4 col-md-4 col-sm-6">
          <button
              class="btn btn-sm btn-falcon-danger mb-2"
              @click="showReturnModal(detailData)"
          >
            ආපසු ලැබීම් එකතු කරන්න
            <i class="fa fa-refresh"></i>
          </button>
        </div>
      </div>


      <Card>
        <CardBody>
          <h5 class="mb-3 text-success">විකුණූ භාණ්ඩ (Sold Items)</h5>
          <div class="bg-holder bg-card" :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-3.png)` }"></div>

          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border rounded-md">
              <thead>
              <tr class="bg-gray-200">
                <th class="py-2 px-4 border">#</th>
                <th class="py-2 px-4 border">භාණ්ඩ අංකය</th>
                <th class="py-2 px-4 border">භාණ්ඩයේ නම</th>
                <th class="py-2 px-4 border">ප්‍රමාණය</th>
                <th class="py-2 px-4 border">ඒකකයක මිල රු.</th>
                <th class="py-2 px-4 border">සම්පූරණ මිල රු.</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(product, index) in detailData.products" :key="index" class="hover:bg-gray-100">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ product.productCode }}</td>
                <td class="py-2 px-4 border">{{ product.productName }}</td>
                <td class="py-2 px-4 border">{{ product.quantity }}</td>
                <td class="py-2 px-4 border">Rs. {{ numeralFormat(product.unit_selling_price) }}</td>
                <td class="py-2 px-4 border">Rs. {{ numeralFormat(product.amount) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card v-if="detailData.returnsNormal && detailData.returnsNormal.length > 0" class="mt-4">
        <CardBody>
          <h5 class="mb-3 text-danger">ආපසු ගත් භාණ්ඩ</h5>

          <div class="bg-holder bg-card" :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-3.png)` }"></div>

          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border rounded-md">
              <thead>
              <tr class="bg-red-100 text-red-800">
                <th class="py-2 px-4 border">#</th>
                <th class="py-2 px-4 border">භාණ්ඩ අංකය</th>
                <th class="py-2 px-4 border">භාණ්ඩයේ නම</th>
                <th class="py-2 px-4 border">ප්‍රමාණය</th>
                <th class="py-2 px-4 border">ඒකකයක මිල රු.</th>
                <th class="py-2 px-4 border">සම්පූරණ මිල රු.</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(product, index) in detailData.returnsNormal" :key="index" class="hover:bg-red-50">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ product.productCode }}</td>
                <td class="py-2 px-4 border">{{ product.productName }}</td>
                <td class="py-2 px-4 border">{{ product.quantity }}</td>
                <td class="py-2 px-4 border">Rs. {{ product.unit_selling_price }}</td>
                <td class="py-2 px-4 border">Rs. {{ product.amount }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card v-if="detailData.returns && detailData.returns.length > 0" class="mt-4">
        <CardBody>
          <h5 class="mb-3 text-danger">Returned භාණ්ඩ</h5>

          <div class="bg-holder bg-card" :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-3.png)` }"></div>

          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border rounded-md">
              <thead>
              <tr class="bg-red-100 text-red-800">
                <th class="py-2 px-4 border">#</th>
                <th class="py-2 px-4 border">භාණ්ඩ අංකය</th>
                <th class="py-2 px-4 border">භාණ්ඩයේ නම</th>
                <th class="py-2 px-4 border">ප්‍රමාණය</th>
                <th class="py-2 px-4 border">ඒකකයක මිල රු.</th>
                <th class="py-2 px-4 border">සම්පූරණ මිල රු.</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(product, index) in detailData.returns" :key="index" class="hover:bg-red-50">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ product.productCode }}</td>
                <td class="py-2 px-4 border">{{ product.productName }}</td>
                <td class="py-2 px-4 border">{{ product.quantity }}</td>
                <td class="py-2 px-4 border">Rs. {{ product.unit_selling_price }}</td>
                <td class="py-2 px-4 border">Rs. {{ product.amount }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <ReturnItemsModal  ref="returnItemModal"/>

    </div>
  </Modal>
</template>

<script setup>
import {ref} from 'vue';
import Modal from '../../../bootstrap/Modal.vue';
import CardBody from "../../../bootstrap/CardBody.vue";
import ujPDFExport from "../../../../composables/application/ujPDFExport";
import moment from "moment/moment";
import ReturnItemsModal from "./returnItemsModal.vue";

const detailModal = ref(null);
const detailData = ref({});
const title = ref("බිල්පත් විස්තරය")
const handleShowModal = async (dataset) => {
  detailModal.value.showModal();
  detailData.value = dataset.dataset;

  if (detailData.value){
    title.value = "බිල්පත් අංක : "+detailData.value.invoiceNumber;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(parseInt(timestamp));
  return moment(date).format('YYYY-MM-DD');
};


const printReciept = () => {
  ujPDFExport(detailData.value.products,
      detailData.value.billAmount,
      detailData.value.invoiceNumber,
      detailData.value.repName,
      detailData.value.shopName,
      detailData.value.invoiceNumber,
      detailData.value.returns || [],
      detailData.value.returnsNormal || [],
      detailData.value.returnAmount || 0

  )
}

const returnItemModal = ref(null);
const showReturnModal = (dataset) => {
  returnItemModal.value.handleShowModal(dataset, true);
};

defineExpose({
  detailModal,
  handleShowModal,
});
</script>

<style scoped>

.font-semibold{
  font-weight: 600;

}
</style>
