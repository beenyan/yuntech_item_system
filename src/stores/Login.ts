import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useSettingStore } from './';
import { cmd } from '../models/Command';
import { z } from 'zod';
import { Notify } from 'quasar';
import { t } from '../i18n';
import router from '../router';

export const useLoginStore = defineStore('Login', () => {
  const _setting = useSettingStore();
  const _isLogin = ref(false);

  const value = ref({
    host: _setting.value.login.host,
    username: _setting.value.login.username,
    password: _setting.value.login.password,
  });

  const send = async () => {
    const setting = useSettingStore();
    if (await isLogin()) {
      router.replace(setting.value.router);
      return true;
    }

    setting.value.login.host = value.value.host;
    setting.value.login.username = value.value.username;
    setting.value.login.password = value.value.password;

    await cmd.login.invoke(z.boolean(), { login: value.value });
    const is_login = await isLogin();
    if (is_login) {
      router.replace(setting.value.router);
      Notify.create({ type: 'positive', message: t('message.loginSuccess') });
    }

    return is_login;
  };

  const reset = () => {
    const setting = useSettingStore();
    setting.value.login = {
      host: '',
      username: '',
      password: '',
    };
    value.value.host = '';
    value.value.username = '';
    value.value.password = '';
  };

  const isLogin = async () => {
    if (_isLogin.value === true) return true;

    const isLogin = await cmd.isLogin.invoke(z.boolean());
    if (isLogin === null) return false;
    _isLogin.value = isLogin;
    return isLogin;
  };

  const logout = async () => {
    const isLogout = await cmd.logout.invoke(z.boolean());
    if (isLogout === false) return;

    _isLogin.value = false;
    reset();
    router.replace('/login');
    Notify.create({ type: 'info', message: t('message.logoutSuccess') });
  };

  const hasData = () => {
    const { host, username, password } = value.value;
    return host !== '' && username !== '' && password !== '';
  };

  return { _isLogin, value, hasData, reset, send, isLogin, logout };
});
