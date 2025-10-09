<template>
  <Modal ref="passwordModal" title="Reset Password" :size="'modal-sm'" >
    <div class="p-4">
      <div class="row">
              <div class="col-12">
                <uj-input
                    :model-value="old_pw"
                    :label="'Old Password'"
                    :required="true" :size="'medium'"
                    :validation-types="['required', 'maxLength:50']"
                    :placeholder="'Type Your Old Password'"
                    @update:modelValue="value => old_pw = value"
                    :formSubmitted="formSubmitted"
                />
                <span style="font-size: small;font-weight: bold" v-if="old_pw_error" class="text-danger">
                  Your Password is Invalid. please contact support to reset your password
                </span>
              </div>

              <div class="col-12">
                <uj-input
                    :type="'password'"
                    :model-value="new_pw"
                    :label="'New Password'"
                    :required="true" :size="'medium'"
                    :validation-types="['required', 'maxLength:50']"
                    :placeholder="'Type Your New Password'"
                    @update:modelValue="value => new_pw = value"
                    :formSubmitted="formSubmitted"
                />
              </div>

              <div class="col-12">
                <uj-input
                    :type="'password'"
                    :model-value="confirm_new_pw"
                    :label="'Confirm Password'"
                    :required="true" :size="'medium'"
                    :validation-types="['required', 'maxLength:50']"
                    :placeholder="'Re-Type Your New Password to confirm'"
                    @update:modelValue="value => confirm_new_pw = value"
                    :formSubmitted="formSubmitted"
                />
                <span style="font-size: small;font-weight: bold" v-if="confirm_pw_error" class="text-danger">
                  Your Password is Not match.Re Type password to confirm password change
                </span>
              </div>
              <button class="btn btn-primary d-block w-100 mt-3" type="button" @click="submitPasswordReset" v-if="!loading">
                Submit
              </button>
              <button class="btn btn-primary d-block w-100 mt-3" type="button" disabled="" v-if="loading">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Updating Password...
              </button>
            </div>
    </div>
  </Modal>
</template>
<script setup>
import notificationHandling from "../../composables/application/notificationHandling";

const passwordModal = ref(null);

import Modal from "../bootstrap/Modal.vue";
import Card from "../bootstrap/Card.vue";
import CardBody from "../bootstrap/CardBody.vue";
import UjInput from "../Reusables/UIComponents/ujInput.vue";
import {getCurrentInstance, inject, ref, watch} from "vue";
import generalAxiosRequest from "../../composables/application/generalAxiosRequest";

const old_pw = ref(null);
const new_pw = ref(null);
const confirm_new_pw = ref(null);
const formSubmitted = ref(false);
const confirm_pw_error = ref(false);
const old_pw_error = ref(false);

watch(confirm_new_pw,function(newValue){
  if (new_pw.value === confirm_new_pw.value) {
    confirm_pw_error.value = false;
  }else{
    confirm_pw_error.value = false;

  }
})
const { proxy } = getCurrentInstance();
const loading = ref(false);
const baseurl = inject('$baseURL');
const user = ref(JSON.parse(localStorage.getItem('user')));

const submitPasswordReset = async () => {
  confirm_pw_error.value = false;
  old_pw_error.value = false;
  if (!old_pw.value || old_pw.value === '' || !new_pw.value || new_pw.value === ''){
    notificationHandling('error','Please Fill All The Fields!');
    return;
  }
  if (new_pw.value !== confirm_new_pw.value){
    notificationHandling('error','Password Not Match!');
    confirm_pw_error.value = true;
    return;
  }

  const confirmed = await proxy.$confirm({
    title: 'Confirm Password Reset',
    message: 'You will be sign out after reset password continue ?'
  });
  if (confirmed) {
      loading.value = true;

    let payload = {
      url: baseurl + '/api/v1/auth/resetPW',
      data: JSON.stringify({
        old_password: old_pw.value,
        new_password: new_pw.value,
        username: user.value.USRACC_USER_ID
      })
    }

    const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);
    console.log("password reset", json_data.value);
    if (json_data.value && json_data.value.message){
      if (json_data.value.status){
        notificationHandling('success',json_data.value.message);
          localStorage.removeItem('user');
          localStorage.removeItem('menu');
          localStorage.removeItem('Token');
          localStorage.removeItem('admin_emp_array');

        window.location.reload();
      }else{
        notificationHandling('error',json_data.value.message);
      }
    }
    loading.value = false;

  }
}

const handleShowModal = async (dataset) => {
  console.log('show dataset', dataset);
  passwordModal.value.showModal();
};

defineExpose({
  passwordModal,
  handleShowModal
});
</script>
<style scoped>

</style>
