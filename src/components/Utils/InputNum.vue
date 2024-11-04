<template>
  <QInput filled :hide-bottom-space="true" @update:model-value="updateModel" v-bind:model-value="display(modelValue)" type="number" :label :rules />
</template>

<script lang="ts" setup>
import { QInput, ValidationRule } from 'quasar';

const { modelValue, min, max, label } = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  label?: string;
  rules?: ValidationRule[] | undefined;
}>();

const emit = defineEmits(['update:model-value']);
const display = (value = modelValue) => {
  if (min !== undefined) value = Math.max(min, value);
  if (max !== undefined) value = Math.min(max, value);

  return value;
};
const updateModel = (value: string | number | null) => {
  value = Number(value);
  if (typeof value !== 'number') return;

  emit('update:model-value', display(value));
};
</script>
