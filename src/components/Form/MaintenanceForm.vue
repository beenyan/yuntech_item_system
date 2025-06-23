<template>
  <QPage class="flex q-my-lg">
    <div class="row full-width flex-center">
      <div class="col-12 col-sm"></div>
      <div class="col-10">
        <QForm ref="form" @submit="onSubmit" @reset="onReset" class="q-gutter-y-md">
          <div class="row gap-x-4 q-gutter-y-md">
            <QSelect
              filled
              class="col-12 col-sm"
              :hide-bottom-space="true"
              v-model.trim="maintenanceItem.form.item"
              :options="borrowerItems"
              option-value="_id"
              option-label="name"
              emit-value
              map-options
              :label="t('maintenance.item')"
              :rules="rules.required"
            />

            <QSelect
              class="col-12 col-sm"
              :hide-bottom-space="true"
              filled
              v-model.trim="maintenanceItem.form.manager"
              :options="managerUsers"
              option-value="_id"
              option-label="name"
              emit-value
              map-options
              :label="t('maintenance.manager')"
              :rules="rules.required"
            />

            <InputNum class="col-12 col-sm-2" v-model="maintenanceItem.form.cost" :min="0" :label="t('maintenance.cost')" />
          </div>

          <!-- Content & Cause -->
          <div class="row gap-x-4 q-gutter-y-md">
            <InputStr
              class="col-12 col-sm"
              v-model="maintenanceItem.form.content"
              rows="4"
              type="textarea"
              :label="t('maintenance.content')"
              :rules="rules.required"
            />
            <InputStr
              class="col-12 col-sm"
              v-model="maintenanceItem.form.cause"
              rows="4"
              type="textarea"
              :label="t('maintenance.cause')"
              :rules="rules.required"
            />
          </div>

          <!-- Date -->
          <div class="row gap-x-4 q-gutter-y-md">
            <div class="col-12 col-sm">
              <DateTime v-model="maintenanceItem.form.start_date" :label="t('maintenance.start_time')"></DateTime>
            </div>
            <div class="col-12 col-sm">
              <DateTime v-model="maintenanceItem.form.end_date" :label="t('maintenance.end_time')"></DateTime>
            </div>
          </div>

          <!-- Remark -->
          <div class="row gap-x-4 q-gutter-y-md">
            <InputStr class="col-12" v-model="maintenanceItem.form.remark" rows="2" type="textarea" :label="t('lend.remark')" />
          </div>

          <div class="flex justify-around q-mt-xl">
            <QBtn :label="t('form.reset')" type="reset" icon="delete" color="red-10" />
            <QBtn v-if="method === 'insert'" :label="t('insert')" :loading="sending" type="sumbit" icon="add" color="primary" />
            <QBtn v-if="method === 'update'" :label="t('update')" :loading="sending" type="sumbit" icon="edit" color="accent" />
          </div>
        </QForm>
      </div>
      <div class="col-12 col-sm"></div>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notify, QBtn, QForm, QPage, QSelect } from 'quasar';
import { Item, Method } from '@/models/Item';
import { useItemStore, useMaintenanceItemStore, useUserStore } from '@/stores';
import { InputStr, InputNum } from '@/components/Utils';
import { match } from 'ts-pattern';
import { t } from '@/i18n';
import { rules } from '@/utils';
import { DateTime } from '@/components/Utils';
import { onMounted } from 'vue';
import { User } from '@/models/User';

const { method } = defineProps<{ method: Method }>();
const emit = defineEmits(['onUpdate']);

const form = ref<HTMLFormElement | null>(null);
const userStore = useUserStore();
const itemStore = useItemStore();
const maintenanceItem = useMaintenanceItemStore();
const sending = ref(false);
const borrowerItems = ref<Array<Item>>([]);
const managerUsers = ref<Array<User>>([]);

const onReset = () => {
  sending.value = false;
  maintenanceItem.form.reset();
};

const onSubmit = async () => {
  sending.value = true;

  const result = await match(method)
    .with('insert', async () => {
      const result = await maintenanceItem.form.insert();

      if (result) {
        Notify.create({ type: 'info', message: t('message.insertSuccess') });
      }

      return result;
    })
    .with('update', async () => {
      const result = await maintenanceItem.form.update();
      if (result) {
        Notify.create({ type: 'info', message: t('message.updateSuccess') });
      }

      return result;
    })
    .exhaustive();

  if (result !== null) {
    form.value?.reset();
  }

  await maintenanceItem.find();

  emit('onUpdate');

  sending.value = false;
};

onMounted(async () => {
  borrowerItems.value = (await itemStore.getByType('Borrower')).filter((v) => !v.is_lock);
  managerUsers.value = (await userStore.getByType('Manager')).filter((v) => !v.is_lock);
});
</script>
