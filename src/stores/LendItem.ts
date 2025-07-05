import { defineStore } from 'pinia';
import { ref } from 'vue';
import { z } from 'zod';
import { LendItem, LendItemFilter, LendItemForm, LendItemSchema, ReturnLendFrom, Type } from '@/models/LendItem';
import { cmd } from '@/models/Command';
import { DeleteResultSchema } from '@/models/Mongodb';
import { exportExcelReport } from '@/utils/Export';
import { t } from '@/i18n';

export const useLendItemStore = defineStore('LendItem', () => {
  const form = ref(new LendItemForm());
  const returnForm = ref(new ReturnLendFrom());
  const filter = ref(new LendItemFilter());
  const _value = ref<LendItem[] | null>(null);
  const _filterValue = ref<LendItem[]>([]);

  const find = async () => {
    const result = await cmd.lendItem.find_not_return.invoke(z.array(LendItemSchema));
    _value.value = result;

    return _value.value;
  };

  const findByFilter = async () => {
    _filterValue.value = (await cmd.lendItem.find_by_filter.invoke(z.array(LendItemSchema), { filter: filter.value.toJSON() })) ?? [];

    return _filterValue.value;
  };

  const value = async () => {
    if (_value.value) return _value.value;

    return await find();
  };

  const deleteById = async (id: string) => {
    const result = await cmd.lendItem.delete_one.invoke(DeleteResultSchema, { id });

    await find();

    return result;
  };

  const getByType = async (type: Type) => {
    const val = (await value()) || [];
    const lenditems = val.filter((v) => v.type === type);

    lenditems.sort((a, b) => (a.due_date > b.due_date ? 1 : -1));

    return lenditems;
  };

  const exportExcel = async () => {
    return await exportExcelReport(_filterValue.value, t('menu.lend-item'));
  };

  const getLendHistoryByYear = async (year: number) => {
    const result = await cmd.lendItem.lendHistoryFindByYear.invoke(z.array(LendItemSchema), { year });

    return result;
  };

  return { form, filter, returnForm, find, findByFilter, deleteById, exportExcel, getByType, value, getLendHistoryByYear };
});
