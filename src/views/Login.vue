<template>
  <QPage class="flex">
    <div class="row full-width flex-center">
      <div class="col"></div>
      <div class="col text-center">
        <QForm @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <QInput filled v-model.trim="login.value.host" :label="t('login.ip')" hint="127.0.0.1" lazy-rules :rules="rules.ip" />

          <QInput filled v-model.trim="login.value.username" :label="t('login.username')" :rules="rules.required" />

          <QInput filled v-model.trim="login.value.password" type="password" :label="t('login.password')" :rules="rules.required" />

          <div class="flex justify-around">
            <QBtn :label="t('form.reset')" type="reset" icon="delete" color="red-10" />
            <QBtn :label="t('login.key')" :loading="sending" type="submit" icon="login" color="primary" />
          </div>
        </QForm>
      </div>
      <div class="col"></div>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { QBtn, QForm, QInput, QPage } from 'quasar';
import { useLoginStore } from '../stores/index';
import * as rules from '../utils/Rules';
import { t } from '../i18n';

const login = useLoginStore();
const sending = ref(false);

const onReset = () => {
  login.reset();
  sending.value = false;
};

const onSubmit = async () => {
  sending.value = true;
  await login.send();
  sending.value = false;
};

onMounted(() => {
  if (login.hasData()) {
    onSubmit();
  }
});
</script>

<style scoped></style>
