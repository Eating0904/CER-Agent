/* eslint-disable import/extensions */
import { forwardRef, useCallback, useState } from 'react';

// --- Hooks ---
import { useTiptapEditor } from '@/tiptap-ui/hooks/use-tiptap-editor';
// --- Icons ---
import { ChevronDownIcon } from '@/tiptap-ui/tiptap-icons/chevron-down-icon';
import { Button, ButtonGroup } from '@/tiptap-ui/tiptap-ui-primitive/button';
import { Card, CardBody } from '@/tiptap-ui/tiptap-ui-primitive/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/tiptap-ui/tiptap-ui-primitive/dropdown-menu';

export const FontSizeDropdown = forwardRef((
    {
        editor: providedEditor,
        portal = false,
        onOpenChange,
    },
    ref,
) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = useState(false);

    const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '30px'];

    const handleOpenChange = useCallback((open) => {
        if (!editor) return;
        setIsOpen(open);
        onOpenChange?.(open);
    }, [editor, onOpenChange]);

    const setFontSize = useCallback((size) => {
        if (editor) {
            editor.chain().focus().setFontSize(size).run();
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    const currentFontSize = editor.getAttributes('textStyle').fontSize;

    return (
        <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    data-style="ghost"
                    role="button"
                    tabIndex={-1}
                    aria-label="Font Size"
                    tooltip="Font Size"
                    ref={ref}
                >
                    <span style={{ minWidth: '2rem', fontSize: '0.875rem' }}>
                        {currentFontSize || '12px'}
                    </span>
                    <ChevronDownIcon className="tiptap-button-dropdown-small" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" portal={portal}>
                <Card>
                    <CardBody>
                        <ButtonGroup orientation="vertical">
                            {fontSizes.map((size) => (
                                <DropdownMenuItem key={size} asChild>
                                    <Button
                                        onClick={() => setFontSize(size)}
                                        data-style={editor.isActive('textStyle', { fontSize: size }) ? 'tint' : 'ghost'}
                                    >
                                        {size}
                                    </Button>
                                </DropdownMenuItem>
                            ))}
                        </ButtonGroup>
                    </CardBody>
                </Card>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

FontSizeDropdown.displayName = 'FontSizeDropdown';
