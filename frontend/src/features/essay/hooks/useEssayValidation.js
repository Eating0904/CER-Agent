import { useCallback, useState } from 'react';

import { App } from 'antd';

/**
 * useEssayValidation
 *
 * 驗證 Essay 內容是否只包含 ASCII 字元 (英文、數字、標點符號)。
 *
 * @returns {Object} { isEssayValid, handleEssayChange }
 */
export const useEssayValidation = () => {
    const { message } = App.useApp();
    const [isEssayValid, setIsEssayValid] = useState(true);

    const handleEssayChange = useCallback((newContent, setContent) => {
        // 更新內容
        setContent(newContent);

        // 驗證內容: 只允許 ASCII (0-127)
        // /^[\x00-\x7F]*$/
        // eslint-disable-next-line no-control-regex
        const isValid = /^[\x00-\x7F]*$/.test(newContent);

        if (!isValid) {
            setIsEssayValid(false);
            message.warning({
                content: 'Only English and numbers are allowed',
                key: 'essay-validation',
            });
        }
        else {
            setIsEssayValid(true);
            // 當驗證通過時，可以選擇關閉之前的警告，或者讓它自然消失。
            // 為了不干擾使用者，讓它自然消失或被新的取代即可，
            // 若要強制關閉可使用 message.destroy('essay-validation')，但通常沒必要。
        }
    }, [message]);

    return {
        isEssayValid,
        handleEssayChange,
    };
};
