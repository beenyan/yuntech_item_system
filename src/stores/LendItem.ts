import { defineStore } from 'pinia';
import { ref } from 'vue';
import { z } from 'zod';
import { LendItem, LendItemForm, LendItemSchema, ReturnLendFrom, Type } from '@/models/LendItem';
import { cmd } from '@/models/Command';
import { DeleteResultSchema } from '@/models/Mongodb';
import { ExportData, exportExcelReport } from '@/utils/Export';

export const useLendItemStore = defineStore('LendItem', () => {
  const form = ref(new LendItemForm());
  const returnForm = ref(new ReturnLendFrom());
  const _value = ref<Array<LendItem> | null>(null);

  const find = async () => {
    const result = await cmd.lendItem.find.invoke(z.array(LendItemSchema));
    _value.value = result;

    return _value.value;
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
    const values = (await value()) || [];

    const header = [''];
    const content = [[]];
    return await exportExcelReport(new ExportData(content, header));
  };

  const getLendHistoryByYear = async (year: number) => {
    const result = await cmd.lendItem.lendHistoryFindByYear.invoke(z.array(LendItemSchema), { year });

    return result;
  };

  return { form, returnForm, find, deleteById, getByType, value, exportExcel, getLendHistoryByYear };
});
