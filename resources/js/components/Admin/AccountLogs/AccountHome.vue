<template>
  <div>
    <div class="mt-3 mb-4">
      <nav style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
          <li class="breadcrumb-item active" aria-current="page">ආදායම් වියදම් වාර්ථා</li>
        </ol>
      </nav>
    </div>

<!--    <div class="search-box mb-4 mt-2" style="width: 90%">-->
<!--      <form class="position-relative">-->
<!--        <input class="form-control search-input" type="search" placeholder="සොයන්න..." aria-label="Search" v-model="searchName" />-->
<!--        <span class="fas fa-search search-box-icon"></span>-->
<!--      </form>-->
<!--    </div>-->
    <Card>
      <CardBody>
        <div class="row mt-2 mb-2">
          <div class="col cols-lg-3 cols-md-3">
            <uj-date-picker
                :label="'දින සිට'"
                v-model="startDate"
                :enable-time-picker="false"
                type="date"
                id="from"
                format="yyyy-MM-dd"
                :required="true"
            />
          </div>
          <div class="col cols-lg-3 cols-md-3">
            <uj-date-picker
                :label="'දින දක්වා'"
                v-model="endDate"
                :enable-time-picker="false"
                type="date"
                id="from"
                format="yyyy-MM-dd"
                :required="true"
            />
          </div>
          <div class="col cols-lg-3 cols-md-3">
            <uj-input
                :model-value="billNo"
                :label="'බිල්පත් අංකය'"
                :required="true"
                :size="'medium'"
                @update:modelValue="value => billNo = value"
            />
          </div>
          <div class="col cols-lg-3 cols-md-3">
            <button class="btn btn-falcon-primary mt-4" @click="searchDataset">සොයන්න</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered">
            <thead class="table-primary">
            <tr>
              <th>වියදම් කලේ/ලැබුනේ</th>
              <th>වියදමක්/ආදායමක්</th>
              <th>ඉන්වොයිස/බිල්පත් අංකය</th>
              <th>මුදල (රු.)</th>
              <th>ගෙවීම් කළ දිනය</th>
              <th>ගෙවීම් කල/ලැබූ ආයතනය/පුද්ගලයා</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in paginatedData" :key="index" :class="getRowClass(item.category)">
              <td>{{ item.collectionExplained }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.billNo }}</td>
              <td>{{ numeralFormat(item.amount) }}</td>
              <td>{{ getDateTime(item.date) }}</td>
              <td>{{ item.paidFromTo }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="prevPage">Previous</button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="nextPage">Next</button>
            </li>
          </ul>
        </nav>
      </CardBody>
    </Card>


  </div>
</template>

<script setup>
import {computed, inject, onMounted, ref, watch} from "vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import moment from "moment/moment";
import UjDatePicker from "../../Reusables/UIComponents/ujDatePicker.vue";
import UjInput from "../../Reusables/UIComponents/ujInput.vue";
import Card from "../../bootstrap/Card.vue";
import CardBody from "../../bootstrap/CardBody.vue";

const $loading = inject('$loading');
const baseURL = inject("$baseURL");

const products = ref([]);
const filteredData = ref([]);
const searchName = ref(null);

// Pagination variables
const currentPage = ref(1);
const rowsPerPage = ref(10);

// Filter function
watch(searchName, (newValue) => applyFilter(newValue));

const applyFilter = (searchTerm) => {
  if (!searchTerm) {
    filteredData.value = products.value;
  } else {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    filteredData.value = products.value.filter((item) =>
        (item.name && item.name.toLowerCase().includes(lowercasedSearchTerm))
    );
  }
};

// Load data
const loadAccounts = async () => {
  let loader = $loading.show();
  const payload = {
    url: baseURL + '/api/v1/general-queries/readData',
    data: JSON.stringify({collection: 'IncomeExpenses'})
  };

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);

  if (json_data.value) {
    products.value = json_data.value;
    filteredData.value = json_data.value;
  }

  loader.hide();
};

// Pagination computed properties
const totalPages = computed(() => Math.ceil(filteredData.value.length / rowsPerPage.value));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredData.value.slice(start, start + rowsPerPage.value);
});

// Pagination functions
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Row color based on category
const getRowClass = (category) => {
  return category === "Expense" ? "table-danger" : category === "Income" ? "table-success" : "";
};


const getDateTime = (datetime, format = 'YYYY-MM-DD') => {
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



const startDate = ref(moment().startOf('month').format('YYYY-MM-DD'));
const endDate = ref(moment().format('YYYY-MM-DD'));

const billNo = ref(null);

const searchDataset = () => {
  let start = startDate.value ? moment(startDate.value, 'YYYY-MM-DD') : null;
  let end = endDate.value ? moment(endDate.value, 'YYYY-MM-DD') : null;

  filteredData.value = products.value.filter(item => {
    let itemDate = extractDate(item.date);

    let matchesDateRange = true;

    if (start && !end) {
      matchesDateRange = itemDate ? itemDate.isSameOrAfter(start, 'day') : false;
    } else if (!start && end) {
      matchesDateRange = itemDate ? itemDate.isSameOrBefore(end, 'day') : false;
    } else if (start && end) {
      matchesDateRange = itemDate ? itemDate.isBetween(start, end, 'days', '[]') : false;
    }

    let matchesBillNo = billNo.value ? (item.billNo ? item.billNo.toLowerCase().includes(billNo.value.toLowerCase()) : false) : true;

    return matchesDateRange && matchesBillNo;
  });

  currentPage.value = 1; // Reset pagination
};


const extractDate = (dateObj) => {
  if (!dateObj) return null; // No date available

  if (dateObj.$date && dateObj.$date.$numberLong) {
    let timestamp = parseInt(dateObj.$date.$numberLong);
    return moment(timestamp);
  }

  return moment(dateObj).isValid() ? moment(dateObj) : null;
};


onMounted(loadAccounts);
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>
