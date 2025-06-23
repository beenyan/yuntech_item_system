<template>
  <div class="row justify-center items-center q-pa-lg">
    <div class="col-12 text-center">
      <span class="text-h5 text-blue-5">{{ t('export.lend_history') }}</span>
    </div>
    <div class="col-12 text-center q-mt-md">
      <QBtn v-for="year in years" :key="year" :label="year" color="blue" class="q-mx-sm" @click="export_by_year(year)" flat />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { t } from '@/i18n';
import { QBtn, Notify } from 'quasar';
import { exportLendHistory } from '@/models/ExportLend';
import { cmd } from '@/models/Command';
import { z } from 'zod';

const years = ref<number[]>([]);

const export_by_year = async (year: number) => {
  try {
    await exportLendHistory(year);
    Notify.create({ type: 'positive', message: t('message.exportSuccess') });
  } catch (error) {
    console.error('Error fetching lend history:', error);
    Notify.create({ type: 'negative', message: `${t('message.exportFailed')}: ${error}` });
  }
};

onMounted(async () => {
  years.value = (await cmd.getExportHistoryYears.invoke(z.array(z.number()))) ?? [];
});
</script>
