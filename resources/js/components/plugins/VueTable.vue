<template>
  <div>
    <ReportQuery
        v-if="enableQuery"
        :attribute_list="attributes"
        :dataset="allData"
        @apply-filter="applyFilter"
    />

    <EasyDataTable
        :fixed-checkbox="false"
        :checkbox-column-width="0"
        :headers="headersWithCheckbox"
        :items="filteredData"
        :rows-per-page="rowsPerPage"
        :table-class-name="!enableCheckbox?'customize-table hide-checkboxes':'customize-table'"
        theme-color="#1D90FF"
        v-model:items-selected="itemsSelected"
        @update:items-selected="handleSelectionChange"
    >



      <template #item-emp_image="item">
        <img class="img-fluid rounded-3"
             :src="`https://slpahris.gsentry.cloud/EmpImages/${item.EMP_NUMBER}.jpg`"
             alt="" />
      </template>

      <template #item-status="item">
        <span class="badge rounded-pill" v-bind:class="getBadgeClass(item.STATUS)">
          {{item.STATUS}}
        </span>
      </template>


      <template #item-priceLabled="item">
        <span class="badge rounded-pill" style="margin: 5px" v-for="(p,key) in item.prices" v-bind:class="'bg-info'">
          රු . {{p.priceLabled}}
        </span>
      </template>

      <template #item-priceBaught="item">
        <span class="badge rounded-pill" v-for="(p,key) in item.prices" style="margin: 5px" v-bind:class="'bg-success'">
          රු . {{p.pricePerUnit}}
        </span>
      </template>



      <template #item-updated_at="item">
        {{getDateTime(item.updated_at)}}
      </template>

      <template #item-created_at="item">
        {{getDateTime(item.created_at)}}
      </template>

      <template #item-billDate="item">
        {{getDateTime(item.billDate,'YYYY-MM-DD')}}
      </template>

      <template #item-paymentDate="item">
        {{getDateTime(item.paymentDate,'YYYY-MM-DD')}}
      </template>


      <template #item-billAmount="item">
        {{numeralFormat(item.billAmount)}} /=
      </template>


      <template #item-action_details="item">
        <button type="button"  class="btn btn-primary btn-sm" @click="showDetailModal(tableID,item,1)">
          <span class="fas fa-info me-1" data-fa-transform="shrink-3"></span>
        </button>
      </template>


      <template #item-action2_details="item">
        <button type="button"  class="btn btn-primary btn-sm" @click="showDetailModal(tableID,item,2)">
          <span class="fas fa-circle-dot me-1" data-fa-transform="shrink-3"></span>
        </button>
      </template>

      <template #item-action3_details="item">
        <button type="button"  class="btn btn-primary btn-sm" @click="showDetailModal(tableID,item,3)">
          <span class="fas fa-circle-dot me-1" data-fa-transform="shrink-3"></span>
        </button>
      </template>


      <template #item-action_new_page="item">
        <RouterLink class="nav-link" :to="`${url}/${item[urlParams]}`">
          <div class="d-flex align-items-center">
            <span class="fas fa-fast-forward me-1" data-fa-transform="shrink-3"></span>
          </div>
        </RouterLink>
      </template>

      <template #item-action_new_page2="item">
        <RouterLink class="nav-link" :to="`${url2}/${item[urlParams2]}`">
          <div class="d-flex align-items-center">
            <span class="fas fa-fast-forward me-1" data-fa-transform="shrink-3"></span>
          </div>
        </RouterLink>
      </template>
      <template #item-action_new_page3="item">
        <RouterLink class="nav-link" :to="`${url3}/${item[urlParams3]}`">
          <div class="d-flex align-items-center">
            <span class="fas fa-fast-forward me-1" data-fa-transform="shrink-3"></span>
          </div>
        </RouterLink>
      </template>

      <template #item-action_new_page4="item">
        <RouterLink class="nav-link" :to="`${url}/${item[urlParams4]}`">
          <div class="d-flex align-items-center">
            <span class="fas fa-fast-forward me-1" data-fa-transform="shrink-3"></span>
          </div>
        </RouterLink>
      </template>



      <template #item-action_update="item">
        <button
            type="button"
            class="btn btn-warning btn-sm"
            @click="showDetailModal(tableID,item,6)"
        >
          <span class="fas fa-pencil-alt me-1" data-fa-transform="shrink-3"></span>
        </button>
      </template>

      <template #item-action_delete="item">
        <button
            type="button"
            class="btn btn-danger btn-sm"
            @click="showDetailModal(tableID,item,7)"
        >
          <span class="fas fa-trash me-1" data-fa-transform="shrink-3"></span>
        </button>
      </template>


    </EasyDataTable>
  </div>


</template>
<script setup>

import {ref, computed, watch, onMounted, getCurrentInstance, inject} from "vue";
import ReportQuery from "../Reusables/ReportQuery.vue";
import moment from "moment";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";
import notificationHandling from "../../composables/application/notificationHandling";
import {useDatasetStore} from "../../store/datasetStore";
import router from "../../router";

const props = defineProps({
  customClass: {
    type: String,
    default: ''
  },
  customStyle: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: Array,
    default:[]
  },
  headers:{
    type:Array,
    default:[]
  },
  rowsPerPage:{
    type:Number,
    default:10,
  },
  enableCheckbox:{
    type:Boolean,default:false
  },
  enableQuery:{
    type:Boolean,default:false
  },
  tableID:{
    type:String,default:"default"
  },
  url:{
    type:String,
    default:null
  },
  url2:{
    type:String,
    default:null
  },
  url3:{
    type:String,
    default:null
  },
  urlParams:{
    type:String,
    default:null
  },
  urlParams2:{
    type:String,
    default:null
  },
  urlParams3:{
    type:String,
    default:null
  },
  urlParams4:{
    type:String,
    default:null
  },
  updateURL:{
    type:String,
    default:null
  },
  collection:{
    type:String,
    required:true
  },
  functionName:{
    type:String,
    required:true
  },

});

