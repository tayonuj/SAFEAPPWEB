<template>
  <div>
    <div class="mt-3 mb-4">
      <nav style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
          <li class="breadcrumb-item"><a href="/invoice">බිල්පත්</a></li>
          <li class="breadcrumb-item active" aria-current="page">බිල්පතක් ඇතුලත් කිරීම</li>
        </ol>
      </nav>
    </div>
  </div>
  <button class="btn btn-falcon-success mb-3" @click="showShopModal(shops)">ආයතන / කඩ  ඇතුලු කරන්න</button>
  <button class="btn btn-falcon-warning mb-3" style="margin-left: 10px" @click="showRepModal(reps)">රෙප් (නියෝජිතයන්) ඇතුලු කරන්න</button>

  <Card >
    <card-body>

      <div class="d-flex mb-4 mt-2">

        <div class="col">
          <h5 class="mb-0 text-primary position-relative">
            <span class="bg-201 dark__bg-1100 pe-3"><b>බිල්පත් අංක {{ invoiceNo }} </b></span>
           </h5>
        </div>
      </div>
      <div class="row">
        <!--    <div class="col-12 col-lg-6 col-md-6 col-sm-12">-->
        <!--      <uj-input -->
        <!--      :placeholder="'බිල්පත් අංකය'"-->
        <!--      :label="'බිල්පත් අංකය'"-->
        <!--      :required="true" :size="'medium'"-->
        <!--      :validation-types="['required']"-->
        <!--      @update:modelValue="value => invoiceNo = value"-->
        <!--      :formSubmitted="formSubmitted"-->
        <!--      />-->
        <!--    </div>-->
        <div class="col-12 col-lg-4 col-md-4 col-sm-12">
          <uj-select
              :model-value="shopName"
              :label="'ආයතනයේ / කඩේ නම'"
              :required="true" :size="'medium'"
              :validation-types="['required']"
              :items="shopNames"
              @update:modelValue="value => shopName = value"
              :formSubmitted="formSubmitted"
          />
        </div>

        <div class="col-12 col-lg-4 col-md-4 col-sm-12">
          <uj-select
              :model-value="repName"
              :label="'රෙප්ගේ නම'"
              :required="true" :size="'medium'"
              :validation-types="['required']"
              :items="repNameList"
              @update:modelValue="value => repName = value"
              :formSubmitted="formSubmitted"
          />
        </div>

        <div class="col-12 col-lg-4 col-md-4 col-sm-12">
            <div class="d-flex justify-content-between">
              <label for="from">දිනය</label>
            </div>
            <uj-date-picker
                style="margin-top: -25px"
                v-model="billDate"
                :enable-time-picker="false"
                type="date"
                id="from"
                format="yyyy-MM-dd"
            />
        </div>

      </div>

      <hr />
      <div class="col-12 col-lg-6 col-md-6 col-sm-12 mb-4">
        <button type="button" class="btn btn btn-falcon-info me-1 mb-3 btn-sm" @click="showStockModal(stocks)">
          භාන්ඩ එකතු කරන්න
        </button>
      </div>
      <div>
        <table class="table table-bordered">
          <thead>
          <tr class="table-primary">
            <th>#</th>
            <th>නම</th>
            <th>ඒකකයක මිල රු.</th>
            <th>ප්‍රමාණය</th>
            <th>සම්පූරණ මිල</th>
            <th></th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="(item,index) in products" :key="index" class="table-secondary m-3">
            <td>{{index +1}}</td>
            <td>{{item.productName}}</td>
            <td>
              <input type="number" v-model.number="item.unit_selling_price" @input="updateItemPrice(index, true)" class="form-control form-control-sm" />
            </td>
            <td>
              <vue-number-input
                  class="form-control-md"
                  v-model.number="item.quantity"
                  :min="1"
                  :max="9900000"
                  size="small"
                  inline
                  controls
                  @update:model-value="updateItemPrice(index)"
              ></vue-number-input>
            </td>
            <td>{{item.amount}}</td>
            <td>
              <button class="btn btn-danger btn-sm" @click="removeItem(index)">
                <i class="fa fa-trash"></i>
              </button>
            </td>
          </tr>
          </tbody>
          <tfoot>
          <tr class="table-success">
            <td colspan="4" class="text-end"><b>Invoice මුදල (රු.)</b></td>
            <td>
              <b>
                {{totalAmount}}
