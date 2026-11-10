import { useEffect, useRef } from "react"
import {
  AreaSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts"

const UP_COLOR = "#22c55e"
const DOWN_COLOR = "#ef4444"

/**
 * Shared area chart for the stock and coin detail pages. Charts always read
 * left-to-right, so the container is an LTR island inside RTL layouts.
 */
export function AreaChart({
  points,
  height = 320,
  precision,
}: {
  /** `[msTimestamp, value]` pairs — both data APIs deliver milliseconds. */
  points: [number, number][]
  height?: number
  /** Decimals for the price scale; omit for the library default. */
  precision?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null)

  // Create the chart once; data updates flow through the second effect.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      timeScale: { borderColor: "rgba(255,255,255,0.08)" },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
    })
    const series = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      priceLineColor: "#71717a",
    })
    chartRef.current = chart
    seriesRef.current = series
    return () => {
      chartRef.current = null
      seriesRef.current = null
      chart.remove()
    }
  }, [])

  useEffect(() => {
    const series = seriesRef.current
    if (!series || points.length === 0) return
    if (precision !== undefined) {
      series.applyOptions({
        priceFormat: {
          type: "price",
          precision,
          minMove: Math.pow(10, -precision),
        },
      })
    }
    series.setData(
      points.map(([ts, value]) => ({
        time: Math.floor(ts / 1000) as UTCTimestamp,
        value,
      })),
    )
    chartRef.current?.timeScale().fitContent()
    const rising = points.at(-1)![1] >= points[0][1]
    const color = rising ? UP_COLOR : DOWN_COLOR
    series.applyOptions({
      lineColor: color,
      topColor: `${color}33`,
      bottomColor: "transparent",
    })
  }, [points, precision])

  return <div ref={containerRef} dir="ltr" style={{ height }} className="w-full" />
}
