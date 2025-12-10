import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from google import genai
from google.genai import types

from .models import ChatMessage
from .serializers import ChatMessageSerializer, ChatHistorySerializer


# 初始化 Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)


@api_view(['POST'])
def chat(request):
    """
    處理聊天訊息並返回 Gemini 的回應
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
        
        # 存儲用戶訊息
        user_msg = ChatMessage.objects.create(
            map_id=map_id,
            role='user',
            content=message
        )
        
        # 獲取對話歷史（依 map_id 篩選）
        chat_history = ChatMessage.objects.filter(map_id=map_id).order_by('created_at')

        # 轉換聊天歷史格式
        contents = []
        for msg in chat_history:
            contents.append(
                types.Content(
                    role='user' if msg.role == 'user' else 'model',
                    parts=[types.Part.from_text(text=msg.content)]
                )
            )
        
        # 加入當前使用者訊息
        contents.append(
            types.Content(
                role='user',
                parts=[types.Part.from_text(text=message)]
            )
        )

        # 設定生成配置，啟用進階思考
        # generate_content_config = types.GenerateContentConfig(
        #     thinking_config=types.ThinkingConfig(
        #         thinking_level='HIGH'
        #     )
        # )

        # 生成回應
        response = gemini_client.models.generate_content(
            # model='gemini-3-pro-preview',
            model='gemini-2.0-flash-exp',
            contents=contents,
            # config=generate_content_config
        )
        
        # 存儲助手回應
        assistant_msg = ChatMessage.objects.create(
            map_id=map_id,
            role='assistant',
            content=response.text
            # content='先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了'
        )

        return Response({
            'success': True,
            'message': response.text
            # 'message': '先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了先模擬回應，不然要沒錢了'
        })

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