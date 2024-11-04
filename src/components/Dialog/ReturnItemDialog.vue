<template>
  <QDialog
    @before-hide="lendItem.returnForm.reset()"
    @before-show="lendItem.returnForm.return_date = new Date()"
    v-bind:model-value="lendItem.returnForm._id !== ''"
  >
    <QCard>
      <QCardSection>
        <div class="text-h6">{{ t('menu.return-item') }} - {{ lendItem.returnForm._id }}</div>
      </QCardSection>

      <QSeparator />

      <QForm @submit="onSubmit" @reset="onReset">
        <QCardSection style="max-height: 50vh; width: 500px" class="q-my-lg q-mx-sm">
          <DateTime :label="t('lend.return_date')" v-model="lendItem.returnForm.return_date" />

          <QSelect
            :hide-bottom-space="true"
            filled
            v-model.trim="lendItem.returnForm.manager_user"
            :options="managerUsers"
            option-value="_id"
            option-label="name"
            emit-value
            map-options
            :label="t('user.type.Manager')"
            :rules="rules.required"
          />
        </QCardSection>

        <QSeparator />

        <div class="flex justify-end q-ma-md">
          <QBtn :label="t('lend.return')" :loading="sending" type="sumbit" icon="reply" color="primary" />
        </div>
      </QForm>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { t } from '@/i18n';
import { Notify, QBtn, QCard, QCardSection, QDialog, QForm, QSelect, QSeparator } from 'quasar';
import { DateTime } from '@/components/Utils/index';
import { ref } from 'vue';
import { rules } from '@/utils';
import { User } from '@/models/User';
import { onMounted } from 'vue';
import { useLendItemStore, useUserStore } from '@/stores';

const emit = defineEmits(['onUpdate']);
const lendItem = useLendItemStore();
const managerUsers = ref<Array<User>>([]);
const sending = ref(false);

const onReset = () => {
  sending.value = false;
};

const onSubmit = async () => {
  sending.value = true;

  const result = await lendItem.returnForm.insert();

  if (result) {
    Notify.create({ type: 'info', message: t('message.returnSuccess') });
  }

  emit('onUpdate');
  lendItem.returnForm.reset();

  sending.value = false;
};

onMounted(async () => {
  managerUsers.value = await useUserStore().getByType('Manager');
});
</script>
