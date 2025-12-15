import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from google import genai
from google.genai import types

from .models import ChatMessage
from .serializers import ChatMessageSerializer, ChatHistorySerializer
from .scoring import generate_scoring_prompt  # 保留供未來使用
from .langgraph import get_langgraph_service
from apps.map.models import Map


# 初始化 Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)


@api_view(['POST'])
def chat(request):
    """
    處理聊天訊息並返回 Gemini 的回應
    預設使用 LangGraph 分類流程
    """
    serializer = ChatMessageSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {'success': False, 'error': 'Invalid request data'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        message = serializer.validated_data['message']
        map_id = serializer.validated_data['map_id']
        
        # 檢查 Gemini Client
        if not gemini_client:
            return Response(
                {'success': False, 'error': 'Gemini API key is not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # ============================================
        # LangGraph 分類模式（預設）
        # ============================================
        
        # 使用 LangGraph 服務處理訊息
        langgraph_service = get_langgraph_service()
        result = langgraph_service.process_user_message(
            user_input=message,
            map_id=map_id
        )
        
        # 檢查處理結果
        if not result['success']:
            # 返回錯誤資訊（包含詳細錯誤給開發者，簡化訊息給使用者）
            return Response({
                'success': False,
                'message': result['message'],  # 使用者友善訊息
                'error': result.get('error', {})  # 詳細錯誤資訊（開發者用）
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'message': result['message']
        })
        
        # ============================================
        # CER 評分模式（保留供未來使用）
        # 如需啟用，註解上方的 LangGraph 部分，取消註解以下程式碼
        # ============================================
        
        # # 存儲用戶訊息
        # user_msg = ChatMessage.objects.create(
        #     map_id=map_id,
        #     role='user',
        #     content=message
        # )
        # 
        # # 取得 Map 資料
        # try:
        #     map_instance = Map.objects.get(id=map_id)
        # except Map.DoesNotExist:
        #     return Response(
        #         {'success': False, 'error': f'Map with id {map_id} not found'},
        #         status=status.HTTP_404_NOT_FOUND
        #     )
        # 
        # # 準備 Map 資料（透過 template 取得文章資料）
        # map_data = {
        #     'issue_topic': map_instance.template.issue_topic if map_instance.template else '',
        #     'article_content': map_instance.template.article_content if map_instance.template else '',
        #     'nodes': map_instance.nodes,
        #     'edges': map_instance.edges
        # }
        # 
        # # 生成 CER 評分 prompt
        # scoring_prompt = generate_scoring_prompt(map_data)
        # 
        # # 準備對話內容
        # contents = [
        #     types.Content(
        #         role='user',
        #         parts=[types.Part.from_text(text=scoring_prompt)]
        #     )
        # ]
        # 
        # # 設定生成配置，啟用進階思考
        # generate_content_config = types.GenerateContentConfig(
        #     thinking_config=types.ThinkingConfig(
        #         thinking_level='HIGH'
        #     )
        # )
        # 
        # # 生成回應
        # response = gemini_client.models.generate_content(
        #     model='gemini-3-pro-preview',
        #     contents=contents,
        #     config=generate_content_config
        # )
        # 
        # # 存儲助手回應
        # assistant_msg = ChatMessage.objects.create(
        #     map_id=map_id,
        #     role='assistant',
        #     content=response.text
        # )
        # 
        # return Response({
        #     'success': True,
        #     'message': response.text
        # })

    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



@api_view(['GET'])
def get_chat_history(request, map_id):
    """
    獲取指定心智圖的對話紀錄
    """
    messages = ChatMessage.objects.filter(map_id=map_id)
    serializer = ChatHistorySerializer(messages, many=True)
    return Response({
        'success': True,
        'messages': serializer.data
    })


@api_view(['DELETE'])
def clear_chat_history(request):
    """
    清除所有對話紀錄
    """
    ChatMessage.objects.all().delete()
    return Response({
        'success': True,
        'message': 'Chat history cleared'
    })