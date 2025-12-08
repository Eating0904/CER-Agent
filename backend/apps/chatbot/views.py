import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import google.generativeai as genai

from .serializers import ChatMessageSerializer, ChatResponseSerializer


# 初始化 Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


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

    if not GEMINI_API_KEY:
        return Response(
            {'success': False, 'error': 'Gemini API key is not configured'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        message = serializer.validated_data['message']
        chat_history = serializer.validated_data.get('chat_history', [])

        # 建立 Gemini 模型
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        # 轉換聊天歷史格式
        history = []
        for msg in chat_history:
            history.append({
                'role': msg.get('role'),
                'parts': [{'text': msg.get('content')}]
            })

        # 開始聊天
        chat = model.start_chat(history=history)

        # 發送訊息
        response = chat.send_message(message)

        return Response({
            'success': True,
            'message': response.text
        })

    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
