import { useEffect, useState } from 'react';

/**
 * Chat 狀態管理 hook
 * 管理 chat 開關狀態並與 localStorage 同步
 *
 * @returns {Object} { isChatOpen, setIsChatOpen }
 */
export const useChatState = () => {
    const [isChatOpen, setIsChatOpen] = useState(() => {
        const saved = localStorage.getItem('chatIsOpen');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('chatIsOpen', isChatOpen);
    }, [isChatOpen]);

    return { isChatOpen, setIsChatOpen };
};
