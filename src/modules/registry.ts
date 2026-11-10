import { ArrowLeftRight, Bitcoin, Coins, TrendingUp, type LucideIcon } from "lucide-react"

export type ModuleDef = {
  id: string
  labelKey: "nav.currencies" | "nav.commodities" | "nav.crypto" | "nav.stocks"
  path?: string
  icon: LucideIcon
  soon?: boolean
}

export const modules: ModuleDef[] = [
  { id: "currencies", labelKey: "nav.currencies", path: "/", icon: ArrowLeftRight },
  { id: "commodities", labelKey: "nav.commodities", path: "/commodities", icon: Coins },
  { id: "crypto", labelKey: "nav.crypto", path: "/crypto", icon: Bitcoin },
  { id: "stocks", labelKey: "nav.stocks", path: "/stocks", icon: TrendingUp },
]
