import i18next from "i18next"
import { initReactI18next, useTranslation } from "react-i18next"

const resources = {}
const files = require.context("./locales", true, /\.json$/);

files.keys().forEach((key) => {
  const name = key.replace(/^\.\/(.*)\.\w+$/, "$1");
  resources[name] = { translation: files(key) };
});

i18next
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "cn", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });



export const i18n = i18next
export const intl = function Intl(...rest) {
  const { t } = useTranslation()
  return t(...rest)
}