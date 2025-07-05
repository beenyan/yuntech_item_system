import { defineStore } from 'pinia';
import { ref } from 'vue';
import { z } from 'zod';
import { MaintenanceFilter, MaintenanceItem, MaintenanceItemForm, MaintenanceItemSchema } from '@/models/MaintenanceItem';
import { cmd } from '@/models/Command';
import { DeleteResultSchema } from '@/models/Mongodb';
import { exportExcelReport } from '@/utils/Export';
import { t } from '@/i18n';

export const useMaintenanceItemStore = defineStore('MaintenanceItem', () => {
  const form = ref(new MaintenanceItemForm());
  const filter = ref(new MaintenanceFilter());
  const _value = ref<MaintenanceItem[] | null>(null);
  const _filterValue = ref<MaintenanceItem[]>([]);

  const find = async () => {
    const result = await cmd.maintenanceItem.find.invoke(z.array(MaintenanceItemSchema));
    _value.value = result;

    return _value.value;
  };

  const findByFilter = async () => {
    _filterValue.value = (await cmd.maintenanceItem.find_by_filter.invoke(z.array(MaintenanceItemSchema), { filter: filter.value.toJSON() })) ?? [];

    return _filterValue.value;
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
    return await exportExcelReport(_filterValue.value, t('menu.maintenance-item'));
  };

  return { form, filter, find, findByFilter, deleteById, value, exportExcel, getLendHistoryByYear };
});
