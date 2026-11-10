import { useState } from "react"
import { Settings } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useSettingsStore } from "@/store/settingsStore"

export function SettingsDialog() {
  const { t } = useTranslation()
  const proxyUrl = useSettingsStore((s) => s.proxyUrl)
  const setProxyUrl = useSettingsStore((s) => s.setProxyUrl)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!setProxyUrl(value)) {
      toast.error(t("settings.errInvalidUrl"))
      return
    }
    setBusy(true)
    try {
      const res = await fetch(
        `${useSettingsStore.getState().proxyUrl}/health`,
      )
      if (!res.ok) throw new Error(String(res.status))
      await res.json()
      toast.success(t("settings.connected"))
      setOpen(false)
    } catch (err) {
      toast.error(t("settings.healthFailed"), {
        description: String(err),
      })
    } finally {
      setBusy(false)
    }
  }

  function remove() {
    useSettingsStore.setState({ proxyUrl: "" })
    toast.info(t("common.remove"))
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) setValue(proxyUrl)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings" className="size-8">
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription>
            {t("settings.desc1")}{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              worker/README.md
            </code>{" "}
            {t("settings.desc2")}
          </DialogDescription>
        </DialogHeader>
        <Input
          dir="ltr"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("settings.placeholder")}
          spellCheck={false}
          autoCapitalize="off"
        />
        {proxyUrl ? (
          <p className="text-xs text-muted-foreground">
            {t("settings.current", { url: proxyUrl })}
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-0">
          {proxyUrl ? (
            <Button variant="outline" onClick={remove} disabled={busy}>
              {t("common.remove")}
            </Button>
          ) : null}
          <Button onClick={save} disabled={busy || !value.trim()}>
            {busy ? t("settings.checking") : t("settings.saveTest")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
