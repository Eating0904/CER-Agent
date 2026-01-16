import { forwardRef } from "react"
import "@/tiptap-ui/tiptap-ui-primitive/separator/separator.scss"
import { cn } from "@/tiptap-ui/lib/tiptap-utils"

export const Separator = forwardRef(
  ({ decorative, orientation = "vertical", className, ...divProps }, ref) => {
    const ariaOrientation = orientation === "vertical" ? orientation : undefined
    const semanticProps = decorative
      ? { role: "none" }
      : { "aria-orientation": ariaOrientation, role: "separator" }

    return (
      <div
        className={cn("tiptap-separator", className)}
        data-orientation={orientation}
        {...semanticProps}
        {...divProps}
        ref={ref} />
    );
  }
)

Separator.displayName = "Separator"

