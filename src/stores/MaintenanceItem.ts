import { defineStore } from 'pinia';
import { ref } from 'vue';
import { z } from 'zod';
import { MaintenanceItem, MaintenanceItemForm, MaintenanceItemSchema } from '@/models/MaintenanceItem';
import { cmd } from '@/models/Command';
import { DeleteResultSchema } from '@/models/Mongodb';
import { ExportData, exportExcelReport } from '@/utils/Export';

export const useMaintenanceItemStore = defineStore('MaintenanceItem', () => {
  const form = ref(new MaintenanceItemForm());
  const _value = ref<Array<MaintenanceItem> | null>(null);

  const find = async () => {
    const result = await cmd.maintenanceItem.find.invoke(z.array(MaintenanceItemSchema));
    _value.value = result;

    return _value.value;
  };

  const value = async () => {
    if (_value.value) return _value.value;

    return await find();
  };

  const deleteById = async (id: string) => {
    const result = await cmd.maintenanceItem.delete_by_id.invoke(DeleteResultSchema, { id });

    await find();

    return result;
  };

  const getLendHistoryByYear = async (year: number) => {
    const result = await cmd.maintenanceItem.historyFindByYear.invoke(z.array(MaintenanceItemSchema), { year });

    return result;
  };

  const exportExcel = async () => {
    const values = (await value()) || [];

    const header = [''];
    const content = [[]];
    return await exportExcelReport(new ExportData(content, header));
  };

  return { form, find, deleteById, value, exportExcel, getLendHistoryByYear };
});
