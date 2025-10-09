<template>
  <div
      :class="[
      'card overflow-hidden d-flex  p-2 interactive-card',
      { 'selected-card': isSelected }
    ]"
      draggable="true"
      @dragstart="onDragStart"
      @click="handleClick"
  >
    <div
        class="bg-holder bg-card"
        :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-2.png)` }"
    ></div>
    <div class="row g-0">
      <div class="col-sm-12 col-md-2 col-lg-2">
        <div class="avatar avatar-2xl">
          <img
              :src="`http://hris.slpa.lk/EmpImages/${employee.EMP_NUMBER}.jpg`"
              alt=""
          />
        </div>
        <br />
        <span style="font-size: small; font-weight: bold">
          {{ employee.EMP_NUMBER }}
        </span>

      </div>
      <div class="col-sm-12 col-md-9 col-lg-9">
        <span>
          {{ employee.MIDDLE_INI }} &nbsp; {{ employee.SURNAME }} <br />
        </span>
        <span style="font-size: small" v-if="employee.currentwork">
          {{ employee.currentwork.designation }}
        </span>
        <span style="font-size: small" v-else-if="employee.currentwork">
          {{ employee.designation }}
        </span>
        <div class="d-flex align-items-center mt-2">
          <span
              :class="['status-dot', { 'active': employee.ACTIVE_HRM_FLG === 1, 'inactive': employee.ACTIVE_HRM_FLG !== 1 }]"
          ></span>
          <span class="ms-2" style="font-size: small; font-weight: bold; color: inherit">
            {{ employee.ACTIVE_HRM_FLG === 1 ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import CardBody from "../bootstrap/CardBody.vue";

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
  keyNum: {
    type: Number,
    required: true,
  },
  isSelected: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emits = defineEmits(['dragstart', 'profileclicked']);

const onDragStart = () => {
  emits('dragstart', { employee: props.employee, keyNum: props.keyNum });
};

const handleClick = () => {
  emits('profileclicked', { employee: props.employee, keyNum: props.keyNum });
};
</script>

<style scoped>
.interactive-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.interactive-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.selected-card {
  border: 2px solid #007bff;
  background-color: #e7f1ff;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.active {
  background-color: green;
}

.status-dot.inactive {
  background-color: red;
}
</style>
