<template>
  <div class="row">
    <div class="col-12 q-px-lg q-pt-lg" :class="{ 'col-sm-7': maintenanceStore.form._id }">
      <MaintenanceFilter @on-find="render()" />
    </div>

    <div class="col-12 q-px-lg q-pt-lg" :class="{ 'col-sm-7': maintenanceStore.form._id }">
      <QList class="col-12 q-px-lg q-pt-lg">
        <QExpansionItem :default-opened="true" popup header-class="bg-indigo-10">
          <template v-slot:header>
            <QBadge color="red" floating style="left: -3px; right: unset">{{ filterItems.length }}</QBadge>

            <QItemSection avatar>
              <QIcon name="list_alt" />
            </QItemSection>

            <QItemSection> 搜尋清單 </QItemSection>

            <QItemSection side>
              <div class="row items-center" v-if="filterItems.length > 0">
                <QBtn @click.stop="exportExcel()" dense color="indigo-7" round size="sm" class="q-ml-sm">
                  <QIcon name="get_app" />
                  <QTooltip class="bg-indigo"> {{ t('export.excel') }} </QTooltip>
                </QBtn>
              </div>
            </QItemSection>
          </template>
          <QSeparator />

          <MaintenanceInfo v-if="filterItems" :items="filterItems" @on-delete="render()" />
        </QExpansionItem>
      </QList>
    </div>

    <div v-show="maintenanceStore.form._id" class="col-12 col-sm-5" :class="{ 'fixed-right': !Screen.xs }">
      <MaintenanceForm @on-update="render()" method="update" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MaintenanceForm from '@/components/Form/MaintenanceForm.vue';
import MaintenanceInfo from '@/components/Scrap/MaintenanceInfo.vue';
import MaintenanceFilter from '@/components/Scrap/MaintenanceFilter.vue';
import { useMaintenanceItemStore } from '@/stores';
import { onMounted, onUnmounted } from 'vue';
import { ref } from 'vue';
import { Notify, Screen } from 'quasar';
import { MaintenanceItem } from '@/models/MaintenanceItem';
import { t } from '@/i18n';

const maintenanceStore = useMaintenanceItemStore();
const filterItems = ref<Array<MaintenanceItem>>([]);

const render = async () => {
  filterItems.value = await maintenanceStore.findByFilter();
};

const exportExcel = async () => {
  const result = await maintenanceStore.exportExcel();

  if (result) {
    Notify.create({ type: 'positive', message: t('message.exportSuccess') });
  } else {
    Notify.create({ type: 'negative', message: t('message.exportFailed') });
  }
};

onMounted(() => {
  render();
});

onUnmounted(() => {
  maintenanceStore.form.reset();
});
</script>
