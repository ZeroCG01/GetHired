import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import id from './id.json';
import en from './en.json';

const resources = {
  id: { translation: id },
  en: { translation: en },
};

// Detect device language or fallback to 'id'
const deviceLocales = Localization.getLocales();
const deviceLanguageCode = deviceLocales?.[0]?.languageCode;
const defaultLanguage = deviceLanguageCode === 'en' ? 'en' : 'id';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'id',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
