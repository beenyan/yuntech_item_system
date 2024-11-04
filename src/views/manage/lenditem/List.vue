<template>
  <div class="row">
    <div class="col-12 q-px-lg q-pt-lg" :class="{ 'col-sm-7': lendItemStore.form._id }">
      <QList>
        <!-- Over Due -->
        <QExpansionItem :default-opened="expansion.opened" popup header-class="bg-indigo-10" v-for="(expansion, index) in expansionItems" :key="index">
          <template v-slot:header>
            <QBadge color="red" floating style="left: -3px; right: unset" v-if="expansion.showAmount !== false && expansion.items.length">{{
              expansion.items.length
            }}</QBadge>

            <QItemSection avatar>
              <QIcon name="list_alt" />
            </QItemSection>

            <QItemSection>
              {{ expansion.label }}
            </QItemSection>

            <QItemSection side> </QItemSection>
          </template>
          <QSeparator />

          <LendItemInfo :items="expansion.items" @on-delete="render()"></LendItemInfo>
        </QExpansionItem>
      </QList>
    </div>

    <div v-show="lendItemStore.form._id" class="col-12 col-sm-5" :class="{ 'fixed-right': !Screen.xs }">
      <LendItemForm @on-update="render" method="update" />
    </div>
  </div>

  <ReturnItemDialog @on-update="render()" />
</template>

<script setup lang="ts">
import LendItemForm from '@/components/Form/LendItemForm.vue';
import LendItemInfo from '@/components/Scrap/LendItemInfo.vue';
import ReturnItemDialog from '@/components/Dialog/ReturnItemDialog.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { Screen, QExpansionItem, QList, QSeparator, QBadge, QItemSection, QIcon, Notify } from 'quasar';
import { LendItem } from '@/models/LendItem';
import { useLendItemStore } from '@/stores';
import { t } from '@/i18n';

const lendItemStore = useLendItemStore();
const returnItems = ref<Array<LendItem>>([]);
const notReturnItems = ref<Array<LendItem>>([]);
const overDueItems = ref<Array<LendItem>>([]);
const expansionItems = ref([
  {
    items: overDueItems,
    label: t('lend.type.over_due'),
    opened: true,
  },
  {
    items: notReturnItems,
    label: t('lend.type.not_returned'),
    opened: true,
  },
  {
    items: returnItems,
    label: t('lend.type.return'),
    showAmount: false,
  },
]);

const render = async () => {
  await lendItemStore.find();
  returnItems.value = await lendItemStore.getByType('return');
  notReturnItems.value = await lendItemStore.getByType('notReturn');
  overDueItems.value = await lendItemStore.getByType('overDue');
};

const exportExcle = async () => {
  const result = await lendItemStore.exportExcel();

  if (!result) return;

  Notify.create({ type: 'positive', message: t('message.exportSuccess') });
};

onMounted(() => render());
onUnmounted(() => lendItemStore.form.reset());
</script>
