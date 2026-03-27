/**
 * GlassCard Component
 * 
 * Purpose:
 * A thin wrapper around the base Card component that applies a "glassmorphism"
 * visual effect using backdrop blur and semi-transparent backgrounds.
 * 
 * Approach:
 * Wraps shadcn/ui Card with glassmorphism styling:
 * - Semi-transparent background (bg-card/90)
 * - Backdrop blur effect (backdrop-blur-sm)
 * - Subtle border (border-card/50)
 * - Enhanced blur on hover (hover:backdrop-blur-md)
 * 
 * Design Notes:
 * Glassmorphism creates a modern, frosted-glass aesthetic
 * that works well over gradient or image backgrounds.
 * The effect requires the parent to have a non-solid background.
 * 
 * Security Considerations:
 * - No security implications; purely presentational
 * - Does not handle or expose any sensitive data
 * 
 * Usage:
 * <GlassCard className="p-6">
 *   {content}
 * </GlassCard>
 * 
 * Or with forwardRef for ref access:
 * <GlassCard ref={cardRef} className="p-6">
 *   {content}
 * </GlassCard>
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

/**
 * GlassCardProps extends standard HTML div attributes.
 * Using React.HTMLAttributes allows standard div props like className, onClick, etc.
 * ref is forwarded to the underlying Card element.
 */
const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      // Glassmorphism effect: semi-transparent + blur
      "bg-card/90 backdrop-blur-sm border-card/50",
      // Enhanced blur on hover for interactive feedback
      "hover:backdrop-blur-md transition-all duration-200",
      className
    )}
    {...props}
  />
))

// displayName is required for forwardRef components to show properly in React DevTools
GlassCard.displayName = "GlassCard"

export { GlassCard }
