import os
import json
import re
from pathlib import Path
from google import genai
from google.genai import types


class IntentClassifier:
    """意圖分類器,使用主 LLM 判斷學生的意圖"""
    
    def __init__(self, api_key: str):
        """
        初始化分類器
        
        Args:
            api_key: Google Gemini API Key
        """
        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-2.5-pro"
        
        # 讀取分類 prompt
        prompt_path = Path(__file__).parent / "prompts" / "classifier_prompt.md"
        with open(prompt_path, 'r', encoding='utf-8') as f:
            self.system_prompt = f.read()
    
    def _extract_json(self, text: str) -> str:
        """從文本中提取 JSON，使用更健壯的方法"""
        import re
        
        # 方法 1: 嘗試使用正則表達式匹配 JSON 物件
        # 匹配 { ... } 並正確處理巢狀結構
        json_pattern = r'\{(?:[^{}]|(?:\{[^{}]*\}))*\}'
        matches = re.findall(json_pattern, text, re.DOTALL)
        
        if matches:
            # 如果有多個匹配，取最長的（通常是完整的 JSON）
            json_str = max(matches, key=len)
            return json_str
        
        # 方法 2: 回退到計數大括號的方法（處理深度巢狀）
        start = text.find('{')
        if start == -1:
            return text.strip()
        
        bracket_count = 0
        for i in range(start, len(text)):
            if text[i] == '{':
                bracket_count += 1
            elif text[i] == '}':
                bracket_count -= 1
                if bracket_count == 0:
                    return text[start:i+1]
        
        # 方法 3: 如果都失敗，返回原始文本
        return text.strip()
    
    def classify(
        self, 
        user_input: str,
        last_agent_name: str = "None",
        last_agent_message: str = ""
    ) -> dict:
        """
        分類學生輸入
        
        Args:
            user_input: 學生的輸入
            last_agent_name: 上一個活躍的 agent 名稱
            last_agent_message: 上一個 agent 的訊息
            
        Returns:
            dict: 包含 reasoning 和 next_action 的字典
        """
        prompt = self.system_prompt.format(
            last_agent_name=last_agent_name,
            last_agent_message=last_agent_message,
            user_input=user_input
        )
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                )
            )
            
            # 提取並解析 JSON
            json_text = self._extract_json(response.text)
            result = json.loads(json_text)
            
            # 驗證回應格式
            if "next_action" not in result:
                raise ValueError("分類結果缺少 next_action 欄位")
            
            if "context_summary" not in result:
                # 如果沒有 context_summary，提供預設值
                result["context_summary"] = "無法生成上下文摘要"
            
            # 驗證分類結果是否合法
            valid_actions = ["OPERATOR_SUPPORT", "CER_COGNITIVE_SUPPORT", "CONTINUE_CONVERSATION"]
            if result["next_action"] not in valid_actions:
                raise ValueError(f"無效的分類結果: {result['next_action']}")
            
            return result
            
        except json.JSONDecodeError as e:
            # 預設回傳 OPERATOR_SUPPORT
            return {
                "reasoning": "JSON 解析失敗，預設為介面支援",
                "next_action": "OPERATOR_SUPPORT",
                "context_summary": "無法生成上下文摘要（JSON 解析失敗）"
            }
        except Exception as e:
            # 預設回傳 OPERATOR_SUPPORT
            return {
                "reasoning": f"發生錯誤: {str(e)}",
                "next_action": "OPERATOR_SUPPORT",
                "context_summary": "無法生成上下文摘要（發生錯誤）"
            }
