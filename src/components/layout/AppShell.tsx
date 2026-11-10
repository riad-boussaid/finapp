import { NavLink, Outlet, useLocation } from "react-router"
import { Languages, Moon, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { modules } from "@/modules/registry"
import { useThemeStore } from "@/store/themeStore"
import { useSettingsStore } from "@/store/settingsStore"
import type { Lang } from "@/i18n"

function ThemeToggle() {
  const { t } = useTranslation()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? t("common.switchToLight") : t("common.switchToDark")
      }
      className="size-8"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  ar: "العربية",
}

function LangSwitcher() {
  const { t } = useTranslation()
  const lang = useSettingsStore((s) => s.lang)
  const setLang = useSettingsStore((s) => s.setLang)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("common.language")}
          className="size-8"
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(v) => setLang(v as Lang)}
        >
          {(Object.keys(LANG_NAMES) as Lang[]).map((code) => (
            <DropdownMenuRadioItem key={code} value={code}>
              {LANG_NAMES[code]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavItem({
  path,
  label,
  icon: Icon,
  soon,
}: {
  path?: string
  label: string
  icon: LucideIcon
  soon?: boolean
}) {
  if (!path || soon) {
    return (
      <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/60 select-none">
        <Icon className="size-4" />
        <span>{label}</span>
        <Badge variant="outline" className="ms-auto text-[10px] uppercase">
          soon
        </Badge>
      </span>
    )
  }
  return (
    <NavLink
      to={path}
      end={path === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`
      }
    >
      <Icon className="size-4" />
      {label}
    </NavLink>
  )
}

export function AppShell() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  // The crypto market table needs more columns than the rest of the app.
  const wide = pathname.startsWith("/crypto")
  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r bg-card/50 p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            ₣
          </span>
          <span className="text-lg font-semibold tracking-tight">finapp</span>
        </div>
        <nav className="flex flex-col gap-1">
          {modules.map((m) => (
            <NavItem key={m.id} {...m} label={t(m.labelKey)} />
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">
            {t("nav.disclaimer")}
          </p>
          <div className="flex items-center gap-1">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b bg-card/50 px-4 py-3 md:hidden">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            ₣
          </span>
          <span className="font-semibold tracking-tight">finapp</span>
          <span className="ms-auto flex items-center gap-1">
            <LangSwitcher />
            <ThemeToggle />
          </span>
        </header>

        <main
          className={cn(
            "mx-auto w-full flex-1 p-4 pb-24 md:p-8",
            wide ? "max-w-3xl" : "max-w-2xl",
          )}
        >
          <Outlet />
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-10 grid border-t bg-background/95 backdrop-blur md:hidden"
          style={{ gridTemplateColumns: `repeat(${modules.length}, minmax(0, 1fr))` }}
        >
          {modules.map((m) => {
            const content = (
              <>
                <m.icon className="size-5" />
                <span className="text-[11px]">{t(m.labelKey)}</span>
              </>
            )
            const base =
              "flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground"
            if (!m.path || m.soon) {
              return (
                <span key={m.id} className={`${base} opacity-40`}>
                  {content}
                </span>
              )
            }
            return (
              <NavLink
                key={m.id}
                to={m.path}
                end={m.path === "/"}
                className={({ isActive }) =>
                  `${base} ${isActive ? "text-primary" : ""}`
                }
              >
                {content}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