const itemsSelected = ref([]);

const emits = defineEmits(["select-all",
  "show-modal", "show-modal2", "show-modal3", "show-modal4", "show-modalBtn", "update-form", "delete-form"]);





// Add a computed property for headers to conditionally include the checkbox column
const headersWithCheckbox = computed(() => {
  if (props.enableCheckbox) {
    return [
      ...props.headers
    ];
  }
  else {
    return props.headers.filter(header => header.value !== 'checkbox');
  }
});

// Handle selection change
const handleSelectionChange = (selectedItems) => {
  itemsSelected.value = selectedItems;

  emits('select-all', selectedItems);
};

const showDetailModal = (tblID,dataset,type) => {
  let payload = {tblID:tblID,dataset:dataset}
  console.log("opening modal "+tblID,dataset)

  switch (type) {
    case 1 : emits('show-modal', payload);break;
    case 2 : emits('show-modal2', payload);break;
    case 3 : emits('show-modal3', payload);break;
    case 4 : emits('show-modal4', payload);break;
    case 5 : emits('show-modalBtn', payload);break;
    case 6 : handleUpdate(dataset);break;
    case 7 : handleDelete(dataset);break;
  }
};

const showDetailPage = (tblID,dataset)=>{

}

watch(() => props.data, (data, oldEvent) => {
  if (data) {
    console.log("tbl dataset", data);
    getStats(data)
  }
});
const allData = ref([]);
const attributes = ref([]);
const filteredData = ref([]);
const getStats = (dataset) => {
  allData.value = dataset;
  filteredData.value = dataset;
  // attributes.value  = _.map(props.headers,function (o) {
  //   if (o.value !== 'action_details')
  //     return o.value;
  // });

  attributes.value = _.map(props.headers, function (o) {
    if (!["action_details", "action_update", "action_delete", "action_new_page"].includes(o.value)) {
      return o.value;
    }
  }).filter(Boolean); // Remove undefined values

  console.log("fucking attributed", attributes);
}

const applyFilter = (dataset) => {
  filteredData.value = dataset;
}

const getBadgeClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-primary';
    case 'Approved':
      return 'bg-success';
    case 'Rejected':
      return 'bg-danger';
    case 'Cancel_Pending':
      return 'bg-info';
    case 'Cancel_Approved':
      return 'bg-warning';
    case 'Cancelled':
      return 'bg-danger';
  }
}


// const getDateTime = (datetime, format = null) => {
//   if (!isNaN(datetime) && datetime.toString().length === 4) {
//     // If it's a four-digit year, return it directly
//     return datetime;
//   }
//
//   if (moment(datetime).isValid()) {
//     return format ? moment(datetime).format(format) : moment(datetime).format('YYYY-MM-DD hh:mm A');
//   }
//
//   return datetime; // Fallback for invalid values
// }

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
  if (props.data) {
    getStats(props.data)
  }
});


const {proxy} = getCurrentInstance();
const baseURL = inject("$baseURL");
const $loading = inject('$loading')


const handleDelete = async (dataset) => {
  const confirmed = await proxy.$confirm({
    title: 'Confirm Delete',
    message: 'this record will be permanently delete from the database continue?'
  });
  if (confirmed) {
    // alert(dataset._id)
    const loadingInstance = $loading.show();
    const payload = {
      url: baseURL + "/api/v1/general-queries/deleteRecord",
      data: JSON.stringify({
        collection: props.collection,
        id: dataset._id,
      }),
    };
    const {json_data} = await generalAxiosRequest("curl-requests/post", payload, false, props.functionName);

    if (json_data.value) {
      notificationHandling("success", "Record deleted successfully!");
      window.location.reload();
    }
    loadingInstance.hide();
  }
}

const dataStore = useDatasetStore();


const handleUpdate = (dataset) => {
  dataStore.setDataset(dataset)
  router.push({path: props.updateURL});
}
</script>
<style> .customize-table {
  --easy-table-border: 1px solid #D3D3D3;
  --easy-table-row-border: 1px solid #D3D3D3;
  --easy-table-header-font-size: 14px;
  --easy-table-header-height: 50px;
  --easy-table-header-font-color: #333;
  --easy-table-header-background-color: #F0F0F0;
  --easy-table-header-item-padding: 10px 15px;
  --easy-table-body-even-row-font-color: #333;
  --easy-table-body-even-row-background-color: #E7F3FF;
  --easy-table-body-row-font-color: #333;
  --easy-table-body-row-background-color: #fff;
  --easy-table-body-row-height: 50px;
  --easy-table-body-row-font-size: 14px;
  --easy-table-body-row-hover-font-color: #333;
  --easy-table-body-row-hover-background-color: #D6EAFF;
  --easy-table-body-item-padding: 10px 15px;
  --easy-table-footer-background-color: #F0F0F0;
  --easy-table-footer-font-color: #333;
  --easy-table-footer-font-size: 14px;
  --easy-table-footer-padding: 0px 10px;
  --easy-table-footer-height: 50px;
  --easy-table-scrollbar-track-color: #F0F0F0;
  --easy-table-scrollbar-color: #F0F0F0;
  --easy-table-scrollbar-thumb-color: #D6EAFF;
  --easy-table-scrollbar-corner-color: #F0F0F0;
  --easy-table-loading-mask-background-color: rgba(255, 255, 255, 0.8); /* Light blue shadow effect */
  box-shadow: 0 4px 6px rgba(173, 216, 230, 0.6);

}


.hide-checkboxes .easy-checkbox {
  display: none !important;
}

</style>
