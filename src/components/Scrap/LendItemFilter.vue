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
            <InputStr :label="t('item.type.Borrower')" v-model="lendItem.filter.lend_item" class="col-12 col-sm" />
            <InputStr :label="t('item.type.Mortgage')" v-model="lendItem.filter.mortgage_item" class="col-12 col-sm" />
            <InputStr :label="t('lend.remark')" v-model="lendItem.filter.remark" class="col-12 col-sm" />
          </div>

          <div class="row col-12 gap-3">
            <InputStr :label="t('user.type.Borrower')" v-model="lendItem.filter.borrower_user" class="col-12 col-sm" />
            <InputStr :label="t('user.type.Manager')" v-model="lendItem.filter.manager_user" class="col-12 col-sm" />
          </div>

          <div class="row col-12 gap-3">
            <DateTime :label="t('lend.lend_start_time')" v-model="lendItem.filter.lend_start_date" class="col-12 col-sm" />
            <DateTime :label="t('lend.lend_end_time')" v-model="lendItem.filter.lend_end_date" class="col-12 col-sm" />
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
import { useLendItemStore } from '@/stores';

const emit = defineEmits(['onFind']);
const lendItem = useLendItemStore();

watch(lendItem.filter, () => {
  emit('onFind');
});
</script>
