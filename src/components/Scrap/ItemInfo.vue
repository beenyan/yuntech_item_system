<template>
  <QList v-if="items" v-for="item in items" class="q-pl-md" :key="item._id">
    <QExpansionItem icon="person" header-class="bg-deep-purple-10" :class="{ selected: itemStore.form._id === item._id }">
      <template v-slot:header>
        <!-- LEFT -->
        <QItemSection>
          <div class="row justify-start">
            <div class="col-auto" v-if="item.is_lock">
              <QChip color="indigo-8">
                <QIcon name="lock" size="xs"></QIcon>
              </QChip>
              <QTooltip class="bg-indigo"> {{ t('form.lock') }} </QTooltip>
            </div>

            <div class="col-auto" v-else>
              <QChip color="indigo-8">
                <QIcon name="lock_open" size="xs"></QIcon>
              </QChip>
              <QTooltip class="bg-indigo"> {{ t('form.unlock') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="indigo-8" icon="assignment_ind">{{ item.name }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('item.name') }} </QTooltip>
            </div>
          </div>
        </QItemSection>

        <!-- RIGHT -->
        <QItemSection side>
          <div class="row items-center">
            <QBtn @click.stop="itemStore.form.fromItem(item)" dense color="indigo-7" round size="sm" class="q-ml-sm">
              <QIcon name="edit" />
              <QTooltip class="bg-indigo"> {{ t('form.update') }} </QTooltip>
            </QBtn>
          </div>
        </QItemSection>
      </template>
    </QExpansionItem>
  </QList>
</template>

<script lang="ts" setup>
import { QBtn, QChip, QExpansionItem, QIcon, QItemSection, QList, QTooltip } from 'quasar';
import { t } from '@/i18n';
import { useItemStore } from '@/stores';
import { Item } from '@/models/Item';

defineProps<{
  items: Array<Item>;
}>();

const itemStore = useItemStore();
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
