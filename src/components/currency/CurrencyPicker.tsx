import { useMemo, useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CurrencyNames } from "@/api/currencyApi"

export function CurrencyPicker({
  value,
  names,
  fallbackCodes,
  onSelect,
}: {
  value: string
  names?: CurrencyNames
  fallbackCodes?: string[]
  onSelect: (code: string) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const options = useMemo(() => {
    const entries = Object.entries(names ?? {})
    if (entries.length === 0) {
      const codes = fallbackCodes && fallbackCodes.length > 0 ? fallbackCodes : [value]
      return codes.map((code) => ({ code, name: code.toUpperCase() }))
    }
    return entries
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [names, fallbackCodes, value])

  const label = names?.[value] ?? value.toUpperCase()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto w-full justify-between px-3 py-2.5"
        >
          <span className="flex min-w-0 flex-col items-start">
            <span className="text-base font-semibold">{value.toUpperCase()}</span>
            <span className="max-w-[180px] truncate text-xs font-normal text-muted-foreground">
              {label}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={t("picker.search")} />
          <CommandList>
            <CommandEmpty>{t("picker.empty")}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.code}
                  value={`${opt.code} ${opt.name}`}
                  onSelect={() => {
                    onSelect(opt.code)
                    setOpen(false)
                  }}
                  keywords={[opt.code, opt.name]}
                >
                  <span className="w-10 font-semibold">{opt.code.toUpperCase()}</span>
                  <span className="truncate text-muted-foreground">{opt.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
