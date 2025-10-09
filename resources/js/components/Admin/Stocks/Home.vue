<template>
  <div>

    <div class="mt-3 mb-4">
      <nav style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
          <li class="breadcrumb-item active" aria-current="page">භාණ්ඩ ගබඩාව</li>
        </ol>
      </nav>
    </div>
    <Card>
    <CardBody>

    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li class="nav-item"><a class="nav-link active" id="leave-tab" data-bs-toggle="tab" href="#tab-products" role="tab" aria-controls="tab-products" aria-selected="true">
        භාණ්ඩ ලයිස්තුව
      </a>
      </li>
      <li class="nav-item"><a class="nav-link" id="shortLeave-tab" data-bs-toggle="tab" href="#tab-GRN" role="tab" aria-controls="tab-shortLeave" aria-selected="false">
        භාණ්ඩ ලබාගැනීමේ බිල්පත් (GRN) ලයිස්තුව
      </a>
      </li>
    </ul>
    <div class="tab-content  p-3" id="myTabContent">
      <div class="tab-pane fade show active" id="tab-products" role="tabpanel" aria-labelledby="leave-tab">
        <stock-table />
      </div>

      <div class="tab-pane fade" id="tab-GRN" role="tabpanel" aria-labelledby="leave-tab">
        <g-r-n-table />
      </div>
    </div>


    </CardBody>
    </Card>
  </div>
</template>

<script setup>
import StockTable from "./Products/StockTable.vue";
import GRNTable from "./GRN/GRNTable.vue";
import CardBody from "../../bootstrap/CardBody.vue";
import Card from "../../bootstrap/Card.vue";
</script>

<style scoped>

</style>
