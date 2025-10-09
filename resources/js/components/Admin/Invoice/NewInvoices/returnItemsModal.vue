<template>
  <Modal ref="returnItemSelectModal" :title="title" size="modal-xl">
    <div class="container p-4 bg-white rounded-lg shadow-md">

      <Card v-if="detailData" class="mt-4">
        <CardBody>
          <h5 class="mb-3 text-danger">ආපසු ගත් භාණ්ඩ</h5>
          <div class="col-12 col-lg-6 col-md-6 col-sm-12 mb-2 mt-4">
            <button type="button" class="btn btn-falcon-danger me-1 mb-3 btn-sm" @click="showReturnModal(stocks)">
              ආපසු ගත් භාණ්ඩ එකතු කරන්න
            </button>
          </div>


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
              <tr v-for="(product, index) in returns_array" :key="index" class="hover:bg-red-50">
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

      <div class="d-grid gap-2 mt-4 mb-4">
        <button
            class="btn btn-primary"
            type="button"
            @click="saveInvoice"
            v-bind:class="!returns_array || returns_array.length === 0?'disabled':''"
        >
          බිල්පත Update කරන්න
        </button>
      </div>

      <stock-list ref="stockModal" @addToReturns="addProductToReturns" />



    </div>
  </Modal>
</template>

<script setup>
import {computed, getCurrentInstance, inject, ref} from 'vue';
import Modal from '../../../bootstrap/Modal.vue';
import CardBody from "../../../bootstrap/CardBody.vue";
import ujPDFExport from "../../../../composables/application/ujPDFExport";
import moment from "moment/moment";
import StockList from "../StockList.vue";
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../../composables/application/notificationHandling";

const returnItemSelectModal = ref(null);
const detailData = ref({});
const title = ref("බිල්පත් විස්තරය");
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const stocks = ref([]);
const {proxy} = getCurrentInstance();
const returns_array = ref([]);
const totalReturnAmount = computed(() => {
  return returns_array.value.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
});
const handleShowModal = async (dataset) => {
  returnItemSelectModal.value.showModal();
  detailData.value = dataset;

  if (detailData.value){
    title.value = "භාණ්ඩ නැවත ලබාගැනීම";
    loadStocks()
  }
};

const addProductToReturns = (product) => {
  returns_array.value.push(product);
};

const saveInvoice = async () => {

  const confirmed = await proxy.$confirm({
    title: 'තහවුරු කරන්න!',
    message: 'ඉන්වොයිසය ඇතුලත් කිරීම තහවුරු කරන්න'
  });
  if (confirmed) {
    let loading = $loading.show();

    // const dataset = {
    //   invoiceNumber: invoiceNo.value,
    //   products: products.value,
    //   billAmount: parseFloat(totalAmount.value),
    //   billProfit: parseFloat(totalProfit.value),
    //   billDate: moment(billDate.value).format('YYYY-MM-DD'),
    //
    //   repName:repName.value,
    //   shopName:shopName.value,
    //
    //   returns: returns_array.value,
    //   returnAmount: parseFloat(totalReturnAmount.value),
    //   netAmount: parseFloat(netAmount.value),
    //   status:'Approved'
    // }

    let returndataset = detailData.value && detailData.value.returnsNormal? _.concat(detailData.value.returnsNormal,returns_array.value) : returns_array.value;
    // Alert.alert(JSON.stringify(returndataset));
    const dataset = {
      returnCollectedRepName:"System Admin",
      returnsNormal: returndataset,
      returnAmount: detailData.value.returnAmount && detailData.value.returnAmount > 0?detailData.value.returnAmount+parseFloat(totalReturnAmount.value) :parseFloat(totalReturnAmount.value),
      netAmount: parseFloat(netAmount.value),
      status:'Pending'
    };
    const payload = {
      url: baseURL + '/api/v1/general-queries/updateData',
      data: JSON.stringify({
        collection: 'sales',
        identifier:detailData.value._id,
        data: JSON.stringify(dataset),
      })
    };
    const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'Sales');


    if (json_data.value) {

      notificationHandling('success', 'බිල්පත නිකුත් කිරීම සාර්ථකයි!');
      // console.log("completed records")
      setTimeout(async () => {
        loading.hide();
        window.location.reload()
      },6800)
      //
    }
  }


}

const netAmount = computed(() => {
  let rtn = detailData.value.returnAmount && detailData.value.returnAmount > 0?detailData.value.returnAmount+parseFloat(totalReturnAmount.value) :parseFloat(totalReturnAmount.value)
  return (detailData.value.netAmount - rtn).toFixed(2);
});


const stockModal = ref(null);
const showReturnModal = (dataset) => {
  stockModal.value.handleShowModal(dataset, true);
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(parseInt(timestamp));
  return moment(date).format('YYYY-MM-DD');
};

const loadStocks = async () => {
  const payload = {
    url: baseURL+'/api/v1/general-queries/readData',
    data: JSON.stringify({
      collection: 'products',
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  if (json_data.value) {
    stocks.value = json_data.value;
  }
};

defineExpose({
  returnItemSelectModal,
  handleShowModal,
});
</script>

<style scoped>

.font-semibold{
  font-weight: 600;

}
</style>
