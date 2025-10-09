<template >
  <div class="row g-3 mb-1">
    <div class="col-sm-6 col-md-3" v-for="stat in stats" :key="stat._id">
      <Card custom-class="overflow-hidden" custom-style="min-width: 12rem">
        <div class="bg-holder bg-card" :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-1.png)` }"></div>
        <div class="card-body position-relative">
          <h6>{{ stat._id }}
<!--            <span class="badge badge-soft-warning rounded-pill ms-2">Remaining Days</span>-->
          </h6>
          <div :class="`fs-4 mb-2 fw-normal font-sans-serif text-warning`" >
            <p>
              {{ numeralFormat(stat.count) }} {{stat.unit}}
            </p>
          </div>
<!--          <h6> Entitled Count: {{ stat.entitled_count }}</h6>-->

        </div>




      </Card>
    </div>






  </div>

</template>

<script setup>

import {inject, onMounted, ref} from "vue";

const baseURL = inject("$baseURL");
const $loading = inject('$loading');


import Card from "./bootstrap/Card.vue";
import generalAxiosRequest from "../composables/application/generalAxiosRequest";

const stats = ref([
  {_id:'ළමුන්ගේ පැමිණීම',count:0,unit:''},
  {_id:'අද පන්ති',count:0,unit:''},
  {_id:'මුදල් එකතුවීම්',count:0,unit:''},
  {_id:'අද දිනය',count:0,unit:''},
]);

const getInvoiceCosts = async () => {
  let loading = $loading.show()
  const payload = {
    url: baseURL + '/api/v1/general-queries/getSumByDateGrouping',
    data: JSON.stringify({
      collection: "sales",
      attr_group: "billDate",
      attr_sum: "billAmount",
      conditions:JSON.stringify([{'status':'Approved'}])
    }),
  };

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);

  if (json_data.value && json_data.value.length>0){
    stats.value.splice(0,1,{_id:'බිල්පත්',count:json_data.value[0].data.length});
    stats.value.splice(1,1,{_id:'බිල්පත් ආදායම',count:json_data.value[0].totalSum,unit:' /='});
  }

  loading.hide();
  console.log("stats",json_data.value);
}

const getProfitCosts = async () => {
  let loading = $loading.show()
  const payload = {
    url: baseURL + '/api/v1/general-queries/getSumByDateGrouping',
    data: JSON.stringify({
      collection: "sales",
      attr_group: "billDate",
      attr_sum: "billProfit",
      conditions:JSON.stringify([{'status':'Approved'}])

    }),
  };

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);

  if (json_data.value && json_data.value.length>0){
    stats.value.splice(3,1,{_id:'බිල්පත් ශුද්ධ ලාභය',count:json_data.value[0].totalSum,unit:' /='});
  }

  loading.hide();
  console.log("stats",json_data.value);
}

const getByProducts = async () => {
  let loading = $loading.show()
  const payload = {
    url: baseURL + '/api/v1/general-queries/getCounts',
    data: JSON.stringify({
      collection: "products",
      attr: "categoryName",
    }),
  };

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);

  if (json_data.value && json_data.value.length>0){
    stats.value.splice(2,1,{_id:'විකුනුම් අයිතම වර්ග',count:json_data.value.length});
  }

  loading.hide();
  console.log("stats",json_data.value);
}

onMounted(async () => {
  await getInvoiceCosts();
  await getProfitCosts();
  await getByProducts();
})

</script>
