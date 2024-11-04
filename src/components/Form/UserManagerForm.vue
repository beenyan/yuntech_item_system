<template>
  <QPage class="flex">
    <div class="row full-width flex-center">
      <div class="col"></div>
      <div class="col-8 col-md-6">
        <QForm ref="form" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <QInput filled v-model.trim="user.form.id" maxlength="9" :label="t('user.id')" :rules="rules.id" />
          <QInput filled v-model.trim="user.form.name" :label="t('user.name')" :rules="rules.required" />
          <QItem tag="label" v-ripple>
            <QItemSection>
              <QItemLabel>{{ t('form.lock') }}</QItemLabel>
            </QItemSection>

            <QItemSection avatar>
              <q-toggle color="blue" v-model="user.form.is_lock" val="battery" />
            </QItemSection>
          </QItem>

          <div class="flex justify-around q-mt-xl">
            <QBtn :label="t('form.reset')" type="reset" icon="delete" color="red-10" />
            <QBtn v-if="method === 'insert'" :label="t('insert')" :loading="sending" type="sumbit" icon="add" color="primary" />
            <QBtn v-if="method === 'update'" :label="t('update')" :loading="sending" type="sumbit" icon="edit" color="accent" />
          </div>
        </QForm>
      </div>
      <div class="col"></div>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notify, QBtn, QForm, QInput, QItem, QItemLabel, QItemSection, QPage, QToggle } from 'quasar';
import { Method } from '@/models/User';
import { useUserStore } from '@/stores/index';
import { match } from 'ts-pattern';
import { t } from '@/i18n';
import { rules } from '@/utils';

const { method } = defineProps<{ method: Method }>();

const form = ref<HTMLFormElement | null>(null);
const type = 'Manager';
const user = useUserStore();
const sending = ref(false);
user.form.type = type;

const onReset = () => {
  sending.value = false;
  user.form.reset(type);
};

const onSubmit = async () => {
  sending.value = true;
  const result = await match(method)
    .with('insert', async () => {
      const result = await user.form.insert();
      if (result) {
        Notify.create({ type: 'info', message: t('message.insertSuccess') });
      }

      return result;
    })
    .with('update', async () => {
      const result = await user.form.update();
      if (result) {
        Notify.create({ type: 'info', message: t('message.updateSuccess') });
      }

      return result;
    })
    .exhaustive();
  if (result !== null) {
    form.value?.reset();
  }

  sending.value = false;
};
</script>
