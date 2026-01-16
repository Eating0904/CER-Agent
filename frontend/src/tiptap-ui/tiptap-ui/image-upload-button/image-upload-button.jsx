import { forwardRef, useCallback } from "react"

// --- Lib ---
import { parseShortcutKeys } from "@/tiptap-ui/lib/tiptap-utils"

// --- Hooks ---
import { useTiptapEditor } from "@/tiptap-ui/hooks/use-tiptap-editor"

import {
  IMAGE_UPLOAD_SHORTCUT_KEY,
  useImageUpload,
} from "@/tiptap-ui/tiptap-ui/image-upload-button"

import { Button } from "@/tiptap-ui/tiptap-ui-primitive/button"
import { Badge } from "@/tiptap-ui/tiptap-ui-primitive/badge"

export function ImageShortcutBadge({
  shortcutKeys = IMAGE_UPLOAD_SHORTCUT_KEY
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for uploading/inserting images in a Tiptap editor.
 *
 * For custom button implementations, use the `useImage` hook instead.
 */
export const ImageUploadButton = forwardRef((
  {
    editor: providedEditor,
    text,
    hideWhenUnavailable = false,
    onInserted,
    showShortcut = false,
    onClick,
    icon: CustomIcon,
    children,
    ...buttonProps
  },
  ref
) => {
  const { editor } = useTiptapEditor(providedEditor)
  const {
    isVisible,
    canInsert,
    handleImage,
    label,
    isActive,
    shortcutKeys,
    Icon,
  } = useImageUpload({
    editor,
    hideWhenUnavailable,
    onInserted,
  })

  const handleClick = useCallback((event) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    handleImage()
  }, [handleImage, onClick])

  if (!isVisible) {
    return null
  }

  const RenderIcon = CustomIcon ?? Icon

  return (
    <Button
      type="button"
      data-style="ghost"
      data-active-state={isActive ? "on" : "off"}
      role="button"
      tabIndex={-1}
      disabled={!canInsert}
      data-disabled={!canInsert}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      onClick={handleClick}
      {...buttonProps}
      ref={ref}>
      {children ?? (
        <>
          <RenderIcon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
          {showShortcut && <ImageShortcutBadge shortcutKeys={shortcutKeys} />}
        </>
      )}
    </Button>
  );
})

ImageUploadButton.displayName = "ImageUploadButton"

