from functools import wraps

from rest_framework import status
from rest_framework.response import Response

from .models import Map


def require_map_owner(view_func):
    """
    權限檢查 decorator：確保當前使用者擁有指定的 map

    使用方式：
        @api_view(['POST'])
        @require_map_owner
        def my_view(request, map_id=None):
            # 如果執行到這裡，表示 request.user 確實擁有這個 map
            ...

    行為：
        - 從 URL 參數（map_id）或 request.data['map_id'] 中取得 map ID
        - 驗證 Map.objects.filter(id=map_id, user=request.user).exists()
        - 如果 map 不存在或不屬於當前使用者，回傳 404 Not Found
        - 回傳 404 而非 403，避免洩漏 map 是否存在的資訊
    """

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # 1. 嘗試從 URL 參數取得 map_id
        map_id = kwargs.get('map_id')

        # 2. 如果 URL 沒有，從 request.data 取得（適用於 POST）
        if map_id is None and hasattr(request, 'data'):
            map_id = request.data.get('map_id')

        # 3. 如果都沒有，回傳錯誤
        if map_id is None:
            return Response(
                {'success': False, 'error': 'map_id is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 4. 檢查 map 是否存在且屬於當前使用者
        if not Map.objects.filter(id=map_id, user=request.user).exists():
            # 回傳 404 而非 403，避免洩漏資源存在性
            return Response(
                {'success': False, 'error': 'Map not found'}, status=status.HTTP_404_NOT_FOUND
            )

        # 5. 權限檢查通過，執行原本的 view
        return view_func(request, *args, **kwargs)

    return wrapper
