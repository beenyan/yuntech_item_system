<template>
  <div class="row">
    <div class="col-12 q-px-lg q-pt-lg" :class="{ 'col-sm-7': lendItemStore.form._id }">
      <QList>
        <QExpansionItem :default-opened="true" popup header-class="bg-indigo-10" v-for="(expansion, index) in expansionItems" :key="index">
          <template v-slot:header>
            <QBadge color="red" floating style="left: -3px; right: unset" v-if="expansion.items.length">{{ expansion.items.length }}</QBadge>

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
      <LendItemForm @on-update="render()" method="update" />
    </div>

    <div class="col-12 q-px-lg q-pt-lg" :class="{ 'col-sm-7': lendItemStore.form._id }">
      <LendItemFilter @on-find="render()" />
    </div>

    <div class="col-12 q-px-lg q-pt-md" :class="{ 'col-sm-7': lendItemStore.form._id }">
      <QList>
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

          <LendItemInfo :items="filterItems" @on-delete="render()" />
        </QExpansionItem>
      </QList>
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
import LendItemFilter from '@/components/Scrap/LendItemFilter.vue';

const lendItemStore = useLendItemStore();
const notReturnItems = ref<Array<LendItem>>([]);
const overDueItems = ref<Array<LendItem>>([]);
const filterItems = ref<Array<LendItem>>([]);
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
]);

const render = async () => {
  await lendItemStore.find();
  overDueItems.value = await lendItemStore.getByType('overDue');
  notReturnItems.value = await lendItemStore.getByType('notReturn');
  filterItems.value = await lendItemStore.findByFilter();
};

const exportExcel = async () => {
  const result = await lendItemStore.exportExcel();

  if (result) {
    Notify.create({ type: 'positive', message: t('message.exportSuccess') });
  } else {
    Notify.create({ type: 'negative', message: t('message.exportFailed') });
  }
};

onMounted(() => render());
onUnmounted(() => lendItemStore.form.reset());
</script>
