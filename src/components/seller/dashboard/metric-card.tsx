'use client'

import { LucideIcon, TrendingUp } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  subtitle: string
  trend?: string
  trendPositive?: boolean
  iconColor?: string
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  trendPositive = true,
  iconColor = 'text-accent',
}: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg p-4 md:p-5 border border-border/50 hover:border-border transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          <h3 className="text-xl md:text-2xl font-bold text-foreground">{value}</h3>
        </div>
        <div className={`p-2 bg-secondary/50 rounded-lg ${iconColor}`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <TrendingUp className={`w-3 h-3 ${trendPositive ? 'text-accent' : 'text-red-500'}`} />
          <span className={`text-xs font-medium ${trendPositive ? 'text-accent' : 'text-red-500'}`}>
            {trend}
          </span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
      )}

      {!trend && subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
