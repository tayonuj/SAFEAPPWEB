<template>
  <Modal ref="detailModal" :title="title" size="modal-xl">
    <div class="container p-4 bg-white rounded-lg shadow-md">
      <div class="mb-4">
        <Card>
          <CardBody>
            <div class="bg-holder bg-card" :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-1.png)` }"></div>

            <div class="flex justify-between mb-4">
              <div>
                <p class="text-gray-700">ආයතනය : <span class="font-semibold">{{detailData.companyName}}</span></p>
                <p class="text-gray-700">බිල්පත් අංකය : <span class="font-semibold">{{detailData.billNumber}}</span></p>
                <p class="text-gray-700">බිල්පත් දිනය : <span class="font-semibold">{{formatDate(detailData.billDate?.$date?.$numberLong)}}</span></p>
              </div>
              <div class="text-right">
                <p class="text-gray-700">බිල්පතේ මුලු වටිනාකම : <span class="font-semibold text-xl">Rs. {{numeralFormat(detailData.billAmount)}}</span></p>
              </div>
            </div>
          </CardBody>
        </Card>

      </div>

      <Card>
        <CardBody>
          <div class="bg-holder bg-card" :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-3.png)` }"></div>

          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border rounded-md">
              <thead>
              <tr class="bg-gray-200">
                <th class="py-2 px-4 border">#</th>
                <th class="py-2 px-4 border">භාණ්ඩ අංකය</th>
                <th class="py-2 px-4 border">භාණ්ඩයේ නම</th>
                <th class="py-2 px-4 border">ප්‍රමාණය</th>
                <th class="py-2 px-4 border">ලේබල් මිල මිල</th>
                <th class="py-2 px-4 border">ඒකකයක වැටෙන මිල</th>
                <th class="py-2 px-4 border">සම්පූරණ මිල</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(product, index) in detailData.products" :key="index" class="hover:bg-gray-100">
                <td class="py-2 px-4 border">{{ index + 1 }}</td>
                <td class="py-2 px-4 border">{{ product.productCode }}</td>
                <td class="py-2 px-4 border">{{ product.productName }}</td>
                <td class="py-2 px-4 border">{{ product.quantity }}</td>
                <td class="py-2 px-4 border">Rs. {{ product.priceLabled }}</td>
                <td class="py-2 px-4 border">Rs. {{ product.pricePerUnit }}</td>
                <td class="py-2 px-4 border">Rs. {{ product.totalPrice }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

    </div>
  </Modal>
</template>

<script setup>
import {ref} from 'vue';
import Modal from '../../../bootstrap/Modal.vue';
import CardBody from "../../../bootstrap/CardBody.vue";

const detailModal = ref(null);
const detailData = ref({});
const title = ref("බිල්පත් විස්තරය")
const handleShowModal = async (dataset) => {
  detailModal.value.showModal();
  detailData.value = dataset.dataset;

  if (detailData.value){
    title.value = "බිල්පත් අංක : "+detailData.value.billNumber;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
