import i18next, { type i18n as I18n } from "i18next"
import { initReactI18next } from "react-i18next"
import type { Locale } from "date-fns"
import { ar } from "date-fns/locale"
import en from "./en"
import arResources from "./ar"

export type Lang = "en" | "ar"

/**
 * Peek the persisted language before React mounts so an Arabic user's first
 * paint is already RTL. Reads the zustand persist blob directly to avoid
 * importing the store here (keeps lib/ unit tests free of side effects).
 */
function initialLang(): Lang {
  try {
    if (typeof localStorage === "undefined") return "en"
    const raw = localStorage.getItem("finapp-settings")
    const parsed = raw ? (JSON.parse(raw) as { state?: { lang?: Lang } }) : null
    return parsed?.state?.lang === "ar" ? "ar" : "en"
  } catch {
    return "en"
  }
}

export const i18n: I18n = i18next.createInstance()

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: arResources },
  },
  lng: initialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
})

/** Intl locale for the active language; Arabic keeps Latin digits. */
export function currentLocale(): string {
  const lang = i18n.language ?? "en"
  return lang.startsWith("ar") ? "ar-u-nu-latn" : "en"
}

/** date-fns locale for the active language. */
export function dateFnsLocale(): Locale | undefined {
  const lang = i18n.language ?? "en"
  return lang.startsWith("ar") ? ar : undefined
}

// Typed t() keys across the app.
declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof en
    }
  }
}
