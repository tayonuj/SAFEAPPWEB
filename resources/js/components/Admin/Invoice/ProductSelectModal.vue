<template>
  <Modal ref="stockSelectModal" :title="product? product.productName+' කොපමණක් ද?':'' " :size="'small'">
    <div class="p-4">
      <table class="table table-bordered">
        <tbody>
        <tr>
          <th> විකුනුම් මිල රු.</th>
          <td>
            <vue-number-input v-model="sellingPrice" :min="product?product.min_price:1" :max="product?product.max_price:10000" size="small" inline controls>
            </vue-number-input>
          </td>
        </tr>

        <tr>
          <th> ඒකකය </th>
          <td>
            <uj-select
              :model-value="unit"
              :required="true" :size="'small'"
              :items="unitNames"
              @update:modelValue="value => unit = value"
          />
          </td>
        </tr>

        <tr>
          <th> භාණ්ඩ ප්‍රමාණය </th>
          <td>
            <vue-number-input v-model="quantity" :min="1" :max="product?product.quantity:100000" size="small" inline controls>
            </vue-number-input>
          </td>
        </tr>


        </tbody>
      </table>
      <button type="button" class="btn btn btn-falcon-primary me-1 mb-3 btn-sm"
              @click="addToProducts">
        බිලට ඇතුලත් කරන්න
      </button>
    </div>
  </Modal>
</template>

<script setup>
import {inject, ref, watch} from 'vue';
import Modal from "../../bootstrap/Modal.vue";
import UjSelect from "../../Reusables/UIComponents/ujSelect.vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";

const stockSelectModal = ref(null);
const sellingPrice = ref(null);
const quantity = ref(1);
const unit = ref(null);
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const units = ref([]);
const unitNames = ref([]);


const props = defineProps({
  isReturn: {
    type: Boolean,
    default: false
  }
});

const product = ref(null);
const emits = defineEmits(['addToProducts','addToReturns']);


const handleShowModal = async (dataset) => {
  stockSelectModal.value.showModal();
  console.log('show dataset', dataset);
  product.value = dataset;
  if (product.value) {
    sellingPrice.value = product.value.max_price;
    loadProductUnits()
  }
};


const addToProducts = ()=>{
  let profitEach = sellingPrice.value - product.value.pricePerUnit;
  const newProduct = {
    productCode:product.value.product_id,
    productName:product.value.productName,
    priceLabled:product.value.priceLabled,
    GRNBillNo:product.value.GRNBillNo,
    buyingCost:product.value.pricePerUnit,
    profit_each:profitEach,
    unit_selling_price:sellingPrice.value,
    quantity:quantity.value,
    unit:unit.value,
    amount:sellingPrice.value*quantity.value,
    profitAmount:profitEach*quantity.value,
  }
  console.log("emmiting ",newProduct)
  if (props.isReturn) {
    emits('addToReturns', newProduct);
  } else {
    emits('addToProducts', newProduct);
  }
  stockSelectModal.value.hideModal();
}

const loadProductUnits = async () => {
  let loader = $loading.show()

  const payload = {
    url: baseURL+'/api/v1/general-queries/readData',
    data: JSON.stringify({
      collection: 'product_units',
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  if (json_data.value) {
    units.value = json_data.value;
    unitNames.value = _.map(units.value,'unitName');
    if (unitNames.value && unitNames.value.length > 0){

      unit.value = product.value.unitName;
    }
  }
  loader.hide()
};

watch(unit, (newValue) => {
  let selectedUnit = _.find(units.value,{'unitName':newValue});
  if (selectedUnit){
    quantity.value = selectedUnit.unitItemCount;
  }

});

defineExpose({
  stockSelectModal,
  handleShowModal
});
</script>
