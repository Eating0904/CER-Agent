import { useCallback, useState } from 'react';

import { App } from 'antd';

/**
 * useEssayValidation
 *
 * 驗證 Essay 內容是否只包含拉丁文字系統的字元。
 * 允許英文、數字、標點符號（包括 Unicode 標點如 bullet points、em dash 等），
 * 但排除中文、日韓文、阿拉伯文等非拉丁文字系統。
 *
 * @returns {Object} { isEssayValid, handleEssayChange }
 */
export const useEssayValidation = () => {
    const { message } = App.useApp();
    const [isEssayValid, setIsEssayValid] = useState(true);

    /**
     * 檢查文本是否包含非拉丁文字系統的字元
     * @param {string} text - 要檢查的文本
     * @returns {boolean} 如果包含非拉丁文字則返回 true
     */
    const containsNonLatinScript = useCallback((text) => {
        // CJK 字元（中文、日文、韓文）
        // - \u4E00-\u9FFF: CJK 統一表意文字（中文常用字）
        // - \u3400-\u4DBF: CJK 擴展 A
        // - \u3040-\u309F: 日文平假名
        // - \u30A0-\u30FF: 日文片假名
        // - \uAC00-\uD7AF: 韓文音節
        const cjkRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;

        // 其他非拉丁文字系統
        // - \u0600-\u06FF: 阿拉伯文
        // - \u0590-\u05FF: 希伯來文
        // - \u0400-\u04FF: 西里爾字母（俄文等）
        // - \u0E00-\u0E7F: 泰文
        // - \u0900-\u097F: 天城文（印地文等）
        // eslint-disable-next-line no-misleading-character-class
        const otherScriptsRegex = /[\u0600-\u06FF\u0590-\u05FF\u0400-\u04FF\u0E00-\u0E7F\u0900-\u097F]/;

        return cjkRegex.test(text) || otherScriptsRegex.test(text);
    }, []);

    const handleEssayChange = useCallback((newContent, setContent) => {
        // 更新內容
        setContent(newContent);

        // 驗證內容: 不允許非拉丁文字系統
        const isValid = !containsNonLatinScript(newContent);

        if (!isValid) {
            setIsEssayValid(false);
            message.warning({
                content: 'The essay content should be in English',
                key: 'essay-validation',
            });
        }
        else {
            setIsEssayValid(true);
            // 當驗證通過時，可以選擇關閉之前的警告，或者讓它自然消失。
            // 為了不干擾使用者，讓它自然消失或被新的取代即可，
            // 若要強制關閉可使用 message.destroy('essay-validation')，但通常沒必要。
        }
    }, [message, containsNonLatinScript]);

    return {
        isEssayValid,
        handleEssayChange,
    };
};
