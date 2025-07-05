import { BaseDirectory, writeBinaryFile } from '@tauri-apps/api/fs';
import { flatten } from 'flat';
import * as XLSX from 'xlsx';

const FolderName = 'Health Item';

export const exportExcelReport = async (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(jsonToExcelStruct(data));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const binary = new Uint8Array(buffer);

    await writeBinaryFile(`${FolderName}/${fileName}.xlsx`, binary, { dir: BaseDirectory.Document });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const jsonToExcelStruct = <T>(datas: T[]) => {
  const IGNORE_SUFFIX = ['_id', 'created_at', 'updated_at', 'cardContent', 'is_lock'] as const;

  return datas.map((x) => {
    const Temp = flatten<T, Record<string, any>>(x);
    for (const [key, _] of Object.entries(Temp)) {
      if (IGNORE_SUFFIX.some((suffix) => key.includes(suffix))) {
        delete Temp[key];
        continue;
      }
    }

    return Temp;
  });
};
