<template>
  <QCard flat class="bg-blue-grey-10 q-py-sm">
    <QItem class="text-h5"> {{ content.label }} </QItem>

    <QItem class="row gap-x-3">
      <QCard flat class="row column bg-blue-grey-9 q-px-md q-py-sm gap-y-4" v-for="item in items(content.items)" :key="item.title">
        <QItemSection class="text-h6"> {{ item.title }} </QItemSection>
        <QItemSection style="white-space: pre-line"> {{ item.value }} </QItemSection>
      </QCard>
    </QItem>
  </QCard>
</template>

<script lang="ts" setup>
import { QCard, QItem, QItemSection } from 'quasar';
import { CardItem } from '@/models/CardContent';

const { content } = defineProps<{
  content: {
    label: string;
    items: Array<CardItem | null>;
  };
}>();

const items = (items: Array<CardItem | null>) => items.filter((item) => item?.value) as Array<CardItem>;
</script>
