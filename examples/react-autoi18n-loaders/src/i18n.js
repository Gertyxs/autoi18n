import intl from "react-intl-universal";

const locales = {};
const files = require.context("./locales", true, /\.json$/);

files.keys().forEach((key) => {
  const name = key.replace(/^\.\/(.*)\.\w+$/, "$1");
  locales[name] = files(key);
});

const currentLocale = window.localStorage.getItem("lang") || "zh-cn";
intl.init({
  currentLocale,
  locales,
});

//  切换语言
export const changeLang = (lang) => {
  window.localStorage.setItem("lang", lang);
  window.location.reload();
};

export const i18n = intl;
