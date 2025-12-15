import os
from typing import Dict
from .graph import ConversationGraph
from ..models import ChatMessage


class LangGraphService:
    
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY 環境變數未設定")
        
        self.conversation_graph = ConversationGraph(api_key)
    
    def process_user_message(self, user_input: str, map_id: int) -> Dict:
        """
        處理使用者訊息
        
        Args:
            user_input: 使用者輸入的訊息
            map_id: 地圖 ID
            
        Returns:
            dict: 包含回應訊息和相關資訊的字典
        """
        try:
            # 1. 讀取該 map 的對話歷史
            history_messages = ChatMessage.objects.filter(map_id=map_id).order_by('created_at')
            conversation_history = self._format_conversation_history(history_messages)
            
            # 2. 取得 last_active_agent
            last_active_agent, last_agent_message = self._get_last_active_agent(map_id)
            
            # 3. 調用 LangGraph 處理訊息
            result = self.conversation_graph.process_message(
                user_input=user_input,
                conversation_history=conversation_history,
                last_active_agent=last_active_agent,
                last_agent_message=last_agent_message
            )
            
            # 4. 儲存使用者訊息
            ChatMessage.objects.create(
                map_id=map_id,
                role='user',
                content=user_input
            )
            
            # 5. 儲存分類資訊 (classifier)
            ChatMessage.objects.create(
                map_id=map_id,
                role='classifier',
                content=f"分類結果: {result['classification']['next_action']}",
                metadata={
                    'reasoning': result['classification'].get('reasoning', ''),
                    'intent': result['classification']['next_action'],
                    'context_summary': result['classification'].get('context_summary', ''),
                    'routed_to': result['routed_agent']
                }
            )
            
            # 6. 儲存 AI 回應 (根據 routed_agent 決定 role)
            agent_role_mapping = {
                'OPERATOR_SUPPORT': 'operator_support',
                'CER_COGNITIVE_SUPPORT': 'cer_cognitive_support'
            }
            
            response_role = agent_role_mapping.get(
                result['routed_agent'],
                'undefined'
            )
            
            ChatMessage.objects.create(
                map_id=map_id,
                role=response_role,
                content=result['final_response']
            )
            
            return {
                'success': True,
                'message': result['final_response'],
                'classification': result['classification'],
                'routed_agent': result['routed_agent']
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
        if 'API key' in error_message or 'GEMINI_API_KEY' in error_message:
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
    
    def _format_conversation_history(self, messages) -> list:
        """
        格式化對話歷史為 LangGraph 所需的格式
        
        Args:
            messages: QuerySet of ChatMessage
            
        Returns:
            list: 格式化的對話歷史
        """
        formatted = []
        for msg in messages:
            # 只包含 user 和 agent 的訊息，排除 classifier
            if msg.role not in ['classifier']:
                # 將 agent role 統一為 assistant
                role = 'user' if msg.role == 'user' else 'assistant'
                formatted.append({
                    'role': role,
                    'content': msg.content
                })
        return formatted
    
    def _get_last_active_agent(self, map_id: int) -> tuple:
        """
        取得最後一個活躍的 agent
        
        Args:
            map_id: 地圖 ID
            
        Returns:
            tuple: (last_active_agent, last_agent_message)
        """
        # 查詢最後一則 agent 訊息（排除 user 和 classifier）
        last_message = ChatMessage.objects.filter(
            map_id=map_id
        ).exclude(
            role__in=['user', 'classifier']
        ).order_by('-created_at').first()
        
        if last_message:
            # 將 role 轉換為對應的 agent 類型
            role_to_agent_mapping = {
                'operator_support': 'OPERATOR_SUPPORT',
                'cer_cognitive_support': 'CER_COGNITIVE_SUPPORT'
            }
            agent_type = role_to_agent_mapping.get(last_message.role, None)
            return agent_type, last_message.content
        
        return None, ""


_langgraph_service = None

def get_langgraph_service() -> LangGraphService:
    """取得 LangGraph 服務實例（單例模式）"""
    global _langgraph_service
    if _langgraph_service is None:
        _langgraph_service = LangGraphService()
    return _langgraph_service
