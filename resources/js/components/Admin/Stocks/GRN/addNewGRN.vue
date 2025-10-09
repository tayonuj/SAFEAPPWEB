<template>
  <div class="">
    <div class="mt-2">
      <div class="mt-3 mb-4">
        <nav style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/public">මුල් පිටුව</a></li>
            <li class="breadcrumb-item" aria-current="page"><a href="/stocks">භාණ්ඩ ගබඩාව</a></li>
            <li class="breadcrumb-item active" aria-current="page">GRN ඇතුලත් කිරීම</li>
          </ol>
        </nav>
      </div>

          <div class="row">
          <div class="col col-lg-3 col-md-3 col-sm-12">
            <Card>
              <CardBody>

                <div class="row mt-2">
                  <div class="col col-md-12 col-lg-12">
                    <label class="form-label">අයිතම Code එක</label>
                    <div class="input-group mb-3">
                      <span class="input-group-text" id="item-code-prefix">SMF</span>
                      <input
                          class="form-control"
                          id="idInput"
                          placeholder="උදා : 112233"
                          v-model="itemCode"
                          @keyup.enter="handleItemCodeEnter"
                      />
                    </div>
                  </div>

                  <div class="col col-md-12 col-lg-12">
                    <label class="form-label">අයිතමයේ නම</label>
                    <div class="input-group mb-3">
                      <vue3-simple-typeahead
                          id="typeaheadInput"
                          :placeholder="'උදා : kahakudu,miriskudu'"
                          v-model="ProductNameSinglish"
                          :items="productNames"
                          :size="'medium'"
                          class="form-control form-control-md"
                          @selectItem="handleSelectionItems"
                      ></vue3-simple-typeahead>
                    </div>
                  </div>

                  <div class="col col-md-12 col-lg-12">
                    <label class="form-label">ප්‍රමාණය</label>
                    <div class="input-group mb-3">
                      <vue-number-input
                          class="form-control-md"
                          v-model="Quantity"
                          :min="1"
                          :max="9900000"
                          size="small"
                          inline
                          controls
                      ></vue-number-input>
                    </div>
                  </div>

                  <div class="col col-md-12 col-lg-12">
                    <label class="form-label">ඒකකයක ලේබල් කරන ලද මිල (Rs)</label>
                    <input
                        type="number"
                        class="form-control"
                        id="priceInput"
                        :min="1"
                        placeholder="උදා : 1500"
                        v-model="itemPriceLabled"
                        @keyup.enter="addToTable"
                    />
                  </div>


                  <div class="col col-md-12 col-lg-12 mt-2">
                    <label class="form-label">ඒකකයක් වැටෙන මිල (Rs)</label>
                    <input
                        type="number"
                        class="form-control"
                        id="priceInput"
                        :max="itemPriceLabled"
                        placeholder="උදා : 1500"
                        v-model="itemPrice"
                        :class="{ 'is-invalid': item_price_range}"
                        @keyup.enter="addToTable"
                    />

                    <div v-if="item_price_range" class="invalid-feedback">
                      {{ item_price_range }}
                    </div>
                  </div>

                  <div class="col col-md-12 col-lg-12 mt-2">
                    <uj-date-picker
                        :label="'කල් ඉකුත්වීමේ දිනය'"
                        v-model="expireDate"
                        :placeholder="'Expire Date'"
                        :required="true"
                        :enable-time-picker="false"
                        type="date"
                        format="yyyy-MM-dd"
                    />
                  </div>

                  <div class="col col-md-12 col-lg-12">
                    <div class="d-grid gap-2 mb-2">
                      <button class="btn btn-primary btn-sm mt-4" @click="addToTable">ලයිස්තුවට එකතු කරන්න</button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

          </div>

            <div class="col col-lg-9 col-md-9 col-sm-12">
              <Card>
                <CardBody>
                  <button class="btn btn-falcon-success mt-2" @click="showCompanyModal(companies)">සැපයුම් කරුවන් ඇතුලත් කරන්න</button>

                  <table class="table table-striped table-bordered mt-4">
                    <thead>
                    <tr class="table-primary">
                      <th>#</th>
                      <th>Code</th>
                      <th>නම</th>
                      <th>ප්‍රමාණය</th>
                      <th>ලේබල් මිල</th>
                      <th>ඒකකයක මිල </th>
                      <th>අයිතම ප්‍රමාණයේ මිල</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, index) in itemsTable" :key="index" class="table-secondary">
                      <td>{{ index+1 }}</td>
                      <td>{{ item.productCode }}</td>
                      <td>{{ item.productName }}</td>
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
                      <td>
                        {{item.priceLabled}}
                      </td>
                      <td>
                        <input type="number" v-model.number="item.pricePerUnit" @input="updateItemPrice(index, true)" class="form-control form-control-sm" />
                      </td>
                      <td>
                        <input type="number" v-model.number="item.totalPrice" @input="updateItemPrice(index, false, true)" class="form-control form-control-sm" />
                      </td>
                      <td>
                        <button class="btn btn-danger btn-sm" @click="removeItem(index)">
                          <i class="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                    </tbody>
                    <tfoot>
                    <tr class="table-danger">
                      <td colspan="6" class="text-end"><b>ඉන්වොයිසයේ මුළු මුදල (Rs)</b></td>
                      <td>
                        <b>
                          <input type="number" v-model.number="totalInvoicePrice"  class="form-control form-control-sm" />
                        </b>
                      </td>
                    </tr>
                    </tfoot>
                  </table>

                  <hr />
                     <div class="row mt-3">
            <div class="col col-md-3 col-lg-3">
              <uj-input
                  :label="'බිල්පත් අංකය'"
                  v-model="billNo"
                  :placeholder="'Bill No'"
                  :required="true"
                  :size="'medium'"
              />
            </div>

            <div class="col col-md-3 col-lg-3">
              <uj-date-picker
                  :label="'බිල්පත් දිනය'"
                  v-model="billDate"
                  :placeholder="'Bill Date'"
                  :required="true"
                  :enable-time-picker="false"
                  type="date"
                  format="yyyy-MM-dd"
              />
            </div>

            <div class="col col-md-3 col-lg-3">
              <uj-select
              :label="'සැපයුම් කරුගේ නම'"
              :items="companyNames"
              :model-value="selectedCompany"
              @update:modelValue="value => selectedCompany = value"
              />
            </div>

            <div class="col col-md-3 col-lg-3">
              <button class="btn btn-falcon-primary mt-4" @click="saveGRN" v-bind:class="!billNo ||
               billNo === '' || itemsTable.length === 0 || !selectedCompany || selectedCompany === ''?'disabled':''">ඉන්වොයිසය ඇතුළු කරන්න</button>
            </div>
          </div>
                </CardBody>
              </Card>
            </div>
          </div>


      <AddNewCompanyModal ref="newCompanyModal" />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, inject, nextTick, computed } from "vue";
