"""
Essay LangGraph Service
參考 mindmap service，主要差異：
- thread_id: essay-{map_id}
- 獲取 Essay content
- essay_content 塞進 HumanMessage context
"""

import json
import logging
from typing import Dict

from langfuse import Langfuse, propagate_attributes
from langfuse.langchain import CallbackHandler

from apps.common.utils.map_data_utils import simplify_map_data
from apps.map.models import Map
from config.settings import DATABASE_URL

from .graph import EssayConversationGraph

logger = logging.getLogger(__name__)


class EssayLangGraphService:
    def __init__(self):
        self.conversation_graph = EssayConversationGraph(DATABASE_URL)
        self.langfuse = Langfuse()

    def process_user_message(
        self, user_input: str, map_id: int, user_id: str, essay_plain_text: str = ''
    ) -> Dict:
        logger.info(f'Processing essay message: map_id={map_id}, user_id={user_id}')
        logger.debug(f'User input: {user_input[:100]}...')

        try:
            # 1. 獲取 Map 和 Essay
            try:
                map_instance = Map.objects.select_related('template').get(id=map_id)
                logger.debug(
                    f'Map loaded: nodes={len(map_instance.nodes)}, edges={len(map_instance.edges)}, template_id={map_instance.template_id}'
                )
            except Map.DoesNotExist:
                logger.error(f'Map not found in process_user_message: map_id={map_id}')
                raise ValueError(f'Map with id {map_id} does not exist')

            # 2. 簡化 Mind Map
            mind_map_data = {'nodes': map_instance.nodes, 'edges': map_instance.edges}
            simplified_map_data = simplify_map_data(mind_map_data)

            # 3. 獲取 Essay 純文字內容（來自前端）
            essay_content = essay_plain_text
            logger.debug(f'Essay content: {essay_content[:100]}...')

            # 4. 獲取文章模板
            article_content = ''
            if map_instance.template:
                article_content = map_instance.template.article_content
                logger.debug(f'Article content: {article_content[:100]}...')

            # 5. 設定 thread_id
            thread_id = f'essay-{map_id}'
            session_id = thread_id

            # 6. Langfuse tracing
            with self.langfuse.start_as_current_observation(
                name='essay_interaction',
                as_type='span',
            ) as trace_span:
                with propagate_attributes(session_id=session_id, user_id=user_id):
                    trace_span.update_trace(input=user_input)

                    langfuse_handler = CallbackHandler()

                    # 7. 調用 graph
                    result = self.conversation_graph.process_message(
                        user_input=user_input,
                        mind_map_data=simplified_map_data,
                        essay_content=essay_content,
                        article_content=article_content,
                        thread_id=thread_id,
                        callbacks=[langfuse_handler],
                    )

                    # 8. 取得回應
                    if result.get('messages'):
                        last_message = result['messages'][-1]
                        response_content = last_message.content
                    else:
                        response_content = '系統無法產生回應'

                    # 9. 更新 trace
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

                    # 獲取 trace_id
                    trace_id = trace_span.trace_id

            logger.info(f'Essay message processed successfully: map_id={map_id}')
            return {
                'success': True,
                'message': response_content,
                'classification': result.get('classification', {}),
                'trace_id': trace_id,
            }

        except Exception as e:
            logger.exception(f'Essay processing failed: map_id={map_id}')
            return {
                'success': False,
                'message': 'Sorry, an error occurred while processing your request.',
            }

    def get_conversation_history(self, map_id: int) -> Dict:
        """獲取對話歷史"""
        logger.info(f'Getting essay conversation history: map_id={map_id}')

        try:
            thread_id = f'essay-{map_id}'
            config = {'configurable': {'thread_id': thread_id}}

            state_snapshot = self.conversation_graph.graph.get_state(config)

            if not state_snapshot or not state_snapshot.values:
                return {'success': True, 'messages': []}

            state_messages = state_snapshot.values.get('messages', [])

            messages = []
            for idx, msg in enumerate(state_messages):
                if hasattr(msg, 'type'):
                    role = 'user' if msg.type == 'human' else 'assistant'

                    message_data = {'id': idx, 'role': role, 'content': msg.content}

                    # 解析 user 訊息
                    if isinstance(msg.content, str) and role == 'user':
                        try:
                            parsed_content = json.loads(msg.content)
                            if isinstance(parsed_content, dict) and 'query' in parsed_content:
                                message_data['content'] = parsed_content['query']
                        except (json.JSONDecodeError, ValueError) as e:
                            logger.warning(
                                f'Message content is not JSON, using raw content: {str(e)[:100]}'
                            )

                    # 取得 message_type
                    if role == 'assistant' and hasattr(msg, 'additional_kwargs'):
                        message_data['message_type'] = msg.additional_kwargs.get(
                            'message_type', None
                        )

                    messages.append(message_data)

            logger.debug(f'Retrieved {len(messages)} messages')
            logger.info(
                f'Essay conversation history retrieved: map_id={map_id}, count={len(messages)}'
            )
            return {'success': True, 'messages': messages}

        except Exception as e:
            logger.exception(f'Failed to get essay conversation history: map_id={map_id}')
            return {
                'success': False,
                'messages': [],
            }


_essay_langgraph_service = None


def get_essay_langgraph_service() -> EssayLangGraphService:
    """取得 Essay LangGraph 服務實例（單例模式）"""
    global _essay_langgraph_service
    if _essay_langgraph_service is None:
        _essay_langgraph_service = EssayLangGraphService()
    return _essay_langgraph_service
