<script setup lang="ts">
import { useRouter } from 'vue-router';
import {computed, getCurrentInstance, onMounted, onUnmounted, ref} from 'vue';
import UserUpdateModal from "../DivisionAdmin/EmployeeLifeCycle/UserUpdateModal.vue";
import PasswordReset from "../Authentication/PasswordReset.vue";

defineProps<{
  menu: {
    icon: String,
    text: String,
    url: String,
    highlight: Boolean,
    children: Object
  };
}>();

function subIsActive(urls: Array<{ url: String }>) {
  const currentRoute = useRouter().currentRoute.value.path;
  return urls.some(urlObj => urlObj.url === currentRoute);
}

const { proxy } = getCurrentInstance();
const signOut = async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('menu');
  localStorage.removeItem('Token');
  localStorage.removeItem('admin_emp_array');
  window.location.reload();
};

const user = JSON.parse(localStorage.getItem('user') || '{}');

const menu_list = ref([]);

onMounted(() => {
  menu_list.value = JSON.parse(localStorage.getItem('menu'));
  console.log('menu',menu_list.value);
});


// Compute the greeting based on the current time
const greetingMessage = computed(() => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return 'සුභ උදෑසනක්';
  if (currentHour < 18) return 'සුභ දහවලක්';
  return 'සුභ සන්ද්‍යාවක්';
});

const resetPWDModal = ref(null);
const handleShowModal = () => {
  resetPWDModal.value.handleShowModal();
};

const isMobileView = ref(false);
// Determine if the view is mobile
onMounted(() => {
  const updateView = () => {
    isMobileView.value = window.innerWidth <= 990; // Mobile view for widths <= 990px
  };
  updateView();
  window.addEventListener("resize", updateView);
  onUnmounted(() => window.removeEventListener("resize", updateView));
});
</script>

<template>
    <nav class="navbar navbar-light navbar-glass navbar-top navbar-expand" v-if="isMobileView">

      <button class="btn navbar-toggler-humburger-icon navbar-toggler me-1 me-sm-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarVerticalCollapse" aria-controls="navbarVerticalCollapse" aria-expanded="false" aria-label="Toggle Navigation"><span class="navbar-toggle-icon"><span class="toggle-line"></span></span></button>
      <a class="navbar-brand" href="/">
        <div class="d-flex align-items-start py-3">
<!--          <img class="me-2" src="/assets/img/slpa_logo.png" alt="" width="30" />-->
          <span class="font-sans-serif" style="color:#02adef;font-size: small">SAFE<span style="color: #f2b00f;font-size: small">APP</span></span>
        </div>
      </a>
      <ul class="navbar-nav navbar-nav-icons ms-auto flex-row align-items-center">
        <li class="nav-item dropdown">
          <a class="nav-link pe-0 ps-2" id="navbarDropdownUser" role="button" data-bs-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false" style="font-size: xx-small">
            <!--              <button class="btn btn-light me-1 mb-1" type="button">-->
            {{ greetingMessage }} Admin &nbsp;&nbsp;&nbsp;&nbsp;
            <!--              </button>-->
          </a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link pe-0 ps-2" id="navbarDropdownUser" role="button" data-bs-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false">

            <div class="avatar avatar-xl" >
              <img class="rounded-circle" :src="`http://hris.slpa.lk/EmpImages/hradmin.jpg`" alt="" />
            </div>

            <i class="bi bi-caret-down-fill bi--xs "></i>

          </a>
          <div class="dropdown-menu dropdown-caret dropdown-caret dropdown-menu-end py-0" aria-labelledby="navbarDropdownUser">
            <div class="bg-white dark__bg-1000 rounded-3 py-2">
              <!-- <a class="dropdown-item link-600 fw-medium" href="/employee">Dashboard</a> -->
              <RouterLink class="nav-link active" to="/">
                <div class="d-flex align-items-center">
                  <span class="nav-link-text ps-1">Dashboard</span>
                </div>
              </RouterLink>

              <div class="nav-link active" >
                <div style="cursor: pointer" class="d-flex align-items-center" @click="handleShowModal">
                  <span class="nav-link-text ps-1">Change Password</span>
                </div>
              </div>
