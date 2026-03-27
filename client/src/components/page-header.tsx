/**
 * PageHeader Component
 * 
 * Purpose:
 * Provides a consistent page header layout with title, optional description,
 * and a flexible area for action buttons or supplementary content.
 * 
 * Approach:
 * Simple flexbox layout with:
 * - Left side: title + optional description
 * - Right side: optional children (buttons, badges, etc.)
 * 
 * Design Decisions:
 * - Uses flexbox with wrap for responsive layout
 * - Title is h1 for semantic HTML structure
 * - Description is muted to be visually subordinate
 * - Children area only renders when content is provided
 * 
 * Security Considerations:
 * - No security implications; purely layout/compositional
 * - Children are not sanitized; parent responsible for safe content
 * 
 * Usage:
 * <PageHeader
 *   title="Projects"
 *   description="Manage your real estate development projects"
 * >
 *   <Button>Add Project</Button>
 *   <Button variant="outline">Export</Button>
 * </PageHeader>
 */

/**
 * Props for PageHeader component.
 * @interface PageHeaderProps
 * @property title - Main page title (rendered as h1)
 * @property description - Optional subtitle/description text
 * @property children - Optional right-aligned content (buttons, badges, etc.)
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * PageHeader renders a standard page header with title, description, and actions.
 * 
 * Layout:
 * - Flex container with items centered and justify-between
 * - Wraps on overflow for responsive behavior
 * - Left column: title (required) + description (optional)
 * - Right column: children content (optional)
 * 
 * @param title - Page title (required)
 * @param description - Supporting description text (optional)
 * @param children - Action buttons or supplementary content (optional)
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    /*
     * Flex container:
     * - items-center: vertically centers content
     * - justify-between: pushes left/right content to edges
     * - gap-4: spacing between title area and children
     * - flex-wrap: wraps to new line on small screens
     */
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Left side: title and optional description */}
      <div>
        {/*
          Title rendered as h1 for semantic HTML (page titles should be h1)
          - text-2xl: large, prominent size
          - font-bold: weight for emphasis
          - tracking-tight: slightly tighter letter spacing
        */}
        <h1 
          className="text-2xl font-bold tracking-tight" 
          data-testid="text-page-title"
        >
          {title}
        </h1>
        
        {/* Description is muted and smaller to be visually subordinate */}
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      
      {/* Right side: optional children (action buttons, badges, etc.) */}
      {children && (
        <div className="flex items-center gap-2 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
