import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { Ok, Err, Result } from 'ts-results';
import { convertToBoolean } from '@/utils';

export const SETTING_ITEM_KEY = 'setting';

const saveSetting = (value: Object) => localStorage.setItem(SETTING_ITEM_KEY, JSON.stringify(value));

const findVal = (obj: Record<string, any>, keyList: string[]): Result<string, string> => {
  if (keyList.length === 0) return Err('KeyList is Empty');

  if (keyList.length === 1 && obj.hasOwnProperty(keyList[0])) {
    return Ok(obj[keyList[0]]);
  } else {
    const key = keyList.shift() as string;
    if (obj.hasOwnProperty(key)) {
      return findVal(obj[key], keyList);
    } else {
      return Err('Value Not Found');
    }
  }
};

const getSetting = <T>(key: string, defaultValue: T) => {
  try {
    const setting = JSON.parse(localStorage.getItem(SETTING_ITEM_KEY) ?? '{}') as Object;
    const value = findVal(setting, key.split('.'));
    if (value.ok) {
      return value.val;
    } else return defaultValue;
  } catch (_) {
    return defaultValue;
  }
};

export const useSettingStore = defineStore('Setting', () => {
  const value = ref({
    login: { host: getSetting('login.host', ''), username: getSetting('login.username', ''), password: getSetting('login.password', '') },
    router: getSetting('router', '/manage/lend-item/insert'),
    headerDrawer: convertToBoolean(getSetting('headerDrawer', true)),
  });

  watch(
    value,
    (_, oldVal) => {
      if (oldVal === null) return;

      saveSetting(value.value);
    },
    { deep: true },
  );

  return { value };
});
