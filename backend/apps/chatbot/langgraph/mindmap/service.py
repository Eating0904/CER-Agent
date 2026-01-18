import json
from typing import Dict

from langfuse import Langfuse, propagate_attributes
from langfuse.langchain import CallbackHandler

from apps.common.utils.map_data_utils import simplify_map_data
from apps.map.models import Map
from config.settings import DATABASE_URL

from .graph import ConversationGraph


class LangGraphService:
    def __init__(self):
        self.conversation_graph = ConversationGraph(DATABASE_URL)
        self.langfuse = Langfuse()

    def process_user_message(self, user_input: str, map_id: int, user_id: str) -> Dict:
        try:
            # 1. 從 Map 取得相關資料
            try:
                map_instance = Map.objects.select_related('template').get(id=map_id)
            except Map.DoesNotExist:
                raise ValueError(f'Map with id {map_id} does not exist')

            mind_map_data = {'nodes': map_instance.nodes, 'edges': map_instance.edges}

            # 2. 簡化心智圖資料
            simplified_map_data = simplify_map_data(mind_map_data)

            # 3. 取得文章內容
            article_content = ''
            if map_instance.template:
                article_content = map_instance.template.article_content

            # 4. 設定 thread_id 和 session_id
            thread_id = f'mindmap-{map_id}'
            session_id = thread_id

            # 5. 使用 Langfuse Context Manager 建立 Trace/Span 並設定 Session ID 和 User ID
            with self.langfuse.start_as_current_observation(
                name='mindmap_interaction',
                as_type='span',
            ) as trace_span:
                # 設定 Trace 層級屬性 (Session ID 和 User ID) 並向下傳遞
                with propagate_attributes(session_id=session_id, user_id=user_id):
                    # 更新 Trace Input
                    trace_span.update_trace(input=user_input)

                    # 初始化 CallbackHandler (會自動繼承當前 Context)
                    langfuse_handler = CallbackHandler()

                    # 6. 調用 graph (使用 map_id 作為 thread_id)
                    result = self.conversation_graph.process_message(
                        user_input=user_input,
                        mind_map_data=simplified_map_data,
                        article_content=article_content,
                        thread_id=thread_id,
                        callbacks=[langfuse_handler],
                    )

                    # print('LangGraph Result:', result)

                    # 7. 從 state['messages'] 取得最後回應
                    if result.get('messages'):
                        last_message = result['messages'][-1]
                        response_content = last_message.content
                    else:
                        response_content = '系統無法產生回應'

                    # 更新 Trace Output
                    trace_metadata = {
                        'classifier_next_action': result.get('classification', {}).get(
                            'next_action', 'unknown'
                        ),
                        'classifier_reasoning': result.get('classification', {}).get(
                            'reasoning', 'unknown'
                        ),
                    }

                    agent_metadata = result.get('agent_metadata', {})
                    if agent_metadata:
                        trace_metadata.update(agent_metadata)

                    trace_span.update_trace(
                        output=response_content,
                        metadata=trace_metadata,
                    )

            # 8. 回傳結果
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
                    'user_actionable': error_info['user_actionable'],
                },
            }

    def get_conversation_history(self, map_id: int) -> Dict:
        """
        從 LangGraph checkpointer 讀取對話歷史

        Args:
            map_id: 地圖 ID（作為 thread_id）

        Returns:
            dict: 包含成功狀態和訊息陣列的字典
        """
        try:
            thread_id = f'mindmap-{map_id}'
            config = {'configurable': {'thread_id': thread_id}}

            state_snapshot = self.conversation_graph.graph.get_state(config)

            if not state_snapshot or not state_snapshot.values:
                return {'success': True, 'messages': []}

            state_messages = state_snapshot.values.get('messages', [])

            messages = []
            for idx, msg in enumerate(state_messages):
                # msg 已經是反序列化後的 BaseMessage 物件
                if hasattr(msg, 'type'):
                    role = 'user' if msg.type == 'human' else 'assistant'

                    message_data = {'id': idx, 'role': role, 'content': msg.content}

                    # 對於 user 訊息，解析並提取 query
                    if isinstance(msg.content, str) and role == 'user':
                        try:
                            parsed_content = json.loads(msg.content)
                            if isinstance(parsed_content, dict) and 'query' in parsed_content:
                                message_data['content'] = parsed_content['query']
                        except (json.JSONDecodeError, ValueError):
                            pass

                    # 對於 assistant 訊息，從 additional_kwargs 取得 message_type
                    if role == 'assistant' and hasattr(msg, 'additional_kwargs'):
                        message_data['message_type'] = msg.additional_kwargs.get(
                            'message_type', None
                        )

                    messages.append(message_data)

            return {'success': True, 'messages': messages}

        except Exception as e:
            error_info = self._classify_error(e)

            return {
                'success': False,
                'messages': [],
                'error': {
                    'type': error_info['error_type'],
                    'detail': str(e),
                    'user_actionable': error_info['user_actionable'],
                },
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
                'user_actionable': False,
            }

        # 資料庫相關錯誤
        if 'DoesNotExist' in error_message or 'database' in error_message.lower():
            return {
                'error_type': 'DATABASE_ERROR',
                'user_message': '找不到相關資料，請確認地圖是否存在',
                'user_actionable': True,
            }

        # API 限制或網路錯誤
        if 'rate limit' in error_message.lower() or 'quota' in error_message.lower():
            return {
                'error_type': 'RATE_LIMIT_ERROR',
                'user_message': '系統使用量過高，請稍後再試',
                'user_actionable': True,
            }

        if 'timeout' in error_message.lower() or 'network' in error_message.lower():
            return {
                'error_type': 'NETWORK_ERROR',
                'user_message': '網路連線有問題，請稍後再試',
                'user_actionable': True,
            }

        # JSON 解析錯誤（系統問題）
        if 'JSON' in error_message or 'json' in error_message:
            return {
                'error_type': 'JSON_PARSE_ERROR',
                'user_message': '系統處理回應時發生錯誤，請稍後再試',
                'user_actionable': False,
            }

        # 預設：未知錯誤
        return {
            'error_type': 'UNKNOWN_ERROR',
            'user_message': '系統發生錯誤，請稍後再試或聯繫管理員',
            'user_actionable': False,
        }


_langgraph_service = None


def get_langgraph_service() -> LangGraphService:
    """取得 LangGraph 服務實例（單例模式）"""
    global _langgraph_service
    if _langgraph_service is None:
        _langgraph_service = LangGraphService()
    return _langgraph_service
