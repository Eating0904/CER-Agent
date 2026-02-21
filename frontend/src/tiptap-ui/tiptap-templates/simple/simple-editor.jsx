"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Selection } from "@tiptap/extensions"
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontSize } from "@/features/essay/FontSize"

// --- UI Primitives ---
import { Button } from "@/tiptap-ui/tiptap-ui-primitive/button"
import { Spacer } from "@/tiptap-ui/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/tiptap-ui/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { HorizontalRule } from "@/tiptap-ui/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/tiptap-ui/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/tiptap-ui/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/tiptap-ui/tiptap-node/list-node/list-node.scss"
import "@/tiptap-ui/tiptap-node/heading-node/heading-node.scss"
import "@/tiptap-ui/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { ListDropdownMenu } from "@/tiptap-ui/tiptap-ui/list-dropdown-menu"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/tiptap-ui/tiptap-ui/color-highlight-popover"
import { MarkButton } from "@/tiptap-ui/tiptap-ui/mark-button"
import { TextAlignButton } from "@/tiptap-ui/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/tiptap-ui/tiptap-ui/undo-redo-button"
import { FontSizeDropdown } from "@/features/essay/FontSizeDropdown"
import { TextColorPopover } from "@/features/essay/TextColorPopover"

// --- Icons ---
import { ArrowLeftIcon } from "@/tiptap-ui/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/tiptap-ui/tiptap-icons/highlighter-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/tiptap-ui/hooks/use-is-breakpoint"
import { useWindowSize } from "@/tiptap-ui/hooks/use-window-size"
import { useCursorVisibility } from "@/tiptap-ui/hooks/use-cursor-visibility"

// ThemeToggle 已移除，如需加回自動偵測主題功能，取消下行註解
// import { ThemeToggle } from "@/tiptap-ui/tiptap-templates/simple/theme-toggle"

// --- Styles ---
import "@/tiptap-ui/tiptap-templates/simple/simple-editor.scss"

const MainToolbarContent = ({
  onHighlighterClick,
  isMobile
}) => {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <FontSizeDropdown portal={isMobile} />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
        <TextColorPopover />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ListDropdownMenu types={["bulletList", "orderedList"]} portal={isMobile} />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
      </ToolbarGroup>
      <Spacer />
      {/* ThemeToggle 已移除，強制使用 Light Mode */}
    </>
  );
}

const MobileToolbarContent = ({
  type,
  onBack
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" && (
          <HighlighterIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" && (
      <ColorHighlightPopoverContent />
    )}
  </>
)

export function SimpleEditor({ content, onChange, editorRef, onFocus, onBlur, onPasteDetected, editable = true }) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState("main")
  const toolbarRef = useRef(null)
  const onPasteDetectedRef = useRef(onPasteDetected)

  useEffect(() => {
    onPasteDetectedRef.current = onPasteDetected
  }, [onPasteDetected])

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handlePaste: (view, event) => {
        const pastedText = event.clipboardData?.getData('text/plain') || ''
        if (pastedText && onPasteDetectedRef.current) {
          onPasteDetectedRef.current(pastedText)
        }
        return false // 不阻止貼上
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        code: false,
        codeBlock: false,
        blockquote: false, // Disabled as requested
        link: false,
        dropcursor: false,
        gapcursor: false,
      }),
      HorizontalRule,
      TextAlign.configure({ 
        types: ["heading", "paragraph"],
        defaultAlignment: 'left'
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Selection,
      TextStyle,
      Color,
      FontSize,
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML())
    },
    onFocus: ({ editor: e, event }) => {
      onFocus?.({ editor: e, event })
    },
    onBlur: ({ editor: e, event }) => {
      onBlur?.({ editor: e, event })
    },
  })

  useEffect(() => {
    if (editor && editorRef) {
      editorRef.current = editor
    }
  }, [editor, editorRef])

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
       editor.commands.setContent(content)
    }
  }, [content, editor])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {editable && (
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}>
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                isMobile={isMobile} />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : null}
                onBack={() => setMobileView("main")} />
            )}
          </Toolbar>
        )}

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
      </EditorContext.Provider>
    </div>
  );
}
