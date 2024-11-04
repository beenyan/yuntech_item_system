<template>
  <QInput filled :hide-bottom-space="true" :readonly @update:model-value="updateModel" v-bind:model-value="modelValue" :label :rules />
</template>

<script lang="ts" setup>
import { QInput, ValidationRule } from 'quasar';

const [_, modifiers] = defineModel();

const { modelValue, label } = defineProps<{
  modelValue: string | null;
  label?: string;
  rules?: ValidationRule[] | undefined;
  readonly?: boolean;
}>();

const emit = defineEmits(['update:model-value']);
const updateModel = (value: string | number | null) => {
  if (typeof value !== 'string') return;

  if (modifiers.trim) {
    value = value.trim();
  }

  emit('update:model-value', value);
};
</script>
