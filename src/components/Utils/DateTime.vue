<template>
  <QInput filled v-bind:model-value="date.formatDate(modelValue, mask)" readonly :label>
    <template v-slot:prepend>
      <QIcon name="event" class="cursor-pointer">
        <QPopupProxy cover transition-show="scale" transition-hide="scale">
          <QDate filled @update:model-value="updateModel" v-bind:model-value="date.formatDate(modelValue, mask)" :mask>
            <div class="row items-center justify-end">
              <QBtn v-close-popup label="Close" color="primary" flat />
            </div>
          </QDate>
        </QPopupProxy>
      </QIcon>
    </template>

    <template v-slot:append>
      <QIcon name="access_time" class="cursor-pointer">
        <QPopupProxy cover transition-show="scale" transition-hide="scale">
          <QTime filled @update:model-value="updateModel" v-bind:model-value="date.formatDate(modelValue, mask)" :mask format24h>
            <div class="row items-center justify-end">
              <QBtn v-close-popup label="Close" color="primary" flat />
            </div>
          </QTime>
        </QPopupProxy>
      </QIcon>
    </template>
  </QInput>
</template>

<script lang="ts" setup>
import { QBtn, QDate, QIcon, QInput, QPopupProxy, QTime, date } from 'quasar';
import { ref } from 'vue';

const { modelValue, label } = defineProps<{
  modelValue: Date;
  label?: string;
}>();

const mask = ref('YYYY-MM-DD HH:mm:ss');

const emit = defineEmits(['update:model-value']);
const updateModel = (value: string | null) => {
  if (!value) return;

  emit('update:model-value', new Date(value));
};
</script>
