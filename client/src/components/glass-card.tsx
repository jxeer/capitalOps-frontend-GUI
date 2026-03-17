import * as React from "react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "bg-card/90 backdrop-blur-sm border-card/50 hover:backdrop-blur-md transition-all duration-200",
      className
    )}
    {...props}
  />
))
GlassCard.displayName = "GlassCard"

export { GlassCard }
