<template>
  <div>


    <div class="search-box mb-4 mt-2" style="width: 90%">



<!--      <form class="position-relative" data-bs-toggle="search" data-bs-display="static">-->
<!--        <input class="form-control search-input fuzzy-search" type="search"-->
<!--               placeholder="සොයන්න..." aria-label="Search"-->
<!--               v-model="searchName" />-->
<!--        <span class="fas fa-search search-box-icon" style="width:10px">-->

<!--        </span>-->
<!--      </form>-->

      <div class="row mt-3">
        <div class="col-lg-4 col-md-4 col-sm-12">
          <div class="d-flex justify-content-between">
              <label for="from">සිට</label>
            </div>
            <uj-date-picker
                style="margin-top: -25px"
                v-model="startDate"
                :enable-time-picker="false"
                type="date"
                id="from"
                format="yyyy-MM-dd"
            />
        </div>
        <div class="col-lg-4 col-md-4 col-sm-12">
            <div class="d-flex justify-content-between">
              <label for="datepicker">දක්වා</label>
            </div>
            <uj-date-picker
                style="margin-top: -25px"
                v-model="endDate"
                :enable-time-picker="false"
                type="date"
                format="yyyy-MM-dd"
            />
        </div>
        <div class="col-lg-2 col-md-2 col-sm-12">
          <button class="btn btn-falcon-primary mt-4" @click="filterByDate">
            <i class="fas fa-filter me-2"></i>සොයන්න
          </button>
        </div>
      </div>
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
import VueTable from "../../../plugins/VueTable.vue";
import {computed, inject, onMounted, ref, watch} from "vue";
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
import InvoiceDetailsModal from "./InvoiceDetailsModal.vue";
import moment from "moment/moment";
import UjDatePicker from "../../../Reusables/UIComponents/ujDatePicker.vue";

const $loading = inject('$loading');
const baseURL = inject("$baseURL");

const tblHeader = [
  { text: 'අයිතම අංකය', value: 'productCode' },
  { text: 'නිෂ්පාදන නම', value: 'productName' },
  { text: 'මුළු ප්‍රමාණය', value: 'totalQuantity' },
  { text: 'ලේබල් මිල', value: 'priceLabled' },
];

const products = ref([]);
const groupedProducts = ref([]);
const filteredData = ref([]);
const searchName = ref(null);
const startDate = ref(moment().format('YYYY-MM-DD'));
const endDate = ref(moment().format('YYYY-MM-DD'));
// Update filteredData whenever searchName changes
watch(searchName, (newValue) => {
  applyFilter(newValue);
});

const filterByDate = () => {
  if (!startDate.value && !endDate.value) {
    filteredData.value = groupedProducts.value;
    return;
  }

  // Filter the original products first by date
  const filteredInvoices = products.value.filter(invoice => {
    let billDate = getDateTime(invoice.billDate, 'YYYY-MM-DD');
    if (startDate.value && endDate.value) {
      const from = startDate.value;
      const to = endDate.value;
      return moment(billDate).isBetween(from, to, 'day', '[]'); // '[]' includes the boundary dates
    } else if (startDate.value) {
      const from = moment(startDate.value, 'YYYY-MM-DD');
      return moment(billDate).isSameOrAfter(from);
    } else if (endDate.value) {
      const to = moment(endDate.value, 'YYYY-MM-DD');
      return moment(billDate).isSameOrBefore(to);
    }
    return true;
  });


  // Then group the filtered invoices
  filteredData.value = groupProducts(filteredInvoices);

  // // Apply search filter if there's a search term
  // if (searchName.value) {
  //   applyFilter(searchName.value);
  // }
};

