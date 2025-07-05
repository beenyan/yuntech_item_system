<template>
  <QList v-if="items" v-for="item in items" class="q-pl-md" :key="item._id">
    <QExpansionItem icon="person" header-class="bg-deep-purple-10" :class="{ selected: maintenanceItemStore.form._id === item._id }">
      <template v-slot:header>
        <!-- LEFT -->
        <QItemSection>
          <div class="row justify-start">
            <div class="col-auto">
              <QChip color="indigo-8" icon="assignment_ind">{{ item.manager.name }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('maintenance.manager') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="indigo-8" icon="sell">{{ typeof item.item === 'string' ? item.item : item.item.name }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('maintenance.item') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="red-10" icon="paid">{{ item.cost }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('maintenance.cost') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="brown-14" icon="event">{{ formatChineseDate(item.start_date) }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('maintenance.start_time') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="teal-10" icon="event_available">{{ formatChineseDate(item.end_date) }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('maintenance.end_time') }} </QTooltip>
            </div>
          </div>
        </QItemSection>

        <!-- RIGHT -->
        <QItemSection side>
          <div class="row items-center">
            <QBtn @click.stop="maintenanceItemStore.form.fromMaintenanceItem(item)" dense color="indigo-7" round size="sm" class="q-ml-sm">
              <QIcon name="edit" />
              <QTooltip class="bg-indigo"> {{ t('form.update') }} </QTooltip>
            </QBtn>

            <QBtn @click.stop="showConfirmDialog(item._id)" dense color="red-10" round size="sm" class="q-ml-sm">
              <QIcon name="delete" />
              <QTooltip class="bg-indigo"> {{ t('form.delete') }} </QTooltip>
            </QBtn>
          </div>
        </QItemSection>
      </template>

      <!-- CONTENT -->
      <QCard>
        <QList class="row gap-4 q-pa-lg">
          <CardContent v-for="content in item.cardContent" :content="content" />
        </QList>
      </QCard>
    </QExpansionItem>
  </QList>

  <ConfirmDialog v-model="showDelete" :label="`${t('form.confirm')}${t('form.delete')}`" @on-update="deleteMaintenanceItem" />
</template>

<script lang="ts" setup>
import { Notify, QBtn, QCard, QChip, QExpansionItem, QIcon, QItemSection, QList, QTooltip } from 'quasar';
import { t } from '@/i18n';
import { useMaintenanceItemStore } from '@/stores';
import { MaintenanceItem } from '@/models/MaintenanceItem';
import { formatChineseDate } from '@/utils';
import { CardContent } from '../Utils';
import { ref } from 'vue';
import { ConfirmDialog } from '../Dialog';

const emit = defineEmits(['onDelete']);
defineProps<{
  items: Array<MaintenanceItem>;
}>();

const maintenanceItemStore = useMaintenanceItemStore();
const showDelete = ref(false);
const delete_id = ref('');

const showConfirmDialog = (_id: string) => {
  delete_id.value = _id;
  showDelete.value = true;
};

const deleteMaintenanceItem = async (value: boolean) => {
  if (!value) return;

  const result = await maintenanceItemStore.deleteById(delete_id.value);
  if (!result) return;

  Notify.create({ type: 'info', message: t('message.deleteSuccess') });
  emit('onDelete');
};
</script>

<style lang="scss" scoped>
.selected {
  $width: 5px;

  border-width: 0 0 0 $width;
  border-style: solid;
  margin-left: -$width;
  animation: rainbow 5s linear infinite;
}
</style>
