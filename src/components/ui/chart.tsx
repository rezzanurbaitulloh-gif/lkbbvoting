"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const ChartContext = React.createContext<{ config: Record<string, { label?: string; color?: string }> } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within ChartContainer")
  return context
}

function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { config: Record<string, { label?: string; color?: string }> }) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        className={cn("flex aspect-video w-full justify-center text-xs", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  hideLabel,
  hideIndicator,
  label,
  labelFormatter,
  formatter,
  color,
  nameKey,
  labelKey,
}: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 shadow-xl text-xs">
      {!hideLabel && label ? <div className="mb-1 font-medium">{labelFormatter ? labelFormatter(label, payload) : label}</div> : null}
      <div className="grid gap-1">
        {payload.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            {!hideIndicator && (
              <span className="h-2 w-2 rounded-full" style={{ background: item.color || item.stroke || color }} />
            )}
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-bold tabular-nums">{formatter ? formatter(item.value, item.name) : item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend
function ChartLegendContent({ payload, verticalAlign = "bottom", hideIcon = false, nameKey }: any) {
  if (!payload?.length) return null
  return (
    <div className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3")}>
      {payload.map((item: any) => (
        <div key={item.value} className="flex items-center gap-1.5 text-xs">
          {!hideIcon && <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />}
          {item.value}
        </div>
      ))}
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, useChart }
