import os
from google import genai
from typing import Optional


DEFAULT_MODEL_NAME = "gemini-2.5-pro"


def get_gemini_api_key() -> str:
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY 環境變數未設定。\n"
            "請在 .env 檔案中設定 GEMINI_API_KEY=your_api_key"
        )
    
    return api_key


def create_gemini_client(api_key: Optional[str] = None) -> genai.Client:
    if api_key is None:
        api_key = get_gemini_api_key()
    
    try:
        client = genai.Client(api_key=api_key)
        return client
    except Exception as e:
        raise ValueError(
            f"無法創建 Gemini Client: {str(e)}\n"
            "請確認 API Key 是否正確"
        ) from e


_global_client: Optional[genai.Client] = None


def get_gemini_client() -> genai.Client:
    """取得全域 Gemini Client 實例（單例模式）"""
    global _global_client
    
    if _global_client is None:
        _global_client = create_gemini_client()
    
    return _global_client
