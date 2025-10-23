<template>
  <div class="mt-3 mb-4">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
        <li class="breadcrumb-item active" aria-current="page">පංතිය තෝරන්න</li>
      </ol>
    </nav>
  </div>


  <div class="container-fluid py-3">
    <div class="card">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-6">
            <uj-select :model-value="classId"
                       :label="'පංතිය'"
                       :items="classItems"
                       :required="true"
                       :size="'medium'"
                       @update:modelValue="v => classId = v"/>
          </div>
          <div class="col-auto">
            <router-link :class="['btn', classId ? 'btn-primary' : 'btn-secondary disabled']"
                         :to="{ name: 'CreateTest', query: { classId } }">
              අලුත් පරීක්ෂණයක් සාදන්න
            </router-link>
          </div>
          <div class="col-auto">
            <router-link :class="['btn', classId ? 'btn-outline-primary' : 'btn-outline-secondary disabled']"
                         :to="{ name: 'AssessmentsHome' }">
              පරීක්ෂණ ලැයිස්තුව
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import UjSelect from "../../Reusables/UIComponents/ujSelect.vue";
import {ClassesAPI} from "../../../composables/application/assesment/api";


const classId = ref('');
const classItems = ref([]);


async function loadClasses() {
  const list = await ClassesAPI.list();
  classItems.value = (list || []).map(c => ({ value: c.classId, text: `${c.className} (${c.classId})` }));
}


onMounted(loadClasses);
</script>
