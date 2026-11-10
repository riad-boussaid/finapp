import { useEffect } from "react"
import { i18n } from "@/i18n"
import { applyTheme, useThemeStore } from "@/store/themeStore"
import { useSettingsStore } from "@/store/settingsStore"

export function AppSync() {
  const theme = useThemeStore((s) => s.theme)
  const lang = useSettingsStore((s) => s.lang)
  useEffect(() => {
    applyTheme(theme)
  }, [theme])
  useEffect(() => {
    void i18n.changeLanguage(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
    document.title = i18n.t("app.title")
  }, [lang])
  return null
}