<!--              <RouterLink  class="nav-link" v-for="(item,key) in menu_list" :to="item.href" :key="key">-->
<!--                <div class="d-flex align-items-center">-->
<!--                  <span class="nav-link-text ps-1">{{item.title}}</span>-->
<!--                </div>-->
<!--              </RouterLink>-->
              <a href="#" class="nav-link" @click="signOut">
                <div class="menu-icon text-danger">
                  <i class="bi bi-box-arrow-in-left bi--xs text-danger"></i> SignOut
                </div>
              </a>
              <!-- <a class="dropdown-item link-600 fw-medium" href="#">Contact Us</a> -->
              <!-- <a class="dropdown-item link-600 fw-medium" href="../dashboard/analytics.html">Analytics</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/crm.html">CRM</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/e-commerce.html">E commerce</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/lms.html">LMS<span class="badge rounded-pill ms-2 badge-soft-success">New</span></a><a class="dropdown-item link-600 fw-medium" href="../dashboard/project-management.html">Management</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/saas.html">SaaS</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/support-desk.html">Support desk<span class="badge rounded-pill ms-2 badge-soft-success">New</span></a> -->
            </div>
          </div>
        </li>
      </ul>
    </nav>
  <nav class="navbar  navbar-light navbar-expand-lg " v-else>
    <div class="container">
      <a class="navbar-brand" href="/">
        <div class="d-flex align-items-center py-3">
          <img class="me-2" src="/assets/img/logo.png" alt="" width="50" style="border-radius: 50%;" />
          <span class="font-sans-serif" style="color:#02adef">SAFE <span style="color: #f2b00f">App</span></span>
        </div>
      </a>
      <!-- <a class="navbar-brand" href="/temp"><span class="text-white dark__text-white philosopher-bold">BluInvest</span></a> -->

      <div class="collapse navbar-collapse scrollbar" id="navbarStandard">
        <ul class="navbar-nav ms-auto d-flex">
          <li class="nav-item">
            <div class="menu-item">
              <!-- <a href="#" class="menu-link" @click="signOut">
                  <div class="menu-icon ">
                  <i class="bi bi-box-arrow-in-left bi--xs "></i> SignOut
                  </div>
              </a> -->
            </div>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto d-flex">
          <li class="nav-item">
            <div class="menu-item">
              <!-- <a href="#" class="menu-link" @click="signOut">
                  <div class="menu-icon ">
                  <i class="bi bi-box-arrow-in-left bi--xs "></i> SignOut
                  </div>
              </a> -->
            </div>
          </li>
        </ul>
        <ul class="navbar-nav" data-top-nav-dropdowns="data-top-nav-dropdowns">
          <li class="nav-item dropdown">
            <a class="nav-link pe-0 ps-2" id="navbarDropdownUser" role="button" data-bs-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">
<!--              <button class="btn btn-light me-1 mb-1" type="button">-->
              {{ greetingMessage }} Admin  &nbsp;&nbsp;&nbsp;&nbsp;
<!--              </button>-->
            </a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link pe-0 ps-2" id="navbarDropdownUser" role="button" data-bs-toggle="dropdown"
                                           aria-haspopup="true" aria-expanded="false">
            <div class="avatar avatar-xl">
              <img class="rounded-circle" :src="`http://hris.slpa.lk/EmpImages/hradmin.jpg`" alt="" />
            </div>

            <i class="bi bi-caret-down-fill bi--xs "></i>

          </a>
            <div class="dropdown-menu dropdown-caret dropdown-caret dropdown-menu-end py-0" aria-labelledby="navbarDropdownUser">
              <div class="bg-white dark__bg-1000 rounded-3 py-2">
                <!-- <a class="dropdown-item link-600 fw-medium" href="/employee">Dashboard</a> -->
                <RouterLink class="nav-link active" to="/">
                  <div class="d-flex align-items-center">
                    <span class="nav-link-text ps-1">Dashboard</span>
                  </div>
                </RouterLink>

                <div class="nav-link active" >
                  <div style="cursor: pointer" class="d-flex align-items-center" @click="handleShowModal">
                    <span class="nav-link-text ps-1">Change Password</span>
                  </div>
                </div>
<!--                <RouterLink  class="nav-link" v-for="(item,key) in menu_list" :to="item.href" :key="key">-->
<!--                  <div class="d-flex align-items-center">-->
<!--                    <span class="nav-link-text ps-1">{{item.title}}</span>-->
<!--                  </div>-->
<!--                </RouterLink>-->
                <a href="#" class="nav-link" @click="signOut">
                  <div class="menu-icon text-danger">
                    <i class="bi bi-box-arrow-in-left bi--xs text-danger"></i> SignOut
                  </div>
                </a>
                <!-- <a class="dropdown-item link-600 fw-medium" href="#">Contact Us</a> -->
                <!-- <a class="dropdown-item link-600 fw-medium" href="../dashboard/analytics.html">Analytics</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/crm.html">CRM</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/e-commerce.html">E commerce</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/lms.html">LMS<span class="badge rounded-pill ms-2 badge-soft-success">New</span></a><a class="dropdown-item link-600 fw-medium" href="../dashboard/project-management.html">Management</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/saas.html">SaaS</a><a class="dropdown-item link-600 fw-medium" href="../dashboard/support-desk.html">Support desk<span class="badge rounded-pill ms-2 badge-soft-success">New</span></a> -->
              </div>
            </div>
          </li>
        </ul>

      </div>
    </div>
  </nav>

  <PasswordReset ref="resetPWDModal"  />


</template>
<style>

.navbar-dark,
.navbar[data-bs-theme=dark] {
  --falcon-navbar-color: rgba(7, 7, 7, 0.771);
  --falcon-navbar-hover-color: rgba(94, 93, 93, 0.75);
  --falcon-navbar-disabled-color: rgba(255, 255, 255, 0.25);
  --falcon-navbar-active-color: #131314;
  --falcon-navbar-brand-color: #fff;
  --falcon-navbar-brand-hover-color: #fff;
  --falcon-navbar-toggler-border-color: rgba(255, 255, 255, 0.1);
  --falcon-navbar-toggler-icon-bg: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%239da9bb' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M0 6h30M0 14h30M0 22h30'/%3E%3C/svg%3E");
}
.navbar-brand{
  margin-left: -100px;
}

/* Change the navbar color when it gets darkened */
.navbar-dark.bg-dark {
  background-color: #1d1a1a !important; /* Choose the color you want */
}


</style>
