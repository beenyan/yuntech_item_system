import { t } from '@/i18n';
import { BaseDirectory, createDir, writeBinaryFile } from '@tauri-apps/api/fs';
import { Workbook } from 'exceljs';
import { Notify } from 'quasar';
import { formatChineseDateTime } from '.';

const FolderName = 'Health Item';

export class ExportData {
  header: Array<string | undefined | null>;
  content: Array<Array<any>>;

  constructor(content: Array<Array<any>>, header: Array<string>) {
    this.content = content;
    this.header = header;
  }
}

export const exportExcelReport = async (data: ExportData, fileName: string = formatChineseDateTime(new Date())) => {
  try {
    await createDir(FolderName, { dir: BaseDirectory.Document, recursive: true });

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(t('manage.menu.lend-item'));

    if (data.header) worksheet.addRow(data.header);
    worksheet.addRows(data.content);

    const binary = new Uint8Array(await workbook.xlsx.writeBuffer());
    await writeBinaryFile(`${FolderName}/${fileName}.xlsx`, binary, { dir: BaseDirectory.Document });
    return true;
  } catch (error) {
    Notify.create({ type: 'info', message: `${t('message.exportFailed')}: ${error}` });
    return false;
  }
};
