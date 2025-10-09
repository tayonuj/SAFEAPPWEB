<template>
  <div>
    <div class="search-box mb-4" style="width: 90%">

      <button class="btn btn-falcon-info mb-4 mt-3" style="margin-left: 15px" @click="navigateToDataset('/stocks/addGRN')">GRN ඇතුලු කරන්න</button>


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
    />

    <GRNDetailsModal  ref="GRNDetails"/>
  </div>
</template>

<script setup>

import VueTable from "../../../plugins/VueTable.vue";
import {computed, inject, onMounted, ref, watch} from "vue";
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
import GRNDetailsModal from "./GRNDetailsModal.vue";
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const tblHeader = [
  { text: 'බිල්පත් අංකය', value: 'billNumber' },
  { text: 'බිල්පත් දිනය', value: 'billDate' },
  { text: 'බිල්පත් මුදල', value: 'billAmount' },
  { text: 'ආයතනේ නම', value: 'companyName' },
  { text: 'ඇතුලත් කල දිනය', value: 'created_at' },
  { text: 'බිල්පත් විස්තරය', value: 'action_details' },
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
      collection: 'GRN',
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


const GRNDetails = ref(null);
const handleShowModal = (dataset) => {
  console.log("showdataset",dataset)
  GRNDetails.value.handleShowModal(dataset)
}

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>

</style>
