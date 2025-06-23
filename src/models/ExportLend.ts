import { useItemStore, useLendItemStore, useMaintenanceItemStore } from '@/stores';
import { BaseDirectory, createDir, readBinaryFile, writeBinaryFile } from '@tauri-apps/api/fs';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { z } from 'zod';
import { LendItemSchema } from './LendItem';
import { MaintenanceItem } from './MaintenanceItem';
import { formatROCDate } from '@/utils';

class MaintenanceItemsExport {
  id: number;
  name: string;
  content: string;
  start_date: string;
  end_date: string;
  manager: string;
  constructor(id: number, maintenanceData: MaintenanceItem) {
    this.id = id;
    this.name = maintenanceData.item.name;
    this.content = maintenanceData.content;
    this.start_date = formatROCDate(maintenanceData.start_date);
    this.end_date = formatROCDate(maintenanceData.end_date);
    this.manager = maintenanceData.manager.name;
  }
}

type LendItem = z.infer<typeof LendItemSchema>;

const summarizeByYear = async (data: LendItem[], maintenanceDatas: MaintenanceItem[], year: number, dateKey: 'lend_date_time' | 'return_date') => {
  const ItemStore = useItemStore();
  const items = await ItemStore.items;
  if (!items) throw new Error('Items not found');

  const borrowerNames = items.filter((e) => e.type === 'Borrower').map((e) => e.name);

  const baseItemStructure = borrowerNames.map((name) => ({
    name,
    amount: 0,
  }));

  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const monthlySummary = months.map((month_title) => ({
    month_title,
    items: baseItemStructure.map((item) => ({ ...item })),
    maintenance_items: [] as MaintenanceItemsExport[],
  }));

  for (const entry of data) {
    const date = entry[dateKey];
    if (!date || date.getFullYear() !== year) continue;

    const monthIndex = date.getMonth();
    const targetMonth = monthlySummary[monthIndex];
    const targetItem = targetMonth.items.find((item) => item.name === entry.lend_item.name);
    if (targetItem) {
      targetItem.amount += entry.lend_item_amount;
    }
  }

  for (const entry of maintenanceDatas) {
    const monthIndex = entry.start_date.getMonth();
    const targetMonth = monthlySummary[monthIndex];
    targetMonth.maintenance_items.push(new MaintenanceItemsExport(targetMonth.maintenance_items.length + 1, entry));
  }

  const groupedResult = monthlySummary.map(({ month_title, items, maintenance_items }) => ({
    month_title,
    items: items.reduce((groups, item, index) => {
      if (index % 2 === 0) {
        groups.push({ inner: [item] });
      } else {
        groups[groups.length - 1].inner.push(item);
      }
      return groups;
    }, [] as Array<{ inner: { name: string; amount: number }[] }>),
    maintenance_items,
  }));

  return groupedResult;
};

export const exportLendHistory = async (year: number) => {
  const lendItemStore = useLendItemStore();
  const maintenanceItemStore = useMaintenanceItemStore();
  const lendHistoryDatas = await lendItemStore.getLendHistoryByYear(year);
  const maintenanceHistoryDatas = await maintenanceItemStore.getLendHistoryByYear(year);
  if (!lendHistoryDatas || !maintenanceHistoryDatas) return;

  const rocYear = year - 1911;
  const threeDayDateTime = 3 * 24 * 60 * 60 * 1000;
  const unreturnedUsers = lendHistoryDatas.reduce((acc, entry) => {
    if (!entry.return_date && entry.due_date.getTime() - threeDayDateTime < Date.now()) {
      const due_date = `${entry.due_date.getFullYear() - 1911}年 ${entry.due_date.getMonth() + 1}月 ${entry.due_date.getDate()}日`;

      acc.push({
        id: entry.borrower_user.id,
        name: entry.borrower_user.name,
        phone: entry.borrower_user.phone,
        item_name: entry.lend_item.name,
        due_date,
      });
    }

    return acc;
  }, [] as { id: string; name: string; phone: string | null; item_name: string; due_date: string }[]);
  const lendWord = {
    year: rocYear,
    months: await summarizeByYear(lendHistoryDatas, maintenanceHistoryDatas, year, 'lend_date_time'),
    unreturnedUsers,
  };
  const returnWord = {
    year: rocYear,
    months: await summarizeByYear(lendHistoryDatas, maintenanceHistoryDatas, year, 'return_date'),
    unreturnedUsers,
  };
  console.log(lendWord);

  await createDir('Health Item', { dir: BaseDirectory.Document, recursive: true });
  const buffer = await readBinaryFile(`./resources/lend_history.docx`, { dir: BaseDirectory.Resource });
  const generateReport = async (data: any, filename: string) => {
    const doc = new Docxtemplater(new PizZip(buffer), {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
    });
    doc.render(data);

    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    await writeBinaryFile(`Health Item/${filename}`, new Uint8Array(await blob.arrayBuffer()), {
      dir: BaseDirectory.Document,
    });
  };

  await Promise.all([generateReport(lendWord, `${year}年度借出報表.docx`), generateReport(returnWord, `${year}年度歸還報表.docx`)]);
};
