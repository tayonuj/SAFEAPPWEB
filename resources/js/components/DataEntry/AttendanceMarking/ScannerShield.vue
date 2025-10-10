<template>
  <div
      class="scanner-shield"
      :class="clickThrough ? 'pe-none' : 'pe-all'"
      tabindex="0"
      ref="el"
      @keydown.stop.prevent="emitKey"
      @keypress.stop.prevent
      @keyup.stop.prevent
      @mousedown.stop.prevent="!clickThrough"
      @mouseup.stop.prevent="!clickThrough"
      @click.stop.prevent="!clickThrough"
      @touchstart.stop.prevent="!clickThrough"
      @touchend.stop.prevent="!clickThrough"
  ></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  clickThrough: { type: Boolean, default: false }
});
const emit  = defineEmits(['key','allow-click','block-click']);
const el = ref(null);

function emitKey(e){ emit('key', e); }

function globalKeyDown(ev){
  // let parent decide — but tell it when modifier is down
  if (ev.key === 'Control' || ev.metaKey) emit('allow-click');
}
function globalKeyUp(ev){
  emit('block-click');
}

onMounted(() => {
  document.addEventListener('keydown', globalKeyDown, true);
  document.addEventListener('keyup',   globalKeyUp,   true);
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', globalKeyDown, true);
  document.removeEventListener('keyup',   globalKeyUp,   true);
});

defineExpose({ focus: () => el.value?.focus?.() });
</script>

<style scoped>
.scanner-shield{ position: fixed; inset: 0; background: transparent; z-index: 2147483000; cursor: none; outline: none; }
.pe-none { pointer-events: none; }
.pe-all  { pointer-events: auto; }
</style>
