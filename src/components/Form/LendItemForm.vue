<template>
  <QPage class="flex q-my-lg">
    <div class="row full-width flex-center">
      <div class="col-12 col-sm"></div>
      <div class="col-10">
        <QForm ref="form" @submit="onSubmit" @reset="onReset" class="q-gutter-y-md">
          <!-- Borrower User -->
          <div class="row gap-x-4 q-gutter-y-sm" v-show="method === 'insert'">
            <QSelect
              filled
              use-input
              hide-selected
              fill-input
              class="col-12 col-sm"
              :hide-bottom-space="true"
              v-model.trim="lendItem.form.borrower_user"
              input-debounce="0"
              option-label="id"
              @filter="filterBorrowerUsers"
              @input-value="(value) => (lendItem.form.borrower_user.id = value)"
              :options="borrowerUsers"
              :label="t('user.id')"
              :rules="[({id}:User) =>(rules.idRegex.test(id)) || t('rule.format')]"
            >
              <template v-slot:option="scope">
                <QItem v-bind="scope.itemProps">
                  <QChip color="purple-10" icon="fingerprint">{{ scope.opt.id }}</QChip>
                  <QChip color="blue-10" icon="people">{{ scope.opt.name }}</QChip>
                </QItem>
              </template>
            </QSelect>
            <InputStr class="col-12 col-sm" v-model.trim="lendItem.form.borrower_user.name" :label="t('user.name')" :rules="rules.required" />
            <InputStr class="col-12 col-sm" v-model.trim="lendItem.form.borrower_user.phone" :label="t('user.phone')" :rules="rules.required" />
          </div>

          <!-- Borrower Item -->
          <div class="row gap-x-4 q-gutter-y-md">
            <QSelect
              filled
              use-input
              fill-input
              hide-selected
              new-value-mode="add"
              class="col-12 col-sm-8"
              :hide-bottom-space="true"
              v-model.trim="lendItem.form.lend_item"
              :options="borrowerItems"
              option-value="_id"
              option-label="name"
              emit-value
              map-options
              :label="t('item.type.Borrower')"
              :rules="rules.required"
            />

            <InputNum class="col-12 col-sm" v-model="lendItem.form.lend_item_amount" :min="1" :label="t('lend.amount')" />
          </div>

          <!-- Mortgage Item -->
          <div class="row gap-x-4 q-gutter-y-md">
            <QSelect
              filled
              class="col-12 col-sm-8"
              :hide-bottom-space="true"
              v-model.trim="lendItem.form.mortgage_item"
              :options="mortgageItems"
              option-value="_id"
              option-label="name"
              emit-value
              map-options
              :label="t('item.type.Mortgage')"
              :rules="rules.required"
            />

            <InputNum class="col-12 col-sm" v-model="lendItem.form.mortgage_item_amount" :min="1" :label="t('lend.amount')" />
            <InputNum class="col-12 col-sm" v-model="lendItem.form.mortgage_money" :min="0" :label="t('lend.money')" />
          </div>

          <!-- Date -->
          <div class="row gap-x-4 q-gutter-y-md">
            <div class="col-12 col-sm">
              <DateTime v-model="lendItem.form.lend_date_time" :label="t('lend.lend_time')"></DateTime>
            </div>
            <div class="col-12 col-sm">
              <DateTime v-model="lendItem.form.due_date" :label="t('lend.due_date')"></DateTime>
            </div>
          </div>

          <div class="row gap-x-4 q-gutter-y-md">
            <QSelect
              class="col-12 col-sm"
              :hide-bottom-space="true"
              filled
              v-model.trim="lendItem.form.manager_user"
              :options="managerUsers"
              option-value="_id"
              option-label="name"
              emit-value
              map-options
              :label="t('user.type.Manager')"
              :rules="rules.required"
            />

            <InputStr autogrow class="col-12" v-model="lendItem.form.remark" rows="1" type="textarea" :label="t('lend.remark')" />
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
import { cloneDeep } from 'lodash';
import { Notify, QBtn, QForm, QItem, QPage, QSelect } from 'quasar';
import { Item, Method } from '@/models/Item';
import { useItemStore, useLendItemStore, useUserStore } from '@/stores';
import { InputStr, InputNum } from '@/components/Utils';
import { match } from 'ts-pattern';
import { t } from '@/i18n';
import { rules } from '@/utils';
import { DateTime } from '@/components/Utils';
import { onMounted } from 'vue';
import { User, UserForm } from '@/models/User';

const { method } = defineProps<{ method: Method }>();
const emit = defineEmits(['onUpdate']);

const form = ref<HTMLFormElement | null>(null);
const userStore = useUserStore();
const itemStore = useItemStore();
const lendItem = useLendItemStore();
const sending = ref(false);
const borrowerItems = ref<Array<Item>>([]);
const mortgageItems = ref<Array<Item>>([]);
const managerUsers = ref<Array<User>>([]);
const borrowerUsers = ref<Array<UserForm>>([]);

const onReset = () => {
  sending.value = false;
  lendItem.form.reset();
};

const onSubmit = async () => {
  sending.value = true;

  const result = await match(method)
    .with('insert', async () => {
      const result = await lendItem.form.insert();
      if (result) {
        Notify.create({ type: 'info', message: t('message.insertSuccess') });
      }

      return result;
    })
    .with('update', async () => {
      const result = await lendItem.form.update();
      if (result) {
        Notify.create({ type: 'info', message: t('message.updateSuccess') });
      }

      return result;
    })
    .exhaustive();

  if (result !== null) {
    form.value?.reset();
  }

  await lendItem.find();

  emit('onUpdate');

  sending.value = false;
};

const filterBorrowerUsers = (val: string, update: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void) => {
  update(async () => {
    const users = cloneDeep(await userStore.getByType('Borrower')).map((user) => new UserForm().fromUser(user));

    if (val === '') {
      borrowerUsers.value = users;
      return;
    }

    borrowerUsers.value = users.filter((user) => user.id.includes(val) || user.name.includes(val));
  });
};

onMounted(async () => {
  borrowerItems.value = (await itemStore.getByType('Borrower')).filter((v) => !v.is_lock);
  mortgageItems.value = (await itemStore.getByType('Mortgage')).filter((v) => !v.is_lock);
  managerUsers.value = (await userStore.getByType('Manager')).filter((v) => !v.is_lock);
});
</script>
