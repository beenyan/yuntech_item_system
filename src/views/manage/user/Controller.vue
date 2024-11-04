<template>
  <div class="q-pa-md">
    <div class="row justify-center q-gutter-sm">
      <template v-for="menuItem in menuList">
        <CRouterLink class="hover hover-scale" :to="menuItem.to">
          <QIntersection transition="scale">
            <QCard flat bordered class="q-ma-sm card">
              <QCardSection class="bg-primary">
                <div class="text-h6">
                  <QIcon class="q-mr-sm" :name="menuItem.icon" />

                  <span>{{ menuItem.title }}</span>
                </div>
              </QCardSection>
            </QCard>
          </QIntersection>
        </CRouterLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QCard, QCardSection, QIcon, QIntersection } from 'quasar';
import { ref } from 'vue';
import { t } from '@/i18n';

import { CRouterLink } from '@/components';

const menuList = ref([
  {
    to: './list',
    icon: 'search',
    title: `${t('find')}、${t('update')}`,
  },
  {
    to: './insert',
    icon: 'person_add',
    title: t('insert'),
  },
  {
    to: '../',
    icon: 'undo',
    title: t('back'),
  },
]);
</script>
