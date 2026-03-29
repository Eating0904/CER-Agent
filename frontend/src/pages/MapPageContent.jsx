import { useEffect, useRef, useState } from 'react';

import { Space } from 'antd';
import Split from 'react-split';

import { Chat } from '../features/chat/Chat';
import { FloatingChatButton } from '../features/chat/FloatingChatButton';
import { BaseMap } from '../features/map/BaseMap';
import { ToolBlock } from '../features/map/components/toolbar';
import { MapProvider } from '../features/map/MapProvider';
import { MapSaveButton } from '../features/map/MapSaveButton';
import { ScoreButton } from '../features/map/ScoreButton';
import { OperateAlertList } from '../features/OperateAlertList/OperateAlertList';

import { ArticlePageContent } from './ArticlePageContent';

/**
 * MapPageContent 組件
 * 負責 MapPage 的主要 UI 渲染，包含地圖、工具列、alerts、chat 等所有視覺元素
 *
 * @param {Object} props
 * @param {string} props.articleContent - 左側文章內容
 * @param {Object} props.mapContext - 地圖上下文（包含 nodes 和 edges）
 * @param {Array} props.alerts - Alert 列表
 * @param {Function} props.handleAskClick - 處理 Ask 按鈕點擊
 * @param {Function} props.handleSendMessage - 處理訊息發送
 * @param {Function} props.setIsChatOpen - 設置 chat 開關狀態
 * @param {boolean} props.isChatOpen - chat 是否開啟
 * @param {Object} props.feedbackData - feedback 資料
 * @param {Function} props.handleCloseFeedback - 關閉 feedback
 * @param {boolean} props.isSending - 訊息是否發送中
 */
export const MapPageContent = ({
    articleContent = '',
    mapContext,
    alerts,
    handleAskClick,
    handleSendMessage,
    setIsChatOpen,
    isChatOpen,
    feedbackData,
    handleCloseFeedback,
    isSending,
    isReadOnly = false,
    scoringRemaining,
}) => {
    const mapPanelRef = useRef(null);
    // 預設值 200px，ResizeObserver 掛載後會立即更新
    const [alertWidth, setAlertWidth] = useState(200);

    // 從 localStorage 讀取上次的分割比例，預設 [20, 80]
    const SPLIT_KEY = 'mapPageSplitSizes';
    const savedSizes = JSON.parse(localStorage.getItem(SPLIT_KEY)) || [20, 80];

    // 監聽右側面板寬度，動態計算 OperateAlertList 寬度
    // 規則：20%，最小 150px，最大 230px
    useEffect(() => {
        const el = mapPanelRef.current;
        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const panelWidth = entry.contentRect.width;
                const computed = Math.min(230, Math.max(150, Math.round(panelWidth * 0.2)));
                setAlertWidth(computed);
            });
        });

        if (el) {
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Split
                sizes={savedSizes}
                minSize={[0, 200]}
                gutterSize={8}
                style={{ display: 'flex', height: '100%', width: '100%' }}
                onDragEnd={(sizes) => localStorage.setItem(SPLIT_KEY, JSON.stringify(sizes))}
            >
                {/* 左側面板 - Article */}
                <div style={{ height: '100%', overflow: 'hidden' }}>
                    <ArticlePageContent articleContent={articleContent} />
                </div>

                {/* 右側面板 - 心智圖 */}
                <div ref={mapPanelRef} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <MapProvider value={mapContext}>
                        {!isReadOnly && <ToolBlock />}
                        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
                            {handleAskClick && !isReadOnly && (
                                <div
                                    style={{
                                        width: alertWidth,
                                        flexShrink: 0,
                                        height: '100%',
                                        overflowY: 'auto',
                                        backgroundColor: '#F2F2F2',
                                        borderRight: '1px solid #ddd',
                                    }}
                                >
                                    <OperateAlertList alerts={alerts} onAskClick={handleAskClick} />
                                </div>
                            )}
                            <div style={{ flex: 1, height: '100%', position: 'relative' }}>
                                <BaseMap readOnly={isReadOnly} />
                                {!isReadOnly && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '16px',
                                            right: '16px',
                                            zIndex: 10,
                                        }}
                                    >
                                        <Space>
                                            <MapSaveButton />
                                            <ScoreButton
                                                onSendMessage={handleSendMessage}
                                                setIsChatOpen={setIsChatOpen}
                                                isSending={isSending}
                                                scoringRemaining={scoringRemaining}
                                            />
                                        </Space>
                                    </div>
                                )}
                            </div>
                        </div>
                    </MapProvider>
                </div>
            </Split>
            <Chat
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                feedbackData={feedbackData}
                onCloseFeedback={handleCloseFeedback}
                onSendMessage={handleSendMessage}
                isSending={isSending}
                isReadOnly={isReadOnly}
            />
            <FloatingChatButton
                isChatOpen={isChatOpen}
                onClick={() => setIsChatOpen(true)}
            />
        </>
    );
};
