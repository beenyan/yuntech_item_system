<template>
  <div class="q-pa-md">
    <div class="row justify-center q-gutter-sm">
      <template v-for="menuMaintenance in menuList">
        <CRouterLink class="hover hover-scale" :to="menuMaintenance.to">
          <QIntersection transition="scale">
            <QCard flat bordered class="q-ma-sm card">
              <QCardSection class="bg-primary">
                <div class="text-h6">
                  <QIcon class="q-mr-sm" :name="menuMaintenance.icon" />

                  <span>{{ menuMaintenance.title }}</span>
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
    to: 'list',
    icon: 'search',
    title: `${t('find')}、${t('update')}`,
  },
  {
    to: 'insert',
    icon: 'post_add',
    title: t('insert'),
  },
  {
    to: '../',
    icon: 'undo',
    title: t('back'),
  },
]);
</script>
