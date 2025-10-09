<template>
  <div
      :class="['card overflow-hidden d-flex align-items-start p-2 interactive-card', { 'selected-card': isSelected }]"
      @click="handleClick(employee)"
  >
    <div class="bg-holder bg-card" :style="{ backgroundImage: `url(/assets/img/icons/spot-illustrations/corner-2.png)` }"></div>
    <div class="row g-3">
      <div class="col-sm-12 col-md-3">
        <div class="avatar avatar-2xl">
          <img
              :src="`http://hris.slpa.lk/EmpImages/${employee.EMP_NUMBER}.jpg`"
              alt=""
          />
        </div>
      </div>
      <div class="col-sm-12 col-md-9">
        <span>{{ employee.MIDDLE_INI }} &nbsp; {{ employee.SURNAME }} <br /></span>
        <span style="font-size: small" v-if="employee.currentwork">{{ employee.currentwork.designation }}</span>
        <span style="font-size: small" v-else-if="employee.designation">{{ employee.designation }}</span> <br/>
        <span style="font-size: xx-small"  v-if="additional_text" :class="additional_text.class">{{ additional_text.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  employee: {
    type: Object,
    required: false,
    default: {}
  },
  clickEvent: {
    type: String,
    required: false,
    default: 'gotoprofile'
  },
  additional_text: {
    type: String,
    required: false,
    default: null
  },
  isSelected: {
    type: Boolean,
    required: true,
    default: false
  },
  keyNum:Number
});

const emits = defineEmits(['profileclicked']);

const handleClick = (employee) => {
  if (props.clickEvent === 'gotoprofile') {
    window.open('employee-profile/' + employee.EMP_NUMBER);
  } else {
    emits('profileclicked', {employee:employee,key:props.keyNum});
  }
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

.link-decoration-none {
  text-decoration: none;
}

.profile-card-content {
  background-image: url('/assets/img/icons/spot-illustrations/corner-2.png');
  background-repeat: no-repeat;
  background-position: right bottom;
}

.selected-card {
  border: 2px solid #007bff;
  background-color: #e7f1ff;
}
</style>
