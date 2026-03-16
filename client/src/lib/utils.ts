/**
 * Utility functions for CapitalOps application
 * 
 * Purpose: Common string manipulation and utility helpers
 * 
 * Approach: Uses tailwind-merge and clsx for Tailwind class composition
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges className strings with Tailwind CSS class normalization
 * 
 * Combines clsx (for conditional classes) with twMerge (to handle conflicts)
 * Returns a single className string with duplicate/overlapping classes resolved
 * 
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged className string
 * 
 * @example
 * cn("px-2 py-1", { "bg-red-500": isError }, ["text-center"])
 * // Returns normalized className with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
