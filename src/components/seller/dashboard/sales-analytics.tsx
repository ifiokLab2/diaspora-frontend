'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';

interface ChartItem {
  name: string
  total: number
}

interface SalesAnalyticsProps {
  data: ChartItem[]
  activePeriod: 'weekly' | 'monthly' | 'yearly'
  onPeriodChange: (period: 'weekly' | 'monthly' | 'yearly') => void
}

export function SalesAnalytics({ data, activePeriod, onPeriodChange }: SalesAnalyticsProps) {
  // 1. Map data and calculate total for the visible period
  const { chartData, periodTotal } = useMemo(() => {
    const mapped = data.map(item => ({
      name: item.name,
      value: item.total
    }))
    const total = mapped.reduce((acc, curr) => acc + curr.value, 0)
    return { chartData: mapped, periodTotal: total }
  }, [data])

  // 2. Dynamic scaling for Y-Axis
  const maxVal = Math.max(...chartData.map(d => d.value), 0)
  const yDomain = maxVal > 0 ? maxVal * 1.2 : 500

  // 3. UI logic for Bar Width based on how many items are shown
  const getBarSize = () => {
    if (activePeriod === 'monthly') return 14
    if (activePeriod === 'yearly') return 40
    return 32 // weekly
  }

  return (
    <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-foreground">Sales Analytics</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Total for this period: <span className="text-accent font-medium">{formatCurrency(periodTotal)}</span>
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              onClick={() => onPeriodChange(p)}
              className={`text-xs h-8 px-2 sm:px-3 border-border transition-all capitalize ${
                activePeriod === p 
                ? 'bg-secondary/50 text-foreground border-accent/50 ring-1 ring-accent/30' 
                : 'hover:bg-secondary/50 text-muted-foreground'
              }`}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full flex-1 min-h-[220px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.05)" 
              vertical={false} 
            />
            <XAxis
              dataKey="name"
              stroke="rgb(107, 114, 128)"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              dy={10}
              interval={activePeriod === 'monthly' ? 'preserveStartEnd' : 0}
            />
            <YAxis
              stroke="rgb(107, 114, 128)"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              domain={[0, yDomain]}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            />
           
            <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(17, 24, 39)',
                  border: '1px solid rgb(55, 65, 81)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                itemStyle={{ color: 'hsl(81, 100%, 63%)' }}
                // FIX: Allow value to be number or any, and provide a fallback of 0
                formatter={(value: any) => [`${formatCurrency(Number(value) || 0)}`, 'Revenue']}
              />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]} 
              barSize={getBarSize()}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value === maxVal && maxVal > 0 ? 'hsl(81, 100%, 63%)' : 'rgba(255, 255, 255, 0.1)'} 
                  className="transition-all duration-500 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}