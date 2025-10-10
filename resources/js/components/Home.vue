<template>
  <div>
    <div class="mt-4 mb-4">
      <HomeStats />

    </div>

    <hr/>

    <div class="row g-3 mb-3">
      <div class="col-md-4 col-sm-12 col-lg-4 col-xxl-4" v-for="(card, index) in cardIconStatData"
           :key="index">

        <CardIconStat
            :title="card.title"
            :badgeText="card.badgeText"
            :icon="card.icon"
            :href="card.href"
            :imageIndex="card.imageIndex"
            :textClass="card.textClass"
            :iconColor="card.colorCode"
            :stats="card.stats"
        />
      </div>

    </div>
  </div>
</template>

<script setup>

import moment from "moment";
import {inject, onMounted, onUnmounted, ref} from "vue";
import CardIconStat from "./bootstrap/CardIconStat.vue";
import HomeStats from "./HomeStats.vue";
import generalAxiosRequest from "../composables/application/generalAxiosRequest";
const currentTime = ref(moment().format('YYYY-MM-DD HH:mm:ss'));

const updateTime = () => {
  currentTime.value = moment().format('YYYY-MM-DD hh:mm:ss A');
};

let timer;
onMounted(() => {
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const cardIconStatData = ref([
  {
    title: 'පැමිණීම ළකුනු කිරීම',
    stats: {name:'New',value:0},
    icon: 'fas fa-file-invoice fs-5',
    colorCode:'#C5E1A5',
    href: '/attendance',
    imageIndex: 2,
    textClass: 'text-warning'
  },

  {
    title: 'සිසු/සිසුවියන්',
    badgeText: '4 shorts',
    icon: 'fas fa-chart-line fs-5',
    colorCode:'#B3E5FC',
    href: '/students',
    imageIndex: 2,
    textClass: 'text-warning'
  },

  {
    title: 'ගුරු මහත්ම/මහත්මීන්',
    badgeText: '4 shorts',
    icon: 'fas fa-sliders-h fs-5',
    colorCode:'#4DD0E1',
    href: '/lecturers',
    imageIndex: 2,
    textClass: 'text-warning'
  },
  {
    title: 'පන්ති විස්තර',
    badgeText: '4 shorts',
    icon: 'fas fa-money-check fs-5',
    colorCode:'#DCE775',
    href: '/classes',
    imageIndex: 2,
    textClass: 'text-warning'
  },


  {
    title: 'මුදල් ලැබීම්',
    badgeText: '4 shorts',
    icon: 'far fa-money-bill-alt fs-5',
    colorCode:'#FFD54F',
    href: '/attendanceandpayments',
    imageIndex: 2,
    textClass: 'text-warning'
  },


]);
const baseURL = inject("$baseURL");
const $loading = inject('$loading');
const pendingInvoices = ref(null);



</script>

<style>

</style>
