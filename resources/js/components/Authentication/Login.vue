<template>
  <div style="position: relative; height: 100vh; overflow: hidden;">
    <img
        src="/img/wallpaper_safeapps.png"
        alt="Background Image"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1;">

    <div class="row flex-center min-vh-100">
      <div class="col-sm-10 col-md-4 col-lg-4 col-xl-4 col-xxl-4">
        <div class="d-flex flex-center mb-1">
<!--          <img class="me-2" src="/assets/img/slpa_logo.png" alt="Logo" width="58" />-->
          <h3 style="color: #02adef; font-weight: bolder">SAFE<span style="color: #f2b00f">Apps</span></h3>
        </div>

        <div class="card bg-transparent-card">
          <div class="card-body p-sm-5">
            <h5 class="text-center mb-3">Sign in</h5>
            <form v-on:submit.prevent>
              <div class="mb-3">
                <input
                    class="form-control"
                    type="text"
                    placeholder="username"
                    v-model="email" />
              </div>
              <div class="mb-3 position-relative">
                <div class="input-group mb-2">
                <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    placeholder="Password"
                    v-model="pw" />
                  <div class="input-group-append">

                    <div class="input-group-text">
                      <i class="bi bi-eye-fill " v-if="showPassword" @click="showPassword = false"></i>
                      <i class="bi bi-eye-slash " v-else @click="showPassword = true"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <button
                    class="btn btn-primary d-block w-100 mt-3"
                    type="button"
                    :disabled="loading"
                    v-if="loading">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Signing In...
                </button>
                <button
                    v-if="!loading"
                    class="btn btn-primary d-block w-100 mt-3"
                    type="submit"
                    name="submit"
                    @click="signIn">Log in</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {inject, onMounted, ref} from "vue";
import NotificationHandling from "../../composables/application/notificationHandling";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";
import CardBody from "../bootstrap/CardBody.vue";

const email = ref('');
const pw = ref('');
const loading = ref(false);
const baseURL = inject("$baseURL");
const showPassword = ref(false);
const signIn = async () => {
  loading.value = true;
  const payload = {
    url: baseURL+'/api/v1/auth/login',
    data: JSON.stringify({
      username: email.value,
      password: pw.value
    })
  }
  // try {

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);
  console.log("Loging data",json_data.value)

  if(!json_data.value || json_data.value.message === 'Invalid credentials.'){
    NotificationHandling("error","Invalid Credentials");

  }else{
    let user = json_data.value.user;
    let token = json_data.value.token;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('Token', JSON.stringify(token));
      NotificationHandling("success", "Redirecting to Homepage...");

      let payload2 = {
        url: baseURL + '/api/v1/general-queries/readData',
        data: JSON.stringify({
          collection: 'users',
          attr: 'Email',
          filter_array: JSON.stringify([email.value])
        })
      }

      const {json_data2} = await generalAxiosRequest('curl-requests/post', payload2, false, "Sign In");
      // console.log("jsondata2",json_data2.value)
      location.href = "/";
    }

  }
  // } catch (error) {
  console.log("Loging data error",error)
  NotificationHandling("error", "An error occurred during login");
  // } finally {
  //     loading.value = false;
  // }



  // if (email.value === "rasikak73@gmail.com" && pw.value === "1234"){
  //     let user = {email:email.value, password:pw.value}
  //     localStorage.setItem("user",JSON.stringify(user));
  //     NotificationHandling("success","Redirecting to Homepage...");
  //     location.href = "/dashboard";
  //     loading.value = false;
  // }else{
  //     NotificationHandling("error","Invalid Credentials");
  //     loading.value = false;
  // }
}

onMounted(() => {
    if (localStorage.getItem('reloaded')) {
        // The page was just reloaded. Clear the value from local storage
        // so that it will reload the next time this page is visited.
        localStorage.removeItem('reloaded');
    } else {
        // Set a flag so that we know not to reload the page twice.
        localStorage.setItem('reloaded', '1');
        location.reload();
    }
})
</script>

<style scoped>
.transparent-card .card-body {
  background-color: rgba(0, 0, 0, 0.1); /* Semi-transparent background */
  color: white; /* Text color for readability */
  border-radius: 15px; /* Optional: Rounded corners */
}

.card-body input {
  background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent input fields */
  color: black; /* Input text color */
}

.card-body input::placeholder {
  color: rgba(0, 0, 0, 0.6); /* Placeholder text color */
}

.card-body button {
  background-color: #02adef; /* Button color */
  border: none;
}

.card-body button:hover {
  background-color: #0198d1; /* Button hover color */
}

</style>
