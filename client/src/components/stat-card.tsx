/**
 * StatCard Component
 * 
 * Purpose:
 * Displays a single key performance indicator (KPI) with optional trend indicator,
 * icon, and visual styling variants. Used in dashboard grids for at-a-glance metrics.
 * 
 * Key Features:
 * - Large value display with optional subtitle
 * - Configurable icon display
 * - Optional trend indicator (up/down arrow with percentage)
 * - Five visual variants for semantic coloring (default, highlight, success, warning, danger)
 * - Left border accent matching the variant
 * - Glass-like background with hover elevation effect
 * 
 * Design Decisions:
 * - Variants provide semantic meaning: success (positive), warning (caution), danger (critical)
 * - Icon displayed in a colored square badge for visual interest
 * - Trend shows directional arrow with percentage (green up, red down)
 * - Hover effects (shadow increase) provide interactivity feedback
 * - Border-left accent provides quick visual scanning for card type
 * 
 * Security Considerations:
 * - No security implications; purely presentational
 * - Value/text content should be sanitized/validated by parent
 * 
 * Usage:
 * <StatCard
 *   title="Total Portfolio Value"
 *   value={formatCurrency(1500000)}
 *   subtitle="Across 12 assets"
 *   icon={DollarSign}
 *   trend={{ value: "+12%", positive: true }}
 *   variant="success"
 * />
 */

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Props for StatCard component.
 * @interface StatCardProps
 * @property title - Metric label/title (e.g., "Total Revenue")
 * @property value - Main value to display (string or number)
 * @property subtitle - Optional supporting text below value
 * @property icon - Lucide icon component to display
 * @property trend - Optional trend data (value string + positive boolean)
 * @property testId - Optional test ID for automated testing
 * @property variant - Visual style variant (default, highlight, success, warning, danger)
 * @property className - Additional CSS classes
 */
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

/**
 * Background/icon color mappings for each variant.
 * Each variant has a specific semantic meaning:
 * - default: Primary brand color
 * - highlight: Emphasized/selected state
 * - success: Positive metrics (growth, profit)
 * - warning: Caution metrics (slow growth, pending)
 * - danger: Critical metrics (losses, overdue)
 */
const variantStyles = {
  default: "bg-primary/10 text-primary",
  highlight: "bg-primary text-primary-foreground",
  success: "bg-chart-2/20 text-chart-2",
  warning: "bg-chart-3/20 text-chart-3",
  danger: "bg-destructive/20 text-destructive",
};

/**
 * Left border accent colors for each variant.
 * Provides quick visual scanning for card type.
 */
const variantBorders = {
  default: "border-l-2 border-l-primary",
  highlight: "border-l-2 border-l-primary",
  success: "border-l-2 border-l-chart-2",
  warning: "border-l-2 border-l-chart-3",
  danger: "border-l-2 border-l-destructive",
};

/**
 * StatCard displays a key metric with icon, value, and optional trend.
 * 
 * Layout:
 * - Flex row with value area (left) and icon badge (right)
 * - Title with optional trend badge above value
 * - Subtitle below value
 * - Left border accent for variant identification
 * 
 * @param title - Metric label
 * @param value - Main metric value
 * @param subtitle - Optional supporting text
 * @param icon - Lucide icon component
 * @param trend - Optional trend with direction and percentage
 * @param testId - Test identifier
 * @param variant - Visual style variant
 * @param className - Additional CSS classes
 */
export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  testId, 
  variant = "default", 
  className 
}: StatCardProps & { className?: string }) {
  /**
   * Determine trend icon based on positive/negative flag.
   * Neutral trend (undefined positive) shows minus icon.
   */
  const TrendIcon = trend 
    ? (trend.positive ? TrendingUp : TrendingDown) 
    : Minus;
  
  /**
   * Trend color:
   * - true: chart-2 (green) for positive trends
   * - false: destructive (red) for negative trends
   * - undefined: muted for neutral/no trend
   */
  const trendColor = trend?.positive 
    ? "text-chart-2" 
    : trend?.positive === false 
      ? "text-destructive" 
      : "text-muted-foreground";

  return (
    /*
     * Card with variant border and glass-like background:
     * - variantBorders[variant]: left border accent
     * - bg-background/90 backdrop-blur-sm: glass effect
     * - hover-elevate: custom utility for shadow on hover
     */
    <Card 
      className={`
        hover-elevate transition-all duration-200 hover:shadow-lg 
        bg-background/90 backdrop-blur-sm border-card/50 
        ${variantBorders[variant]} 
        ${className || ""}
      `} 
      data-testid={testId}
    >
      <CardContent className="p-5">
        {/*
         * Main content: flex row with value area and icon
         * - items-start: icon aligns to top of card
         * - justify-between: icon pushed to right
        */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: title, value, subtitle */}
          <div className="flex-1 min-w-0">
            {/* Title row with optional trend badge */}
            <div className="flex items-center gap-2">
              {/* Title: uppercase, muted, tracking-wider for label feel */}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              
              {/* Trend badge: shows direction arrow + percentage */}
              {trend && (
                <span 
                  className={`
                    inline-flex items-center gap-0.5 
                    text-[10px] font-medium px-1.5 py-0.5 rounded-full 
                    ${trendColor} bg-background/50
                  `}
                >
                  <TrendIcon className="h-3 w-3" />
                  {trend.value}
                </span>
              )}
            </div>
            
            {/* Main value display */}
            <p 
              className="text-2xl font-bold tracking-tight mt-2" 
              data-testid={`${testId}-value`}
            >
              {value}
            </p>
            
            {/* Optional subtitle */}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Right: Icon in colored square badge */}
          <div 
            className={`
              flex h-10 w-10 shrink-0 items-center justify-center rounded-lg 
              ${variantStyles[variant]}
            `}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
