import { Star } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { pairId, useAppStore, type Pair } from "@/store/appStore"

export function FavoritesBar({ onPick }: { onPick: (pair: Pair) => void }) {
  const { t } = useTranslation()
  const favorites = useAppStore((s) => s.favorites)
  const current = useAppStore((s) => s.pair)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)

  const isCurrentFavorite = favorites.includes(pairId(current))

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => toggleFavorite(current)}
        aria-label={
          isCurrentFavorite ? t("fav.remove") : t("fav.add")
        }
        className="text-muted-foreground transition-colors hover:text-primary"
      >
        <Star
          className={`size-4 ${isCurrentFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
        />
      </button>
      {favorites.length === 0 && (
        <span className="text-xs text-muted-foreground">
          {t("fav.emptyHint")}
        </span>
      )}
      {favorites.map((id) => {
        const [from, to] = id.split("-") as [string, string]
        const active = id === pairId(current)
        return (
          <Badge
            key={id}
            variant={active ? "default" : "secondary"}
            className="cursor-pointer font-mono text-xs"
            onClick={() => onPick({ from, to })}
          >
            {from.toUpperCase()} → {to.toUpperCase()}
          </Badge>
        )
      })}
    </div>
  )
}