<!--                <input type="number" v-model.number="totalAmount"  class="form-control form-control-sm" />-->
              </b>
            </td>
          </tr>

          <tr class="table-warning">
            <td colspan="4" class="text-end"><b>ලාභය (රු.)</b></td>
            <td>
              <b>
                {{totalProfit}}
<!--                <input type="number" v-model.number="totalAmount"  class="form-control form-control-sm" />-->
              </b>
            </td>
          </tr>

          <tr class="table-danger">
            <td colspan="4" class="text-end"><b>ආපසු ගත් (Returns) මුදල</b></td>
            <td><b>{{ totalReturnAmount }}</b></td>
          </tr>

          <tr class="table-success">
            <td colspan="4" class="text-end"><b>නිවැරදි මුළු මුදල (Net Total)</b></td>
            <td><b>{{ netAmount }}</b></td>
          </tr>
          </tfoot>

        </table>


        <hr />
        <!-- Returns Section -->
        <div class="col-12 col-lg-6 col-md-6 col-sm-12 mb-2 mt-4">
          <button type="button" class="btn btn-falcon-danger me-1 mb-3 btn-sm" @click="showReturnModal(stocks)">
            Return භාණ්ඩ  එකතු කරන්න
          </button>
        </div>
        <table class="table table-bordered">
          <thead>
          <tr class="table-danger">
            <th>#</th>
            <th>නම</th>
            <th>ඒකකයක මිල</th>
            <th>ප්‍රමාණය</th>
            <th>මුළු මුදල</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in returns_array" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.productName }}</td>
            <td>{{ item.unit_selling_price }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.amount }}</td>
            <td>
              <button class="btn btn-sm btn-danger" @click="removeReturnItem(index)">
                <i class="fa fa-trash"></i>
              </button>
            </td>
          </tr>
          </tbody>
          <tfoot>
          <tr class="table-warning">
            <td colspan="4" class="text-end"><b>ආපසු ගත් මුදල</b></td>
            <td><b>{{ totalReturnAmount }}</b></td>
          </tr>
          </tfoot>
        </table>


        <div class="d-grid gap-2 mt-4 mb-4">
          <button
              class="btn btn-primary"
              type="button"
              @click="saveInvoice"
              v-bind:class="!invoiceNo ||
               invoiceNo === '' || products.length === 0
               || !shopName || shopName === ''
               || !repName || repName === ''?'disabled':''"
          >
            බිල්පත නිකුත් කරන්න
          </button>
        </div>
      </div>



    </card-body>
  </Card>


<stock-list ref="stockModal" @addToInvoice="addProducttoInvoice"  @addToReturns="addProductToReturns" />
  <new-shop-modal ref="shopModal" />
  <new-rep-modal ref="repModal" />
</template>

<script setup>

import {computed, getCurrentInstance, inject, onMounted, ref} from "vue";
import UjSelect from "../../../Reusables/UIComponents/ujSelect.vue";
import UjDatePicker from "../../../Reusables/UIComponents/ujDatePicker.vue";
import CardBody from "../../../bootstrap/CardBody.vue";
import StockList from "../StockList.vue";
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
import NewShopModal from "../newShopModal.vue";
import NewRepModal from "../newRepModal.vue";
import moment from "moment/moment";
import notificationHandling from "../../../../composables/application/notificationHandling";
import ujPDFExport from "../../../../composables/application/ujPDFExport";
import _, {isArray} from "lodash";

const $loading = inject('$loading');
const baseURL = inject("$baseURL");

const invoiceNo = ref('')
const formSubmitted = ref(false);
const shopName = ref('');
const shops = ref([]);
const shopNames = ref([]);
const repNameList = ref([]);

const repName = ref('');
const reps = ref([]);
const stocks = ref([]);



const billDate = ref(new Date());
const stockModal = ref(null);

const showStockModal = (dataset) => {
  stockModal.value.handleShowModal(dataset);
}

const shopModal = ref(null);

const showShopModal = (dataset) => {
  shopModal.value.handleShowModal(dataset);
}

const repModal = ref(null);

const showRepModal = (dataset) => {
  repModal.value.handleShowModal(dataset);
}

// Compute the total amount
const totalAmount = computed(() => {
  return products.value.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
});

// Compute the total profit
const totalProfit = computed(() => {
  return products.value.reduce((sum, item) => sum + item.profitAmount, 0).toFixed(2);
});


const products = ref([]);
const addProducttoInvoice = (product) => {
  products.value.push(product);
}

// **Load products in stocks**
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


