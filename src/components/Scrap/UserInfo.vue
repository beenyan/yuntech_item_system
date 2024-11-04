<template>
  <QList v-if="items" v-for="user in items" class="q-pl-md" :key="user._id">
    <QExpansionItem icon="person" header-class="bg-deep-purple-10" :class="{ selected: userStore.form._id === user._id }">
      <template v-slot:header>
        <!-- LEFT -->
        <QItemSection>
          <div class="row justify-start">
            <div class="col-auto" v-if="user.is_lock">
              <QChip color="indigo-8">
                <QIcon name="lock" size="xs"></QIcon>
              </QChip>
              <QTooltip class="bg-indigo"> {{ t('form.lock') }} </QTooltip>
            </div>

            <div class="col-auto" v-else>
              <QChip color="indigo-8">
                <QIcon name="lock_open" size="xs"></QIcon>
              </QChip>
              <QTooltip class="bg-indigo"> {{ t('form.unlock') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="indigo-8" icon="fingerprint">{{ user.id }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('user.id') }} </QTooltip>
            </div>

            <div class="col-auto">
              <QChip color="indigo-8" icon="assignment_ind">{{ user.name }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('user.name') }} </QTooltip>
            </div>

            <div class="col-auto" v-if="user.phone">
              <QChip color="indigo-8" icon="phone">{{ user.phone }}</QChip>
              <QTooltip class="bg-indigo"> {{ t('user.phone') }} </QTooltip>
            </div>
          </div>
        </QItemSection>

        <!-- RIGHT -->
        <QItemSection side>
          <div class="row items-center">
            <QBtn @click.stop="userStore.form.fromUser(user)" dense color="indigo-7" round size="sm" class="q-ml-sm">
              <QIcon name="edit" />
              <QTooltip class="bg-indigo"> {{ t('form.update') }} </QTooltip>
            </QBtn>
          </div>
        </QItemSection>
      </template>
    </QExpansionItem>
  </QList>
</template>

<script lang="ts" setup>
import { QBtn, QCard, QCardSection, QChip, QExpansionItem, QIcon, QItemSection, QList, QTooltip } from 'quasar';
import { t } from '@/i18n';
import { useUserStore } from '@/stores';
import { User } from '@/models/User';

defineProps<{
  items: Array<User>;
}>();

const userStore = useUserStore();
</script>

<style lang="scss" scoped>
.selected {
  $width: 5px;

  border-width: 0 0 0 $width;
  border-style: solid;
  margin-left: -$width;
  animation: rainbow 5s linear infinite;
}
</style>
