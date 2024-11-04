<template>
  <QPage class="flex">
    <div class="row full-width flex-center">
      <div class="col"></div>
      <div class="col-8 col-md-6">
        <QForm @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <QInput filled v-model.trim="item.form.name" :label="t('item.name')" :rules="rules.required" />
          <QSelect
            filled
            v-model.trim="item.form.type"
            :options="itemTypeSelect"
            :display-value="t(`item.type.${item.form.type}`)"
            emit-value
            :label="t('item.type.key')"
            :rules="rules.required"
          />
          <QItem tag="label" v-ripple>
            <QItemSection>
              <QItemLabel>{{ t('form.lock') }}</QItemLabel>
            </QItemSection>

            <QItemSection avatar>
              <QToggle color="blue" v-model="item.form.is_lock" val="battery" />
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
import { Notify, QBtn, QForm, QInput, QItem, QItemLabel, QItemSection, QPage, QSelect, QToggle } from 'quasar';
import { Method } from '@/models/Item';
import { useItemStore } from '@/stores';
import { match } from 'ts-pattern';
import { t } from '@/i18n';
import { rules } from '@/utils';
import { ItemType } from '@/models/Item';

const { method } = defineProps<{ method: Method }>();

const emit = defineEmits(['onUpdate']);
const item = useItemStore();
const sending = ref(false);
const itemTypeSelect = ref<Array<{ label: string; value: ItemType }>>([
  {
    label: t('item.type.Borrower'),
    value: 'Borrower',
  },
  {
    label: t('item.type.Mortgage'),
    value: 'Mortgage',
  },
]);

const onReset = () => {
  sending.value = false;
  item.form.reset();
};

const onSubmit = async () => {
  sending.value = true;
  const result = await match(method)
    .with('insert', async () => {
      const result = await item.form.insert();
      if (result) {
        Notify.create({ type: 'info', message: t('message.insertSuccess') });
      }

      return result;
    })
    .with('update', async () => {
      const result = await item.form.update();
      if (result) {
        Notify.create({ type: 'info', message: t('message.updateSuccess') });
      }

      return result;
    })
    .exhaustive();

  if (result !== null) {
    item.form.reset();
    emit('onUpdate');
  }

  sending.value = false;
};
</script>

<style scoped></style>
