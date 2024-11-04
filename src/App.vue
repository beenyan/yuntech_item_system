<template>
  <QLayout view="hHh lpR fFf">
    <Header></Header>

    <Footer></Footer>

    <QPageContainer style="height: 100vh">
      <QScrollArea dark class="fit">
        <RouterView />
      </QScrollArea>
    </QPageContainer>
  </QLayout>
</template>

<script setup lang="ts">
import { QLayout, QPageContainer, QScrollArea } from 'quasar';
import { Footer, Header } from './components/index';
import { RouterView } from 'vue-router';
import { useLoginStore } from './stores';
import router from './router';

const login = useLoginStore();

if (!login._isLogin) {
  router.replace('/login');
}
</script>
