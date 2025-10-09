<template>
  <Modal ref="detailModal" title="භාන්ඩ ලයිස්තුව">
    <div class="p-4">


      <div class="search-box mb-4" style="width: 90%">
        <form class="position-relative" data-bs-toggle="search" data-bs-display="static">
          <input class="form-control search-input fuzzy-search" type="search"
                 placeholder="සොයන්න..." aria-label="Search"
                 v-model="searchName" />
          <span class="fas fa-search search-box-icon" style="width:10px"></span>
        </form>
      </div>
      <table class="table table-bordered">
        <tbody>
        <tr>
          <th>නම</th>
          <th>මිල රු.</th>
          <th>මිල පරාසය</th>
          <th>ගබඩාවේ ඇති ප්‍රමාණය</th>
          <th>තෝරන්න</th>
        </tr>
        <tr v-for="(item,key) in filteredData" :key="key">
          <th>{{item.productName}}</th>
          <td>{{ item.priceLabled  }}/=</td>
          <td> රු.{{ item.min_price }} - රු. {{item.max_price}}/=</td>
          <td>{{ item.quantity }}</td>
          <td>
            <button type="button" class="btn btn btn-falcon-success me-1 mb-3 btn-sm"
                    @click="showSelectModal(item)">
              තෝරන්න
            </button>
          </td>
        </tr>
        </tbody>
      </table>
      <ProductSelectModal ref="productSelect" @addToProducts="addProductToInvoice" @addToReturns="addProductToReturns" :is-return="isReturn"/>
    </div>
  </Modal>
</template>

<script setup>
import {computed, inject, onMounted, ref, watch} from 'vue';
import Modal from "../../bootstrap/Modal.vue";
import ProductSelectModal from "./ProductSelectModal.vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
const detailModal = ref(null);
const stocks = ref([]);
const filteredData = ref([]);
const search_name = ref("");
const emits = defineEmits(['addToInvoice','addToReturns']);
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const isReturn = ref(false);

const handleShowModal = async (dataset, returnFlag = false) => {
  detailModal.value.showModal();
  loadProducts();
  console.log('show dataset', dataset);
  isReturn.value = returnFlag;
};


const searchName = ref(null);

// Update filteredData whenever searchName changes
watch(searchName, (newValue) => {
  applyFilter(newValue);
});
const applyFilter = (searchTerm) => {
  if (!searchTerm) {
    filteredData.value = stocks.value;
  } else {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    filteredData.value = stocks.value.filter((item) => {
      // Adjust these fields based on your data structure
      return (
          (item.productName && item.productName.toLowerCase().includes(lowercasedSearchTerm)) ||
          (item.singlishName && item.singlishName.toLowerCase().includes(lowercasedSearchTerm))
      );
    });
  }}
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const productSelect = ref(null);
const showSelectModal = (item) => {
  productSelect.value.handleShowModal(item);

}

const addProductToInvoice = (product) => {
  emits('addToInvoice',product)
}

const addProductToReturns = (product) => {
  emits('addToReturns',product)
}

const loadProducts = async () => {
  let loader = $loading.show()
  const payload = {
    url: baseURL+'/api/v1/general-queries/readData',
    data: JSON.stringify({
      collection: 'products',
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  if (json_data.value) {
    let expandedProducts = [];

    json_data.value.forEach(product => {
      let uniquePrices = new Map(); // Use a Map to track unique priceLabled values

      if (product.prices && product.prices.length > 0) {
        product.prices.forEach(price => {
          if (!uniquePrices.has(price.priceLabled)) {
            uniquePrices.set(price.priceLabled, true);

            expandedProducts.push({
              _id: product._id,
              product_id: product.product_id,
              productName: product.productName,
              singlishName: product.singlishName,
              max_price: product.max_price,
              min_price: product.min_price,
              quantity: product.quantity,
              categoryName: product.categoryName,
              company: product.company,
              unitName: product.unitName,
              priceLabled: price.priceLabled,
              pricePerUnit: price.pricePerUnit,
              GRNBillNo: price.GRNBillNo,
            });
          }
        });
      } else {
        expandedProducts.push(product); // Add the product if no price array exists
      }
    });

    stocks.value = expandedProducts;
    filteredData.value = expandedProducts;
  }

  loader.hide()
};



onMounted(() => {

});

defineExpose({
  detailModal,
  handleShowModal
});
</script>
