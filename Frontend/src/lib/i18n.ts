import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from '../translations/en.json';
import daTranslations from '../translations/da.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      da: {
        translation: daTranslations,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    keySeparator: '.',
    debug: process.env.NODE_ENV === 'development',
  });

i18n.reloadResources();

export default i18n; 