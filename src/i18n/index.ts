import zhTW from './zh-TW.json';
import { createI18n } from 'vue-i18n';

type MessageSchema = typeof zhTW;

export const i18n = createI18n<[MessageSchema], 'zh-TW'>({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'zh-TW',
  messages: {
    'zh-TW': zhTW,
  },
});

export const { t } = i18n.global;
