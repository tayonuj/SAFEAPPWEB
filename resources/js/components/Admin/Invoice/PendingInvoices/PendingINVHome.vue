

<template>
  <div>

    <div>
    <div class="mt-3 mb-4">
      <nav style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
          <li class="breadcrumb-item active" aria-current="page">අලුත් බිල්පත්</li>
        </ol>
      </nav>
    </div>
  </div>
  <ul class="nav nav-tabs" id="myTab" role="tablist">
    <li class="nav-item"><a class="nav-link active" id="products-tab" data-bs-toggle="tab" href="#tab-products" role="tab" aria-controls="tab-products" aria-selected="true">
      භාණ්ඩ summary ය
    </a>
    </li>
    <li class="nav-item"><a class="nav-link" id="bills-tab" data-bs-toggle="tab" href="#tab-bills" role="tab" aria-controls="tab-shortLeave" aria-selected="false">
      අලුත් බිල්පත් ලයිස්තුව
    </a>
    </li>

    <li class="nav-item">
      <a class="nav-link" id="return-tab" data-bs-toggle="tab" href="#tab-return" role="tab" aria-controls="tab-shortLeave" aria-selected="false">
        ආපසු ලැබීම් summary ය
      </a>
    </li>

    <li class="nav-item">
      <a class="nav-link" id="return-expires-tab" data-bs-toggle="tab" href="#tab-return-expires" role="tab" aria-controls="tab-shortLeave" aria-selected="false">
        Return summary ය
      </a>
    </li>
  </ul>
  <div class="tab-content  p-3" id="myTabContent">
    <div class="tab-pane fade show active" id="tab-products" role="tabpanel" aria-labelledby="leave-tab">
      <PendingProductSummary />

    </div>

    <div class="tab-pane fade" id="tab-bills" role="tabpanel" aria-labelledby="leave-tab">
      <PendingInvoices />
    </div>

    <div class="tab-pane fade" id="tab-return" role="tabpanel" aria-labelledby="leave-tab">
      <PendingReturnSummary />
    </div>

    <div class="tab-pane fade" id="tab-return-expires" role="tabpanel" aria-labelledby="leave-tab">
      <PendingReturnExpirationSummary />
    </div>
  </div>


  </div>
</template>
<script setup lang="ts">

import PendingInvoices from "./PendingInvoices.vue";
import PendingProductSummary from "./PendingProductSummary.vue";
import PendingReturnSummary from "./PendingReturnSummary.vue";
import PendingReturnExpirationSummary from "./PendingReturnExpirationSummary.vue";
</script>
<style scoped>

</style>
