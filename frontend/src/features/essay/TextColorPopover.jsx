/* eslint-disable import/extensions */
import { forwardRef, useState } from 'react';

// --- Hooks ---
import { useTiptapEditor } from '@/tiptap-ui/hooks/use-tiptap-editor';
// --- Icons ---
import { BanIcon } from '@/tiptap-ui/tiptap-icons/ban-icon';
import { Button, ButtonGroup } from '@/tiptap-ui/tiptap-ui-primitive/button';
import {
    Card,
    CardBody,
    CardItemGroup,
} from '@/tiptap-ui/tiptap-ui-primitive/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/tiptap-ui/tiptap-ui-primitive/popover';
import { Separator } from '@/tiptap-ui/tiptap-ui-primitive/separator';

const TextColorIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 20h16" />
        <path d="m6 16 6-14 6 14" />
        <path d="M8 12h8" />
    </svg>
);

export const TextColorPopover = forwardRef((
    {
        editor: providedEditor,
    },
    ref,
) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = useState(false);

    if (!editor) return null;

    const colors = [
        { label: 'Black', value: '#000000' },
        { label: 'Dark Gray', value: '#4b5563' },
        { label: 'Gray', value: '#9ca3af' },
        { label: 'Red', value: '#ef4444' },
        { label: 'Blue', value: '#3b82f6' },
        { label: 'Green', value: '#22c55e' },
        { label: 'Yellow', value: '#eab308' },
        { label: 'Purple', value: '#a855f7' },
    ];

    const currentColor = editor.getAttributes('textStyle').color;

    const handleSetColor = (color) => {
        editor.chain().focus().setColor(color).run();
        setIsOpen(false);
    };

    const handleUnsetColor = () => {
        editor.chain().focus().unsetColor().run();
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    data-style="ghost"
                    role="button"
                    tabIndex={-1}
                    aria-label="Text Color"
                    tooltip="Text Color"
                    ref={ref}
                    style={{ position: 'relative' }}
                >
                    <TextColorIcon className="tiptap-button-icon" />
                    <span
                        style={{
                            backgroundColor: currentColor || 'transparent',
                            height: '3px',
                            width: '20px',
                            position: 'absolute',
                            bottom: '3px',
                            left: '0',
                            right: '0',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            opacity: currentColor ? 1 : 0,
                        }}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent aria-label="Text colors">
                <Card>
                    <CardBody>
                        <CardItemGroup orientation="horizontal">
                            <ButtonGroup orientation="horizontal" style={{ flexWrap: 'wrap', gap: '4px', maxWidth: '160px' }}>
                                {colors.map((color) => (
                                    <Button
                                        key={color.value}
                                        onClick={() => handleSetColor(color.value)}
                                        tooltip={color.label}
                                        data-style="ghost"
                                        data-active-state={currentColor === color.value ? 'on' : 'off'}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            padding: 0,
                                            minWidth: 'unset',
                                            backgroundColor: color.value,
                                            border: currentColor === color.value ? '2px solid white' : '1px solid #ddd',
                                            ring: currentColor === color.value ? '2px solid black' : 'none',
                                        }}
                                    />
                                ))}
                            </ButtonGroup>
                            <Separator />
                            <ButtonGroup orientation="horizontal">
                                <Button
                                    onClick={handleUnsetColor}
                                    tooltip="Remove Color"
                                    data-style="ghost"
                                >
                                    <BanIcon className="tiptap-button-icon" />
                                </Button>
                            </ButtonGroup>
                        </CardItemGroup>
                    </CardBody>
                </Card>
            </PopoverContent>
        </Popover>
    );
});

TextColorPopover.displayName = 'TextColorPopover';