import Card from "../../../bootstrap/Card.vue";
import CardBody from "../../../bootstrap/CardBody.vue";
import Vue3SimpleTypeahead from 'vue3-simple-typeahead';
import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css';
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../../composables/application/notificationHandling";
import _, {isArray} from "lodash";
import moment from "moment";
import UjDatePicker from "../../../Reusables/UIComponents/ujDatePicker.vue";
import UjInput from "../../../Reusables/UIComponents/ujInput.vue";
import UjSelect from "../../../Reusables/UIComponents/ujSelect.vue";
import AddNewCompanyModal from "./addNewCompanyModal.vue";

const baseURL = inject("$baseURL");
const $loading = inject('$loading');

const products = ref([]);
const productNames = ref([]);
const itemCode = ref("");
const ProductNameSinglish = ref("");
const ProductName = ref();
const itemPrice = ref(null);
const itemPriceLabled = ref(null);
const billNo = ref(null);

const billDate = ref(moment().format('YYYY-MM-DD'));
const expireDate = ref(moment().format('YYYY-MM-DD'));
const Quantity = ref(1);
const itemsTable = ref([]);

const selectedCompany = ref(null);
const companies = ref([]);
const companyNames = ref([]);

const item_price_range = ref(null)

const totalInvoicePrice = computed(() => {
  return itemsTable.value.reduce((acc, item) => acc + item.totalPrice, 0);
});

const loadProducts = async () => {
  const payload = {
    url: baseURL + "/api/v1/general-queries/readData",
    data: JSON.stringify({
      collection: "products",
    }),
  };

  const {json_data} = await generalAxiosRequest("curl-requests/post", payload, false);
  if (json_data.value) {
    products.value = json_data.value;
    productNames.value = _.map(products.value, "singlishName");
  }
};

const handleItemCodeEnter = () => {
  const completeCode = `SMF${itemCode.value}`;
  const product = products.value.find((p) => p.product_id === completeCode);

  if (product) {
    ProductNameSinglish.value = product.singlishName;
    ProductName.value = product.productName;
    item_price_range.value  = `අවම : රු ${product.min_price} - උපරිම : රු ${product.max_price}`;
    nextTick(() => {
      document.getElementById('typeaheadInput').value = ProductNameSinglish.value;
      document.getElementById("priceInput").focus();
    });
  } else {
    notificationHandling("error", "Invalid Item Code!");
  }
};


