import json
import logging
from typing import Dict

from langfuse import Langfuse, propagate_attributes
from langfuse.langchain import CallbackHandler

from apps.common.utils.map_data_utils import simplify_map_data
from apps.map.models import Map
from config.settings import DATABASE_URL

from .graph import ConversationGraph

logger = logging.getLogger(__name__)


class LangGraphService:
    def __init__(self):
        self.conversation_graph = ConversationGraph(DATABASE_URL)
        self.langfuse = Langfuse()

    def process_user_message(self, user_input: str, map_id: int, user_id: str) -> Dict:
        logger.info(f'Processing mindmap message: map_id={map_id}, user_id={user_id}')
        logger.debug(f'User input: {user_input[:100]}...')

        try:
            # 1. 從 Map 取得相關資料
            try:
                map_instance = Map.objects.select_related('template').get(id=map_id)
                logger.debug(
                    f'Map loaded: nodes={len(map_instance.nodes)}, edges={len(map_instance.edges)}, template_id={map_instance.template_id}'
                )
            except Map.DoesNotExist:
                logger.error(f'Map not found in process_user_message: map_id={map_id}')
                raise ValueError(f'Map with id {map_id} does not exist')

            mind_map_data = {'nodes': map_instance.nodes, 'edges': map_instance.edges}

            # 2. 簡化心智圖資料
            simplified_map_data = simplify_map_data(mind_map_data)
            logger.debug(f'Simplified map data: {len(str(simplified_map_data))} chars')

            # 3. 取得文章內容
            article_content = ''
            if map_instance.template:
                article_content = map_instance.template.article_content
                logger.debug(f'Article content: {article_content[:100]}...')

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
            logger.info(f'Mindmap message processed successfully: map_id={map_id}')
            return {
                'success': True,
                'message': response_content,
                'classification': result.get('classification', {}),
            }

        except Exception as e:
            logger.exception(f'Mindmap processing failed: map_id={map_id}')
            return {
                'success': False,
                'message': '抱歉，系統遇到了一些問題，請稍後再試。',
            }

    def get_conversation_history(self, map_id: int) -> Dict:
        """
        從 LangGraph checkpointer 讀取對話歷史

        Args:
            map_id: 地圖 ID（作為 thread_id）

        Returns:
            dict: 包含成功狀態和訊息陣列的字典
        """
        logger.info(f'Getting conversation history: map_id={map_id}')

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
                        except (json.JSONDecodeError, ValueError) as e:
                            logger.warning(
                                f'Message content is not JSON, using raw content: {str(e)[:100]}'
                            )

                    # 對於 assistant 訊息，從 additional_kwargs 取得 message_type
                    if role == 'assistant' and hasattr(msg, 'additional_kwargs'):
                        message_data['message_type'] = msg.additional_kwargs.get(
                            'message_type', None
                        )

                    messages.append(message_data)

            logger.debug(f'Retrieved {len(messages)} messages')
            logger.info(f'Conversation history retrieved: map_id={map_id}, count={len(messages)}')
            return {'success': True, 'messages': messages}

        except Exception as e:
            logger.exception(f'Failed to get conversation history: map_id={map_id}')
            return {
                'success': False,
                'messages': [],
            }


_langgraph_service = None


def get_langgraph_service() -> LangGraphService:
    """取得 LangGraph 服務實例（單例模式）"""
    global _langgraph_service
    if _langgraph_service is None:
        _langgraph_service = LangGraphService()
    return _langgraph_service
