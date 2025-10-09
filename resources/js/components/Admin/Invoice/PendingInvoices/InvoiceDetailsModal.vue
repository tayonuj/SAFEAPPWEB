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

      <button
          class="btn btn-sm btn-falcon-info mb-2"
          @click="printReciept"
      >
        රිසිට් පත ලබාගන්න
        <i class="fa fa-print"></i>
      </button>

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

      <Card v-if="detailData.returns && detailData.returns.length > 0" class="mt-4">
        <CardBody>
          <h5 class="mb-3 text-danger">ආපසු ලැබීම්</h5>

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
          <h5 class="mb-3 text-danger">Returned භාණ්ඩ </h5>

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


      <button class="btn btn-success d-block w-100 mt-3" type="button" @click="approveInvoice">
        අනුමත කරන්න
      </button>

    </div>
  </Modal>
</template>

<script setup>
import {getCurrentInstance, inject, ref} from 'vue';
import Modal from '../../../bootstrap/Modal.vue';
import CardBody from "../../../bootstrap/CardBody.vue";
import ujPDFExport from "../../../../composables/application/ujPDFExport";
import _ from "lodash";
import moment from "moment";
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../../composables/application/notificationHandling";

const detailModal = ref(null);
const detailData = ref({});
const stocks = ref([]);
const title = ref("බිල්පත් විස්තරය")
const $loading = inject('$loading');
const baseURL = inject("$baseURL");

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

const handleShowModal = async (dataset) => {
  detailModal.value.showModal();
  detailData.value = dataset.dataset;

  if (detailData.value){
    title.value = "බිල්පත් අංක : "+detailData.value.invoiceNumber;
  }
  await loadStocks()
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

  )}


const {proxy} = getCurrentInstance();
const approveInvoice = async () => {
  const confirmed = await proxy.$confirm({
    title: 'තහවුරු කරන්න!',
    message: 'ඉන්වොයිසය අනුමත කිරීම තහවුරු කරන්න'
  });
  if (confirmed) {
    updateData()
    await addToExpenses();
    await updateInvoiceData()
    window.location.reload()
  }
}

const updateData = async () => {
  // Wait for each product stock to update (sequentially)
  for (const item of detailData.value.products) {
    const prdct = _.find(stocks.value, {product_id: item.productCode});
    if (prdct) {
      await updateProductData(prdct, item.quantity, 'remove');
    }
  }

  // Wait for each return stock to update (sequentially)
  for (const item of detailData.value.returns) {
    const rprdct = _.find(stocks.value, {product_id: item.productCode});
    if (rprdct) {
      await updateProductData(rprdct, item.quantity, 'add');
    }
  }

}
// const updateData =  () => {
//
//   detailData.value.products.forEach(async function (item) {
//     console.log("productItems", item)
//     let prdct = _.find(stocks.value, {'product_id': item.productCode});
//     if (prdct) {
//       await updateProductData(prdct, item.quantity);
//     }
//   })
//
// }

const addToExpenses = async () => {

  const formData = {
    collection:'sales',
    collectionExplained:'භාණ්ඩ විකිනීම්',
    category:'Income',
    billNo:detailData.value.invoiceNo,
    amount:parseFloat(detailData.value.netAmount),
    profit:parseFloat(detailData.value.totalProfit),
    paidFromTo:detailData.value.shopName,
    date:moment(detailData.value.billDate).format('YYYY-MM-DD'),
    user:detailData.value.repName,
  }

  let loading = $loading.show()
  const payload = {
    url: baseURL + '/api/v1/general-queries/addData',
    data: JSON.stringify({
      collection: 'IncomeExpenses',
      data: JSON.stringify(formData),
    })
  };

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'IncomeExpenses');
  loading.hide();
  notificationHandling('success',"ආඅදායමක් ඇතුලත් කලා!");
}
const updateProductData = async (product,quantity,type) => {
  let loading = $loading.show();
  let newQuantity = quantity;
  if (type === 'add'){
    newQuantity =  parseFloat(product.quantity)+quantity;
  }else{
    newQuantity =  parseFloat(product.quantity)-quantity;
  }


  const datasets = {
    quantity:newQuantity,
  }

  console.log("payload ",datasets)


  const payload = {
    url: baseURL+'/api/v1/general-queries/updateData',
    data: JSON.stringify({
      collection: 'products',
      identifier: product._id,
      data: JSON.stringify(datasets),
    })
  }

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false,'Products');
  loading.hide()

  if (json_data.value){

    product.quantity = newQuantity;

    const index = stocks.value.findIndex(p => p._id === product._id);
    if (index !== -1) {
      stocks.value[index].quantity = newQuantity;
      stocks.value = [...stocks.value]; // force reactivity
    }

    notificationHandling('success',product.productName+" යාවත් කාලීන කිරීම සාර්ථකයි!");
  }

};


const updateInvoiceData = async (product,quantity) => {
  let loading = $loading.show()
  let user = localStorage.getItem("user");
  let email = null;
  if (user){
    user = JSON.parse(user);
    email = user.Email;
  }
  const datasets = {
    status:"Approved",
    approved_by:email,
    approved_at:moment().format('YYYY-MM-DD hh:mm:ss A'),
  }

  console.log("payload ",datasets)


  const payload = {
    url: baseURL+'/api/v1/general-queries/updateData',
    data: JSON.stringify({
      collection: 'sales',
      identifier: detailData.value._id,
      data: JSON.stringify(datasets),
    })
  }

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false,'Products');
  loading.hide()

  if (json_data.value){
    notificationHandling('success',detailData.value.invoiceNumber+" අනුමත කිරීම තහවුරුයි!");
  }

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
