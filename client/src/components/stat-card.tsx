import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  testId?: string;
  variant?: "default" | "highlight" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  highlight: "bg-primary text-primary-foreground",
  success: "bg-chart-2/20 text-chart-2",
  warning: "bg-chart-3/20 text-chart-3",
  danger: "bg-destructive/20 text-destructive",
};

const variantBorders = {
  default: "border-l-2 border-l-primary",
  highlight: "border-l-2 border-l-primary",
  success: "border-l-2 border-l-chart-2",
  warning: "border-l-2 border-l-chart-3",
  danger: "border-l-2 border-l-destructive",
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, testId, variant = "default", className }: StatCardProps & { className?: string }) {
  const TrendIcon = trend ? (trend.positive ? TrendingUp : TrendingDown) : Minus;
  const trendColor = trend?.positive ? "text-chart-2" : trend?.positive === false ? "text-destructive" : "text-muted-foreground";

  return (
    <Card className={`hover-elevate transition-all duration-200 hover:shadow-lg bg-background/90 backdrop-blur-sm border-card/50 ${variantBorders[variant]} ${className || ""}`} data-testid={testId}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              {trend && (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${trendColor} bg-background/50`}>
                  <TrendIcon className="h-3 w-3" />
                  {trend.value}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2" data-testid={`${testId}-value`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>
            )}
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${variantStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
