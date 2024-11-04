<template>
  <div class="row">
    <div class="col-12 q-px-lg q-pt-lg" :class="{ 'col-sm-7': item.form._id }">
      <QList>
        <!-- Borrower -->
        <QExpansionItem popup icon="list_alt" header-class="bg-indigo-10" :label="t('item.type.Borrower')">
          <QSeparator />

          <ItemInfo v-if="borrowers" :items="borrowers"></ItemInfo>
        </QExpansionItem>

        <!-- Mortgage -->
        <QExpansionItem popup icon="list_alt" header-class="bg-indigo-10" :label="t('item.type.Mortgage')">
          <QSeparator />

          <ItemInfo v-if="mortgages" :items="mortgages"></ItemInfo>
        </QExpansionItem>
      </QList>
    </div>

    <div v-show="item.form._id" class="col-12 col-sm-5" :class="{ 'fixed-right': !Screen.xs }">
      <ItemForm @on-update="render" method="update" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemForm from '@/components/Form/ItemForm.vue';
import ItemInfo from '@/components/Scrap/ItemInfo.vue';
import { QExpansionItem, QList, QSeparator } from 'quasar';
import { t } from '@/i18n';
import { Item } from '@/models/Item';
import { useItemStore } from '@/stores';
import { onMounted, onUnmounted } from 'vue';
import { ref } from 'vue';
import { Screen } from 'quasar';

const item = useItemStore();
const borrowers = ref<null | Array<Item>>();
const mortgages = ref<null | Array<Item>>();

const render = async () => {
  borrowers.value = await item.getByType('Borrower');
  mortgages.value = await item.getByType('Mortgage');
};

onMounted(() => render());
onUnmounted(() => {
  item.form.reset();
});
</script>