// **Load Shops**
const loadShops = async () => {
  const payload = {
    url: baseURL+'/api/v1/general-queries/readData',
    data: JSON.stringify({
      collection: 'shops',
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  if (json_data.value) {
    shops.value = json_data.value;
    shopNames.value = _.map(shops.value,'shopName');
  }
};

// **Load Sales Reps**
const loadReps = async () => {
  const payload = {
    url: baseURL+'/api/v1/general-queries/readData',
    data: JSON.stringify({
      collection: 'users',
      attr:'role',
      filter_array:JSON.stringify(['rep'])
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  if (json_data.value) {
    reps.value = json_data.value;
    repNameList.value = _.map(reps.value,'Name');
  }
};

const updateItemPrice = (index, updateUnitPrice = false) => {
  const item = products.value[index];

  if (updateUnitPrice) {
    // Update total price based on quantity and unit selling price
    item.amount = item.quantity * item.unit_selling_price;
    item.profitAmount = item.quantity * (item.unit_selling_price - item.buyingCost);
  } else {
    // Update total price based on quantity and existing price per unit
    item.amount = item.quantity * item.unit_selling_price;
    item.profitAmount = item.quantity * (item.unit_selling_price - item.buyingCost);

  }

  // Trigger Vue reactivity
  products.value = [...products.value];
};

const netAmount = computed(() => {
  return (parseFloat(totalAmount.value) - parseFloat(totalReturnAmount.value)).toFixed(2);
});



const returns_array = ref([]);
const totalReturnAmount = computed(() => {
  return returns_array.value.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
});

const showReturnModal = (dataset) => {
  stockModal.value.handleShowModal(dataset, true);
};

const addProductToReturns = (product) => {
  returns_array.value.push(product);
};





const {proxy} = getCurrentInstance();

const saveInvoice = async () => {

  const confirmed = await proxy.$confirm({
    title: 'තහවුරු කරන්න!',
    message: 'ඉන්වොයිසය ඇතුලත් කිරීම තහවුරු කරන්න'
  });
  if (confirmed) {
    let loading = $loading.show();

    const dataset = {
      invoiceNumber: invoiceNo.value,
      products: products.value,
      billAmount: parseFloat(totalAmount.value),
      billProfit: parseFloat(totalProfit.value),
      billDate: moment(billDate.value).format('YYYY-MM-DD'),

      repName:repName.value,
      shopName:shopName.value,

      returns: returns_array.value,
      returnAmount: parseFloat(totalReturnAmount.value),
      netAmount: parseFloat(netAmount.value),
      status:'Approved'
    }
    const payload = {
      url: baseURL + '/api/v1/general-queries/addData',
      data: JSON.stringify({
        collection: 'sales',
        data: JSON.stringify(dataset),
      })
    };
    const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'Sales');


    if (json_data.value) {


      await updateData();
      await ujPDFExport(products.value,totalAmount.value,invoiceNo.value,repName.value,shopName.value,invoiceNo.value,returns_array.value,[],totalReturnAmount.value)
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

const updateData = async () => {
  addToExpenses()

  // Wait for each product stock to update (sequentially)
  for (const item of products.value) {
    const prdct = _.find(stocks.value, {product_id: item.productCode});
    if (prdct) {
      await updateProductData(prdct, item.quantity, 'remove');
    }
  }

  // Wait for each return stock to update (sequentially)
  for (const item of returns_array.value) {
    const rprdct = _.find(stocks.value, {product_id: item.productCode});
    if (rprdct) {
      await updateProductData(rprdct, item.quantity, 'add');
    }
  }

}

const addToExpenses = async () => {

  let user = localStorage.getItem("user");
  let email = null;
  if (user){
    user = JSON.parse(user);
    email = user.Email;
  }
  const formData = {
    collection:'sales',
    collectionExplained:'භාණ්ඩ විකිනීම්',
    category:'Income',
    billNo:invoiceNo.value,
    amount:parseFloat(netAmount.value),
    profit:parseFloat(totalProfit.value),
    paidFromTo:shopName.value,
    date:moment(billDate.value).format('YYYY-MM-DD'),
    user:email,
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

const removeItem = (index) => {
  products.value.splice(index, 1);
};

const removeReturnItem = (index) => {
  returns_array.value.splice(index, 1);
};

onMounted(async () => {
  // Generate a random product ID with the prefix 'SMF'
  invoiceNo.value = `SMFINV${Math.floor(Math.random() * 1000000)}`;

  await loadShops();
  await loadReps();
  await loadStocks();
});
</script>

<style scoped>

</style>
