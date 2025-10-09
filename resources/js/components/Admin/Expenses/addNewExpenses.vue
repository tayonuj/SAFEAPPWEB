<template>
  <div class="container">
    <div class="mt-2">
      <div class="mt-3 mb-4">
        <nav style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/public">මුල් පිටුව</a></li>
            <li class="breadcrumb-item" aria-current="page"><a href="/expenses">වෙනත් වියදම් ලැයිස්තුව</a></li>
            <li class="breadcrumb-item active" aria-current="page">වෙනත් වියදම් ඇතුලත් කිරීම</li>
          </ol>
        </nav>
      </div>
    <Card>
      <div class="d-flex mb-4 mt-3">
        <div class="col">
          <h5 class="mb-0 text-primary position-relative">
            <span class="bg-201 dark__bg-1100 pe-3">
              <b>වියදම් ඇතුලු කිරීම</b>
            </span>
            <span class="border position-absolute top-50 translate-middle-y w-100 z-n1">

            </span>
          </h5>
        </div>
      </div>



      <CardBody>
        <button class="btn btn-falcon-success mb-3" @click="showCategoryModal(expensesCategories)">වියදම් වර්ග ඇතුලු කරන්න</button>


        <form @submit.prevent="submitForm">
          <div class="row">
            <div v-for="(field, index) in formConfig" :key="index" class="col-md-6">
              <div v-if="isFieldVisible(field)">
                <component
                    :is="components[field.component]"
                    :label="field.label"
                    :required="field.required"
                    :items="getSelectItems(field)"
                    :readonly="field.readonly || false"
                    :isDisabled="field.readonly"
                    v-model="formData[field.model]"
                    :validationTypes="field.validationTypes"
                    :formSubmitted="formSubmitted"
                ></component>
              </div>
            </div>
          </div>
          <div class="d-grid gap-2 mt-4">
          <button
              class="btn btn-primary"
              type="button"
              @click="submitForm"
          >
            දත්ත ඇතුලත් කරන්න
          </button>
          </div>
        </form>
      </CardBody>
    </Card>
    </div>

  <new-expense-category-modal ref="expensesCategory"/>
  </div>
</template>

<script setup>
import {reactive, watch, ref, onMounted, inject} from "vue";
import formConfig from "../../InputForms/NewExpenses.json";
import Card from "../../bootstrap/Card.vue";
import ujImageUpload from "../../Reusables/UIComponents/ujImageUpload.vue";
import CardBody from "../../bootstrap/CardBody.vue";
import ujSelect from "../../Reusables/UIComponents/ujSelect.vue";
import ujDatePicker from "../../Reusables/UIComponents/ujDatePicker.vue";
import ujInput from "../../Reusables/UIComponents/ujInput.vue";
import { useStore } from "vuex";
import notificationHandling from "../../../composables/application/notificationHandling";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import NewExpenseCategoryModal from "./newExpenseCategoryModal.vue";


const formData = reactive({});
const formSubmitted = ref(false);
const store = useStore();
const expensesCategories = ref([]);
const $loading = inject('$loading');
const baseURL = inject("$baseURL");

const loader = ref(false);





const loadExpensesCategories = async () => {
  const payload = {
    url: baseURL+'/api/v1/general-queries/readData',
    data: JSON.stringify({
      collection: 'expenses_categories',
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false);
  if (json_data.value) {
    expensesCategories.value = json_data.value;
  }
};

const components = {
  ujImageUpload,
  ujSelect,
  ujDatePicker,
  ujInput,
};


const isFieldVisible = (field) => {
  if (!field.condition) return true;
  return new Function("formData", `return ${field.condition};`)(formData);
};

// **Validate and Submit Form**
const submitForm = async () => {
  loader.value = $loading.show();
  console.log("Form Data Submitted:", formData);
  formSubmitted.value = true;

  setTimeout(() => {
    if (store.getters.hasValidationErrors) {
      notificationHandling("error", "Please resolve the errors before submitting!");
    } else {
      saveDataset(formData);
    }
  }, 1000);
};

// **Save Data**
const saveDataset = async (formData) => {
  console.log("Saving dataset:", formData);

  const payload = {
    url: baseURL+'/api/v1/general-queries/addData',
    data: JSON.stringify({
      collection: 'extra_expenses',
      data: JSON.stringify(formData),
    })
  };

  const { json_data } = await generalAxiosRequest('curl-requests/post', payload, false,'Inserted New Company');
  loader.value.hide();
  addToExpenses()
  if (json_data.value) {
    notificationHandling('success', 'සාර්ථකව ඇතුලත් කළා!');
  }
};

const addToExpenses = async () => {

  let user = localStorage.getItem("user");
  let email = null;
  if (user){
    user = JSON.parse(user);
    email = user.Email;
  }
  const dataset = {
    collection:'extra_expenses',
    category:'Expense',
    collectionExplained:'අමතර වියදම්',
    billNo:formData['billNo'],
    amount:formData['price'],
    paidFromTo:formData['company'],
    date:formData['paymentDate'],
    user:email,
  }

  let loading = $loading.show()
  const payload = {
    url: baseURL + '/api/v1/general-queries/addData',
    data: JSON.stringify({
      collection: 'IncomeExpenses',
      data: JSON.stringify(dataset)
    })
  };

  const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false, 'IncomeExpenses');
  loading.hide();
  notificationHandling('success',"වියදමක් ඇතුලත් කලා!");
  window.location.reload();

}

const expensesCategory = ref(null);
const showCategoryModal = (dataset) => {
  expensesCategory.value.handleShowModal(dataset);
};




const getSelectItems = (field) => {
  if (field.model === 'categoryName') {
    if (expensesCategories.value) {
      return _.map(expensesCategories.value,'categoryName');
    }
  }else{
    return  field.items
  }
}

onMounted(() => {
  // Generate a random product ID with the prefix 'SMF'
  formData['expense_id'] = `EXP${Math.floor(Math.random() * 1000000)}`;

  loadExpensesCategories();
});
</script>
