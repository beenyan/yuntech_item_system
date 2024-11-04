<template>
  <QFooter bordered class="bg-grey-8 text-white">
    <QToolbar>
      <QToolbarTitle>BeenYan</QToolbarTitle>
      <QToolbarTitle class="text-right">{{ appVersion }}</QToolbarTitle>
    </QToolbar>
  </QFooter>
</template>

<script setup lang="ts">
import { QFooter, QToolbar, QToolbarTitle } from 'quasar';
import { ref, onMounted } from 'vue';
import { getVersion } from '@tauri-apps/api/app';

const appVersion = ref('');

onMounted(async () => (appVersion.value = `v${await getVersion()}`));
</script>
