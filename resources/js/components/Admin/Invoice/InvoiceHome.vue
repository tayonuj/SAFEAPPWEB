<template>
  <div>
    <div>
      <div class="mt-3 mb-4">
        <nav style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
            <li class="breadcrumb-item active" aria-current="page">බිල්පත්</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="search-box mb-4 mt-2" style="width: 90%">

      <button class="btn btn-falcon-info mb-4 mt-3" style="margin-left: 15px" @click="navigateToDataset('/invoice/new/add')"> අළුත් බිලක් ඇතුලත් කරන්න</button>


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

    <InvoiceDetailsModal  ref="InvDetails"/>
  </div>
</template>

<script setup>

import VueTable from "../../plugins/VueTable.vue";
import {computed, inject, onMounted, ref, watch} from "vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import InvoiceDetailsModal from "./NewInvoices/InvoiceDetailsModal.vue";
const $loading = inject('$loading');
const baseURL = inject("$baseURL");
const tblHeader = [
  { text: 'කඩේ නම', value: 'shopName' },
  { text: 'නියෝජිතයාගේ (rep)  නම', value: 'repName' },
  { text: 'බිල්පත් මුදල', value: 'billAmount' },
  { text: 'බිල්පත් අංකය', value: 'invoiceNumber' },
  { text: 'බිල්පත් දිනය', value: 'billDate' },
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
      collection: 'sales',
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


const InvDetails = ref(null);
const handleShowModal = (dataset) => {
  console.log("showdataset",dataset)
  InvDetails.value.handleShowModal(dataset)
}

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>

</style>
