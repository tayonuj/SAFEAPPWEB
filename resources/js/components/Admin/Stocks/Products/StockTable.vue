<template>
  <div>

    <button class="btn btn-falcon-primary mb-4 mt-3" @click="navigateToDataset('/stocks/addProducts')">භාණ්ඩ ඇතුලු කරන්න</button>


    <div class="search-box mb-4" style="width: 90%">
      <form class="position-relative" data-bs-toggle="search" data-bs-display="static">
        <input class="form-control search-input fuzzy-search" type="search"
               placeholder="සොයන්න..." aria-label="Search"
               v-model="searchName" />
        <span class="fas fa-search search-box-icon" style="width:10px">

        </span>
      </form>
    </div>


    <VueTable
        :data="filteredData"
        :headers="tblHeader"
        :enable-query="false"
        :rowsPerPage="10"
        tableID="leave_table"
        @show-modal="handleShowModal"
        :collection="'products'" :function-name="'Products'"
    />
  </div>
</template>

<script setup>

import VueTable from "../../../plugins/VueTable.vue";
import {computed, inject, onMounted, ref, watch} from "vue";
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const tblHeader = [
  { text: 'නම', value: 'productName' },
  { text: 'උපරිම මිල', value: 'max_price' },
  { text: 'අවම මිල', value: 'min_price' },
  { text: 'ඉතිරි ප්‍රමාණය', value: 'quantity' },
  { text: 'අයිතම වර්ගය', value: 'categoryName' },
  { text: 'විකුණුම් ඒකකය', value: 'unitName' },
  { text: 'අයිතම අංකය', value: 'product_id' },
  { text: 'සඳහන් මිල ගණන්', value: 'priceLabled' },
  { text: 'වැටුණු මිල ගණන්', value: 'priceBaught' },
  { text: 'Delete', value: 'action_delete' },
];


const products = ref([]);
const filteredData = ref([]);

const searchName = ref(null);
// Update filteredData whenever searchName changes
watch(searchName, (newValue) => {
  applyFilter(newValue);
});
const applyFilter = (searchTerm) => {
  if (!searchTerm) {
    filteredData.value = products.value;
  } else {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    filteredData.value = products.value.filter((item) => {
      // Adjust these fields based on your data structure
      return (
          (item.name && item.name.toLowerCase().includes(lowercasedSearchTerm))
      );
    });
  }}



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
    filteredData.value = json_data.value;
    products.value = json_data.value;
  }

  loader.hide()
};


const navigateToDataset = (url) => {
  window.location.href = url;
}
const handleShowModal = () => {

}

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>

</style>