const handleSelectionItems = (item) => {
  const product = products.value.find((p) => p.singlishName === item);

  if (product) {
    itemCode.value = product.product_id.replace('SMF', '');
    ProductName.value = product.productName;
    item_price_range.value  = `අවම : රු ${product.min_price} - උපරිම : රු ${product.max_price}`;

    nextTick(() => {
      document.getElementById('priceInput').focus();
    });
  } else {
    notificationHandling("error", "Invalid Item Selected!");
  }
}


const addToTable = () => {
  if (!itemCode.value || !ProductName.value || !itemPrice.value || !Quantity.value) {
    notificationHandling("error", "Please fill all fields!");
    return;
  }

  itemsTable.value.push({
    productCode: `SMF${itemCode.value}`,
    productName: ProductName.value,
    quantity: Quantity.value,
    pricePerUnit: itemPrice.value,
    priceLabled: itemPriceLabled.value,
    expireDate: expireDate.value,
    totalPrice: Quantity.value * itemPrice.value,
  });

  itemCode.value = "";
  ProductNameSinglish.value = "";
  itemPrice.value = null;
  itemPriceLabled.value = null;
  Quantity.value = 1;
  item_price_range.value = null

  nextTick(() => {
    document.getElementById("idInput").focus();
  });
};



const updateItemPrice = (index, updateUnitPrice = false, updateTotalPrice = false) => {
  const item = itemsTable.value[index];
  if (updateUnitPrice) {
    item.totalPrice = item.quantity * item.pricePerUnit;
  } else if (updateTotalPrice) {
    item.pricePerUnit = item.totalPrice / item.quantity;
  } else {
    item.totalPrice = item.quantity * item.pricePerUnit;
  }
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
    companyNames.value = _.map(json_data.value,'companyName');
  }
};

const removeItem = (index) => {
  itemsTable.value.splice(index, 1);
};

const newCompanyModal = ref(null);
const showCompanyModal = (dataset) => {
  newCompanyModal.value.handleShowModal(dataset);
};


const saveGRN = async () => {
  let loading = $loading.show();

  const dataset = {
    billNumber: billNo.value,
    billDate: moment(billDate.value).format('YYYY-MM-DD'),
    products: itemsTable.value,
    billAmount: totalInvoicePrice.value,
    companyName:selectedCompany.value
  }
  const payload = {
    url: baseURL + '/api/v1/general-queries/addData',
    data: JSON.stringify({
      collection: 'GRN',
      data: JSON.stringify(dataset),
    })
  };

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'Good Recieve Notes');
  loading.hide();

  if (json_data.value) {
    notificationHandling('success', 'භාණ්ඩ ලබාගැනීමේ සටහන සාර්ථකව ඇතුලත් කළා!');

    await updateData();
    // console.log("completed records")
    window.location.reload()
  }
}

const updateData = () => {
  itemsTable.value.forEach(async function (item) {
    console.log("productItems",item)
    let product = _.find(products.value,{'product_id':item.productCode});
    if (product){
      let prices = {
        GRNBillNo:billNo.value,
        priceLabled:item.priceLabled,
        pricePerUnit:item.pricePerUnit
      }
      await updateProductData(product,prices,item.quantity);
    }
  })
  addToExpenses()

}

const addToExpenses = async () => {

  let user = localStorage.getItem("user");
  let email = null;
  if (user){
    user = JSON.parse(user);
    email = user.Email;
  }
  const formData = {
    collection:'GRN',
    collectionExplained:'භාණ්ඩ මිලදී ගැනීම්',
    category:'Expense',
    billNo:billNo.value,
    amount:totalInvoicePrice.value,
    paidFromTo:selectedCompany.value,
    date:billDate.value,
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

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'ProductCategory');
  loading.hide();
  notificationHandling('success'," වියදමක් ඇතුලත් කලා!");
}


const updateProductData = async (product,price,quantity) => {
  let loading = $loading.show()
  let prices = product.prices && isArray(product.prices)?product.prices:[];
  prices.push(price)
  let newQuantity = product.quantity ? parseFloat(product.quantity)+quantity:quantity;

  const datasets = {
    prices: prices,
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

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false,'IncomeExpenses');
  loading.hide()

  if (json_data.value){
    notificationHandling('success',product.productName+" යාවත් කාලීන කිරීම සාර්ථකයි!");
  }

};


onMounted(async () => {
  await loadProducts();
  await loadCompanies();
});
</script>
