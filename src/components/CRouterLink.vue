<template>
  <RouterLink :to="toPath"> <slot></slot> </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import router from '../router';

const { to } = defineProps<{
  to: string;
}>();

const currentRoute = router.currentRoute.value;
if (currentRoute.path.slice(-1) !== '/') {
  currentRoute.path += '/';
}

const toPath = router.resolve(to, currentRoute);
</script>
