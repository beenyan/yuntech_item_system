<template>
  <div class="row">
    <div class="col-12 q-px-lg q-pt-lg" :class="{ 'col-sm-7': maintenanceStore.form._id }">
      <MaintenanceInfo v-if="items" :items @on-delete="render()" />
    </div>

    <div v-show="maintenanceStore.form._id" class="col-12 col-sm-5" :class="{ 'fixed-right': !Screen.xs }">
      <MaintenanceForm @on-update="render" method="update" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MaintenanceForm from '@/components/Form/MaintenanceForm.vue';
import MaintenanceInfo from '@/components/Scrap/MaintenanceInfo.vue';
import { useMaintenanceItemStore } from '@/stores';
import { onMounted, onUnmounted } from 'vue';
import { ref } from 'vue';
import { Screen } from 'quasar';
import { MaintenanceItem } from '@/models/MaintenanceItem';

const maintenanceStore = useMaintenanceItemStore();
const items = ref<null | Array<MaintenanceItem>>();

const render = async () => {
  items.value = await maintenanceStore.find();
};

onMounted(() => {
  render();
});

onUnmounted(() => {
  maintenanceStore.form.reset();
});
</script>
