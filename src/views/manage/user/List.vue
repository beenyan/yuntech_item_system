<template>
  <div class="row">
    <div class="col-12 q-px-lg q-pt-lg" :class="{ 'col-sm-7': user.form._id }">
      <QList>
        <!-- Borrower -->
        <QExpansionItem popup icon="people" header-class="bg-indigo-10" :label="t('user.type.Borrower')">
          <QSeparator />

          <UserInfo v-if="borrowers" :items="borrowers"></UserInfo>
        </QExpansionItem>

        <!-- Manager -->
        <QExpansionItem popup icon="manage_accounts" header-class="bg-indigo-10" :label="t('user.type.Manager')">
          <QSeparator />

          <UserInfo v-if="managers" :items="managers"></UserInfo>
        </QExpansionItem>
      </QList>
    </div>

    <div v-show="user.form._id" class="col-12 col-sm-5" :class="{ 'fixed-right': !Screen.xs }">
      <UserManagerForm method="update" />
    </div>
  </div>
</template>

<script setup lang="ts">
import UserManagerForm from '@/components/Form/UserManagerForm.vue';
import UserInfo from '@/components/Scrap/UserInfo.vue';
import { QExpansionItem, QList, QSeparator } from 'quasar';
import { t } from '@/i18n';
import { User } from '@/models/User';
import { useUserStore } from '@/stores';
import { onMounted, onUnmounted } from 'vue';
import { ref } from 'vue';
import { Screen } from 'quasar';

const user = useUserStore();
const managers = ref<null | Array<User>>();
const borrowers = ref<null | Array<User>>();

onMounted(async () => {
  managers.value = await user.getByType('Manager');
  borrowers.value = await user.getByType('Borrower');
});

onUnmounted(() => {
  user.form.reset();
});
</script>
