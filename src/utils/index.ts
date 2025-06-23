import { date } from 'quasar';
import { match } from 'ts-pattern';

export * as rules from './Rules';
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
export const convertToBoolean = (value: string | boolean) => {
  if (typeof value === 'boolean') {
    return value;
  }

  return match(value.toLowerCase())
    .with('true', () => true)
    .otherwise(() => false);
};
export const formatISODate = (dateTime: string | number | Date | undefined) => date.formatDate(dateTime, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
export const formatChineseDateTime = (dateTime: string | number | Date | undefined) => date.formatDate(dateTime, 'YYYY 年 MM 月 DD 日 HH:mm:ss');
export const formatChineseDate = (dateTime: string | number | Date | undefined) => date.formatDate(dateTime, 'YYYY 年 MM 月 DD 日');
export const formatROCDate = (dateTime: Date) => `${dateTime.getFullYear() - 1911}年 ${dateTime.getMonth() + 1}月 ${dateTime.getDate()}日`;
