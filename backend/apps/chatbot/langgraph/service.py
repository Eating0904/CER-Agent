import os
from typing import Dict
from .graph import ConversationGraph


class LangGraphService:
    
    def __init__(self):
        # 取得 DATABASE_URL
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            raise ValueError(
                "DATABASE_URL 環境變數未設定。\n"
                "請在 .env 檔案中設定 DATABASE_URL\n"
                "範例: DATABASE_URL=postgresql://postgres:password@localhost:5432/langgraph"
            )
        
        self.conversation_graph = ConversationGraph(db_url)
    
    def process_user_message(self, user_input: str, map_id: int) -> Dict:
        try:
            # 1. 準備假的心智圖資料 (之後會替換成真實資料)
            mind_map_data = {
                "nodes": [],
                "edges": []
            }
            
            # 2. 調用 graph (使用 map_id 作為 thread_id)
            result = self.conversation_graph.process_message(
                user_input=user_input,
                mind_map_data=mind_map_data,
                thread_id=str(map_id)
            )
            
            # 3. 從 state['messages'] 取得最後回應
            if result.get('messages'):
                last_message = result['messages'][-1]
                response_content = last_message.content
            else:
                response_content = "系統無法產生回應"
            
            # 4. 回傳結果
            return {
                'success': True,
                'message': response_content,
                'classification': result.get('classification', {}),
            }
            
        except Exception as e:
            error_info = self._classify_error(e)
            
            return {
                'success': False,
                'message': error_info['user_message'],
                'error': {
                    'type': error_info['error_type'],
                    'detail': str(e),
                    'user_actionable': error_info['user_actionable']
                }
            }
    
    def _classify_error(self, exception: Exception) -> Dict:
        """
        分類錯誤並返回適當的錯誤資訊
        
        Args:
            exception: 捕獲的異常
            
        Returns:
            dict: 包含錯誤類型、使用者訊息和是否可操作的字典
        """
        error_message = str(exception)
        
        # API Key 相關錯誤（使用者可能可以解決）
        if 'API key' in error_message or 'GOOGLE_API_KEY' in error_message:
            return {
                'error_type': 'API_KEY_ERROR',
                'user_message': '系統配置有誤，請聯繫管理員',
                'user_actionable': False
            }
        
        # 資料庫相關錯誤
        if 'DoesNotExist' in error_message or 'database' in error_message.lower():
            return {
                'error_type': 'DATABASE_ERROR',
                'user_message': '找不到相關資料，請確認地圖是否存在',
                'user_actionable': True
            }
        
        # API 限制或網路錯誤
        if 'rate limit' in error_message.lower() or 'quota' in error_message.lower():
            return {
                'error_type': 'RATE_LIMIT_ERROR',
                'user_message': '系統使用量過高，請稍後再試',
                'user_actionable': True
            }
        
        if 'timeout' in error_message.lower() or 'network' in error_message.lower():
            return {
                'error_type': 'NETWORK_ERROR',
                'user_message': '網路連線有問題，請稍後再試',
                'user_actionable': True
            }
        
        # JSON 解析錯誤（系統問題）
        if 'JSON' in error_message or 'json' in error_message:
            return {
                'error_type': 'JSON_PARSE_ERROR',
                'user_message': '系統處理回應時發生錯誤，請稍後再試',
                'user_actionable': False
            }
        
        # 預設：未知錯誤
        return {
            'error_type': 'UNKNOWN_ERROR',
            'user_message': '系統發生錯誤，請稍後再試或聯繫管理員',
            'user_actionable': False
        }


_langgraph_service = None

def get_langgraph_service() -> LangGraphService:
    """取得 LangGraph 服務實例（單例模式）"""
    global _langgraph_service
    if _langgraph_service is None:
        _langgraph_service = LangGraphService()
    return _langgraph_service
