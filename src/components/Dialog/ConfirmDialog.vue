<template>
  <QDialog @update:model-value="updateModel" v-bind:model-value="modelValue">
    <QCard>
      <QCardSection>
        <div class="text-h6 text-center">{{ label }}</div>
      </QCardSection>

      <QSeparator />

      <QCardSection style="max-height: 50vh; width: 500px" class="q-my-lg q-mx-sm"> {{ content }}</QCardSection>

      <QSeparator />

      <div class="flex justify-around q-ma-md gap-x-5">
        <QBtn :label="t('form.cancel')" @click="update(false)" icon="cancel" color="red-10" v-close-popup />
        <QBtn :label="t('form.confirm')" @click="update(true)" icon="check_circle" color="primary" v-close-popup />
      </div>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { t } from '@/i18n';
import { QBtn, QCard, QCardSection, QDialog, QSeparator } from 'quasar';

const emit = defineEmits(['onUpdate', 'update:model-value']);

const { modelValue } = defineProps<{ modelValue: boolean; label: string; content?: string }>();

const update = (value: boolean) => {
  emit('onUpdate', value);
};

const updateModel = (value: boolean) => {
  emit('update:model-value', value);
};
</script>
