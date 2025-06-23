<template>
  <QList v-if="items" v-for="lendItem in items" class="q-pl-md" :key="lendItem._id">
    <QExpansionItem icon="person" header-class="bg-deep-purple-10" :label="'asdasd'" :class="{ selected: lendItemStore.form._id === lendItem._id }">
      <template v-slot:header>
        <!-- LEFT -->
        <QItemSection>
          <div class="row justify-start">
            <div class="col-auto">
              <QChip color="purple-10" icon="fingerprint">{{ lendItem.borrower_user.id }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('user.id') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="teal-10" icon="assignment_ind">{{ lendItem.borrower_user.name }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('user.name') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="cyan-10" icon="call">{{ lendItem.borrower_user.phone }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('user.phone') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="brown-14" icon="event">{{ formatChineseDateTime(lendItem.due_date) }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('lend.due_date') }} </QTooltip>
            </div>
          </div>
        </QItemSection>

        <!-- RIGHT -->
        <QItemSection side>
          <div class="row items-center" v-if="!lendItem.is_return">
            <QBtn @click.stop="lendItemStore.form.fromLendItem(lendItem)" dense color="indigo-7" round size="sm" class="q-ml-sm">
              <QIcon name="edit" />
              <QTooltip class="bg-indigo"> {{ t('form.update') }} </QTooltip>
            </QBtn>

            <QBtn @click.stop="lendItemStore.returnForm._id = lendItem._id" dense color="green-10" round size="sm" class="q-ml-sm">
              <QIcon name="reply" />
              <QTooltip class="bg-indigo"> {{ t('lend.return') }} </QTooltip>
            </QBtn>

            <QBtn @click.stop="showConfirmDialog(lendItem._id)" dense color="red-10" round size="sm" class="q-ml-sm">
              <QIcon name="delete" />
              <QTooltip class="bg-indigo"> {{ t('form.delete') }} </QTooltip>
            </QBtn>
          </div>
        </QItemSection>
      </template>

      <!-- CONTENT -->
      <QCard>
        <QList class="row gap-4 q-pa-lg">
          <CardContent v-for="content in lendItem.card_contents" :content="content" />
        </QList>
      </QCard>
    </QExpansionItem>
  </QList>

  <ConfirmDialog v-model="showDelete" :label="`${t('form.confirm')}${t('form.delete')}`" @on-update="deleteLendItem" />
</template>

<script lang="ts" setup>
import { Notify, QBtn, QCard, QChip, QExpansionItem, QIcon, QItemSection, QList, QTooltip } from 'quasar';
import { t } from '@/i18n';
import { useLendItemStore } from '@/stores';
import { LendItem } from '@/models/LendItem';
import { formatChineseDateTime } from '@/utils';
import { CardContent } from '@/components/Utils';
import { ConfirmDialog } from '@/components/Dialog';
import { ref } from 'vue';

defineProps<{ items: Array<LendItem> }>();
const emit = defineEmits(['onDelete']);

const lendItemStore = useLendItemStore();
const showDelete = ref(false);
const delete_id = ref('');

const showConfirmDialog = (_id: string) => {
  delete_id.value = _id;
  showDelete.value = true;
};

const deleteLendItem = async (value: boolean) => {
  if (!value) return;

  const result = await lendItemStore.deleteById(delete_id.value);
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
