<template>
  <QExpansionItem
    :default-opened="true"
    header-class="bg-deep-purple-10"
    class="shadow-1 overflow-hidden"
    style="border-radius: 10px"
    icon="explore"
    :label="t('filter')"
  >
    <QCard>
      <QCardSection>
        <div class="row gap-y-3">
          <div class="row col-12 gap-3">
            <InputStr :label="t('maintenance.item')" v-model="maintenanceStore.filter.item" class="col-12 col-sm" />
            <InputStr :label="t('maintenance.manager')" v-model="maintenanceStore.filter.manager" class="col-12 col-sm" />
          </div>

          <div class="row col-12 gap-3">
            <InputStr :label="t('maintenance.content')" v-model="maintenanceStore.filter.content" class="col-12 col-sm" />
            <InputStr :label="t('maintenance.cause')" v-model="maintenanceStore.filter.cause" class="col-12 col-sm" />
            <InputStr :label="t('maintenance.remark')" v-model="maintenanceStore.filter.remark" class="col-12 col-sm" />
          </div>

          <div class="row col-12 gap-3">
            <DateTime :label="t('maintenance.start_time')" v-model="maintenanceStore.filter.start_date" class="col-12 col-sm" />
            <DateTime :label="t('maintenance.end_time')" v-model="maintenanceStore.filter.end_date" class="col-12 col-sm" />
          </div>
        </div>
      </QCardSection>
    </QCard>
  </QExpansionItem>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { DateTime, InputStr } from '@/components/Utils';
import { t } from '@/i18n';
import { useMaintenanceItemStore } from '@/stores';

const emit = defineEmits(['onFind']);
const maintenanceStore = useMaintenanceItemStore();

watch(maintenanceStore.filter, () => {
  emit('onFind');
});
</script>
