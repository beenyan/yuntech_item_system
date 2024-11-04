<template>
  <QHeader bordered class="bg-primary text-white">
    <QToolbar>
      <QBtn flat @click="setting.value.headerDrawer = !setting.value.headerDrawer" round dense icon="menu"> </QBtn>
      <QToolbarTitle class="text-cyan-1"> {{ t('title') }} </QToolbarTitle>
    </QToolbar>
  </QHeader>

  <QDrawer v-model="setting.value.headerDrawer" :width="200" :breakpoint="500" bordered>
    <QScrollArea class="fit">
      <QList v-show="login._isLogin">
        <template v-if="login._isLogin" v-for="menuItem in menuList">
          <QItem clickable v-ripple :to="menuItem.to" @click="menuItem.click">
            <QItemSection avatar>
              <QIcon :name="menuItem.icon" />
            </QItemSection>

            <QItemSection>{{ menuItem.label }}</QItemSection>
          </QItem>

          <QSeparator v-if="menuItem.separator" />
        </template>
      </QList>
    </QScrollArea>
  </QDrawer>
</template>

<script setup lang="ts">
import { QBtn, QDrawer, QHeader, QIcon, QItem, QItemSection, QList, QScrollArea, QSeparator, QToolbar, QToolbarTitle } from 'quasar';
import { ref, onMounted } from 'vue';
import { getName } from '@tauri-apps/api/app';
import { useLoginStore, useSettingStore } from '@/stores';
import { t } from '@/i18n';

const login = useLoginStore();
const setting = useSettingStore();
const appName = ref('');
const menuList = ref([
  { to: '/manage/lend-item/insert', label: t('menu.lend-item'), icon: 'how_to_vote' },
  { to: '/manage', label: t('menu.manage'), icon: 'lock', separator: true },
  {
    to: '/manage/lend-item/list',
    icon: 'how_to_vote',
    label: t('manage.menu.lend-item'),
  },
  {
    to: '/manage/person/list',
    icon: 'people',
    label: t('manage.menu.user'),
  },
  {
    to: '/manage/item/list',
    icon: 'category',
    label: t('manage.menu.item'),
    separator: true,
  },
  // { icon: 'settings', label: t('setting'), separator: true },
  {
    label: t('menu.logout'),
    icon: 'logout',
    waitLogin: true,
    click() {
      login.logout();
    },
  },
]);

onMounted(async () => {
  appName.value = await getName();
});
</script>
