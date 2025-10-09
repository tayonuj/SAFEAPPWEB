<template>
  <main class="main" id="top" v-if="!isLoginPage">
    <div style="margin: 30px">
      <top-nav-bar></top-nav-bar>
      <div>

        <div class="row ">
          <div class="col-lg-12 ">
            <router-view></router-view>
          </div>
        </div>

        <!-- <SidebarNav menu="" > -->



        <!-- </SidebarNav> -->

      </div>

    </div>
  </main>
  <main v-else class="main" id="top">
    <router-view></router-view>
  </main>
</template>
<script setup lang="ts">
import {RouterView} from "vue-router";
import SidebarNav from "./app/SidebarNav.vue";
import Footer from "./app/Footer.vue";
import {computed, ref} from 'vue';
import { useRoute } from 'vue-router';
import TopNavBar from "./app/TopNavBar.vue";

// alert("loaded");

const route = useRoute();
const isLoginPage = computed(() => route.path === '/login');
const menuData = ref([
  {
    icon: 'fa fa-home',
    text: 'Home',
    url: '/',
    highlight: false,
    children: []
  },
  {
    icon: 'fa fa-cog',
    text: 'Settings',
    url: '/settings',
    highlight: true,
    children: [
      {
        icon: 'fa fa-user',
        text: 'Profile',
        url: '/settings/profile',
        highlight: false,
        children: []
      },
      {
        icon: 'fa fa-lock',
        text: 'Security',
        url: '/settings/security',
        highlight: false,
        children: []
      }
    ]
  }
]);


</script>
