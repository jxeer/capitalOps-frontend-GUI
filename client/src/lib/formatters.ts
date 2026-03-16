/**
 * CapitalOps Data Formatting Utilities
 * 
 * Purpose: Provides consistent formatting for currency, dates, numbers, and status colors
 * across the application UI.
 * 
 * Approach: Uses Intl.NumberFormat for currency/number formatting and Tailwind CSS
 * for status color mapping based on design system.
 */

/**
 * Formats large numbers as shorthand (K/M) for better readability
 * 
 * @param value - Number to format
 * @returns Formatted string (e.g., "$1.5M", "$25K", "$1,234")
 * 
 * @example
 * formatCurrency(1500000) // "$1.5M"
 * formatCurrency(25000)   // "$25K"
 * formatCurrency(1234)    // "$1,234"
 */
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Formats numbers as full currency with USD symbol
 * 
 * @param value - Number to format
 * @returns Fully formatted currency string with 2 decimal places
 * 
 * @example
 * formatFullCurrency(1234.56) // "$1,234.56"
 */
export function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats ISO date strings as readable dates
 * 
 * @param dateStr - ISO date string
 * @returns Formatted date string (e.g., "Mar 15, 2026")
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats numbers with locale-aware commas
 * 
 * @param value - Number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Maps status strings to Tailwind CSS color classes
 * 
 * @param status - Status string (Active, Completed, etc.)
 * @returns Tailwind CSS class string for background and text colors
 */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Active: "bg-chart-2/15 text-chart-2",
    "In Progress": "bg-chart-1/15 text-chart-1",
    Completed: "bg-chart-2/15 text-chart-2",
    Planning: "bg-chart-3/15 text-chart-3",
    "On Hold": "bg-muted text-muted-foreground",
    "Pre-dev": "bg-chart-4/15 text-chart-4",
    Stabilized: "bg-chart-2/15 text-chart-2",
    Draft: "bg-muted text-muted-foreground",
    Funded: "bg-chart-2/15 text-chart-2",
    Closed: "bg-muted text-muted-foreground",
    Pending: "bg-chart-3/15 text-chart-3",
    "Soft Commit": "bg-chart-1/15 text-chart-1",
    "Hard Commit": "bg-chart-4/15 text-chart-4",
    Withdrawn: "bg-destructive/15 text-destructive",
    Delayed: "bg-destructive/15 text-destructive",
    Open: "bg-chart-3/15 text-chart-3",
    Mitigated: "bg-chart-1/15 text-chart-1",
    Resolved: "bg-chart-2/15 text-chart-2",
    Current: "bg-chart-2/15 text-chart-2",
    Expired: "bg-destructive/15 text-destructive",
    Low: "bg-chart-2/15 text-chart-2",
    Medium: "bg-chart-3/15 text-chart-3",
    "Medium-High": "bg-chart-5/15 text-chart-5",
    "Low-Medium": "bg-chart-3/15 text-chart-3",
    High: "bg-chart-5/15 text-chart-5",
    Urgent: "bg-destructive/15 text-destructive",
    Critical: "bg-destructive/15 text-destructive",
    Cancelled: "bg-muted text-muted-foreground",
    "On Track": "bg-chart-2/15 text-chart-2",
    "At Risk": "bg-chart-5/15 text-chart-5",
    "Behind Schedule": "bg-destructive/15 text-destructive",
    Complete: "bg-chart-2/15 text-chart-2",
    "Not Started": "bg-muted text-muted-foreground",
    Approved: "bg-chart-2/15 text-chart-2",
    Declined: "bg-destructive/15 text-destructive",
    Verified: "bg-chart-2/15 text-chart-2",
    Prospect: "bg-chart-3/15 text-chart-3",
    Inactive: "bg-muted text-muted-foreground",
    "Fully Allocated": "bg-chart-2/15 text-chart-2",
    "Active Raise": "bg-chart-1/15 text-chart-1",
    "Early Stage": "bg-chart-4/15 text-chart-4",
  };
  return map[status] || "bg-muted text-muted-foreground";
}

/**
 * Maps risk levels to Tailwind CSS color classes
 * 
 * @param level - Risk level (Low, Medium, High, Critical)
 * @returns Tailwind CSS class string for text color
 */
export function getRiskColor(level: string): string {
  const map: Record<string, string> = {
    Low: "text-chart-2",
    Medium: "text-chart-3",
    High: "text-chart-5",
    Critical: "text-destructive",
  };
  return map[level] || "text-muted-foreground";
}
