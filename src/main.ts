import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { i18n } from './i18n';
import router from './router';
import App from './App.vue';

// Quasar
import { Quasar, QuasarPluginOptions, Notify } from 'quasar';
import quasarLang from 'quasar/lang/zh-TW';
import '@quasar/extras/material-icons/material-icons.css';
import './main.scss';
import 'quasar/src/css/index.sass';

const QuasarConfig: Partial<QuasarPluginOptions> = {
  plugins: { Notify },
  lang: quasarLang,
  config: { dark: true },
};

const app = createApp(App);
app.use(i18n);
app.use(createPinia());
app.use(router);
app.use(Quasar, QuasarConfig);
app.mount('#app');
