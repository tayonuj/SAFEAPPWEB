<script setup>
import { defineProps, defineEmits, computed, watch } from 'vue';
import { useStore } from 'vuex';
import useValidation from '../../../composables/application/UIComponents/validationRules';
import Vue3SimpleTypeahead from 'vue3-simple-typeahead';
import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'; // Optional default CSS

const store = useStore();
const props = defineProps({
  section: { type: String, default: 'main' },
  label: String,
  modelValue: String,
  size: { type: String, default: 'small' },
  required: Boolean,
  formSubmitted: Boolean,
  validationTypes: Array,
  isDisabled: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Start writing...' },
  items: { type: Array, default: () => [] }, // List of typeahead items
  minInputLength: { type: Number, default: 1 }, // List of typeahead items
});

const { getValidationRules } = useValidation();
const emits = defineEmits(['update:modelValue']);
const propName = `${props.section}_${props.label}`;

const validationError = computed({
  get: () => store.state.validationErrors[propName] || '',
  set: (value) => {
    store.commit('setValidationError', { field: propName, message: value });
  },
});

const validateInput = (value) => {
  emits('update:modelValue', value);
  validationError.value = '';
  const rules = getValidationRules(props.validationTypes || []);

  for (const rule of rules) {
    const validationResult = rule(value);
    if (validationResult !== true) {
      validationError.value = validationResult;
      break;
    }
  }
};

// Re-validate when modelValue changes externally
watch(() => props.modelValue, () => validateInput(props.modelValue));
watch(() => props.formSubmitted, (value) =>
    value ? validateInput(props.modelValue) : (validationError.value = '')
);

const selectItemHandler = (item) => {
  validateInput(item);
};
</script>

<template>
  <div class="mb-3">
    <label class="form-label" for="typeaheadInput">
      {{ label }}<span v-if="required" class="text-danger">*</span>
    </label>
    <vue3-simple-typeahead
        id="typeaheadInput"
        :placeholder="placeholder"
        :items="items"
        :minInputLength="minInputLength"
        :v-model="modelValue"
        :disabled="isDisabled"
        class="form-control"
        :class="{
                'form-control-sm': size === 'small',
                'form-control-lg': size === 'large',
                'form-control-md': size === 'medium',
                'is-invalid': validationError,
            }"
        @selectItem="selectItemHandler"
        @onInput="validateInput"
    ></vue3-simple-typeahead>
    <div v-if="validationError" class="invalid-feedback">
      {{ validationError }}
    </div>
  </div>
</template>

<style scoped>
.text-danger {
  color: #dc3545 !important;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
}
</style>
