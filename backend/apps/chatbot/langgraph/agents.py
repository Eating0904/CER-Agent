from pathlib import Path
from google import genai
from google.genai import types
from ..utils.conversation_formatters import format_history_for_display


class SubLLMAgent:
    """處理特定類型的學生請求"""
    
    def __init__(self, agent_type: str):
        from ..utils.gemini_client import get_gemini_client, DEFAULT_MODEL_NAME
        self.client = get_gemini_client()
        self.model_name = DEFAULT_MODEL_NAME
        self.agent_type = agent_type
        
        prompt_filename = f"{agent_type}_prompt.md"
        prompt_path = Path(__file__).parent / "prompts" / prompt_filename
        
        with open(prompt_path, 'r', encoding='utf-8') as f:
            self.system_prompt = f.read()
    
    def process(self, user_input: str, conversation_history: list = None, context_summary: str = "") -> str:
        if conversation_history is None:
            conversation_history = []
        
        history_text = format_history_for_display(conversation_history)
        
        prompt = self.system_prompt.format(
            context_summary=context_summary if context_summary else "這是學生的第一個問題，沒有之前的對話歷史。",
            user_input=user_input,
            conversation_history=history_text
        )
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.5,
                )
            )
            
            return response.text
            
        except Exception as e:
            return f"抱歉,我遇到了一些技術問題。錯誤訊息: {str(e)}"


class SubLLMManager:
    
    def __init__(self):
        self.agents = {
            "operator_support": SubLLMAgent("operator_support"),
            "cer_cognitive_support": SubLLMAgent("cer_cognitive_support")
        }
    
    def get_agent(self, agent_type: str) -> SubLLMAgent:
        if agent_type not in self.agents:
            raise ValueError(f"未知的代理類型: {agent_type}")
        
        return self.agents[agent_type]