const applyFilter = (searchTerm) => {
  if (!searchTerm) {
    filterByDate(); // Reset to date-filtered data
  } else {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    // Start with the date-filtered data
    const dateFilteredData = groupProducts(
        products.value.filter(invoice => {
          if (!startDate.value && !endDate.value) return true;
          const billDate = moment(invoice.billDate, 'YYYY-MM-DD');

          if (startDate.value && endDate.value) {
            const from = moment(startDate.value, 'YYYY-MM-DD');
            const to = moment(endDate.value, 'YYYY-MM-DD');
            return billDate.isBetween(from, to, null, '[]');
          } else if (startDate.value) {
            const from = moment(startDate.value, 'YYYY-MM-DD');
            return billDate.isSameOrAfter(from);
          } else if (endDate.value) {
            const to = moment(endDate.value, 'YYYY-MM-DD');
            return billDate.isSameOrBefore(to);
          }
          return true;
        })
    );

    filteredData.value = dateFilteredData.filter((item) => {
      return (
          (item.productName && item.productName.toLowerCase().includes(lowercasedSearchTerm)) ||
          (item.productCode && item.productCode.toLowerCase().includes(lowercasedSearchTerm))
      );
    });
  }
}
// const applyFilter = (searchTerm) => {
//   if (!searchTerm) {
//     filteredData.value = groupedProducts.value;
//   } else {
//     const lowercasedSearchTerm = searchTerm.toLowerCase();
//     filteredData.value = groupedProducts.value.filter((item) => {
//       return (
//           (item.productName && item.productName.toLowerCase().includes(lowercasedSearchTerm)) ||
//           (item.productCode && item.productCode.toLowerCase().includes(lowercasedSearchTerm))
//       );
//     });
//   }
// }

// Function to group products by productCode and calculate totals
const groupProducts = (invoices) => {
  const productMap = new Map();

  invoices.forEach(invoice => {
    if (invoice.returns) {
      invoice.returns.forEach(product => {
        const key = `${product.productCode}`; // Group by code and unit
        if (productMap.has(key)) {
          // Update existing product entry
          const existing = productMap.get(key);
          existing.totalQuantity += product.quantity;
          existing.totalAmount += product.amount;
          existing.totalProfit += product.profitAmount ||
              (product.unit_selling_price - product.buyingCost) * product.quantity;
        } else {
          // Create new product entry
          productMap.set(key, {
            productCode: product.productCode,
            productName: product.productName,
            priceLabled: product.priceLabled,
            buyingCost: product.buyingCost,
            unit_selling_price: product.unit_selling_price,
            totalQuantity: product.quantity,
            totalAmount: product.amount,
            totalProfit: product.profitAmount ||
                (product.unit_selling_price - product.buyingCost) * product.quantity
          });
        }
      });
    }

  });

  return Array.from(productMap.values());
};

const loadProducts = async () => {
  let loader = $loading.show();
  const payload = {
    url: baseURL+'/api/v1/general-queries/readData',
    data: JSON.stringify({
      collection: 'sales',
      attr:'status',
      filter_array: JSON.stringify(['Pending'])
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  if (json_data.value) {
    products.value = json_data.value;
    groupedProducts.value = groupProducts(json_data.value);
    filteredData.value = groupedProducts.value;
    // filterByDate()
  }

  loader.hide();
};

const navigateToDataset = (url) => {
  window.location.href = url;
}

const InvDetails = ref(null);
const handleShowModal = (dataset) => {
  console.log("showdataset", dataset);
  InvDetails.value.handleShowModal(dataset);
}

const getDateTime = (datetime, format = 'YYYY-MM-DD hh:mm A') => {
  if (!datetime) return "Invalid Date";

  // Check if it's in MongoDB's BSON format
  if (datetime.$date && datetime.$date.$numberLong) {
    let timestamp = parseInt(datetime.$date.$numberLong);
    return moment(timestamp).format(format);
  }

  // Handle regular timestamps or string dates
  if (moment(datetime).isValid()) {
    return moment(datetime).format(format);
  }

  return "Invalid Date"; // Fallback
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>

</style>
