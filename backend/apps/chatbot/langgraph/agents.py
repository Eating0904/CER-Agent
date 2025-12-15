from pathlib import Path
from google import genai
from google.genai import types


class SubLLMAgent:
    """子 LLM 代理,處理特定類型的學生請求"""
    
    def __init__(self, api_key: str, agent_type: str):
        """
        初始化子 LLM 代理
        
        Args:
            api_key: Google Gemini API Key
            agent_type: 代理類型 ("UI_SUPPORT" 或 "PEDAGOGICAL_SUPPORT")
        """
        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-2.5-pro"
        self.agent_type = agent_type
        
        # 讀取對應的 prompt
        prompt_filename = "operator_support_prompt.md" if agent_type == "OPERATOR_SUPPORT" else "cer_cognitive_support_prompt.md"
        prompt_path = Path(__file__).parent / "prompts" / prompt_filename
        
        with open(prompt_path, 'r', encoding='utf-8') as f:
            self.system_prompt = f.read()
    
    def process(self, user_input: str, conversation_history: list = None, context_summary: str = "") -> str:
        """
        處理學生輸入
        
        Args:
            user_input: 學生的輸入
            conversation_history: 對話歷史 (list of dicts with 'role' and 'content')
            context_summary: Classifier 提供的上下文摘要
            
        Returns:
            str: LLM 的回應
        """
        if conversation_history is None:
            conversation_history = []
        
        history_text = self._format_history(conversation_history)
        
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
    
    def _format_history(self, conversation_history: list) -> str:
        """格式化對話歷史為文字（標記 agent 身份）"""
        if not conversation_history:
            return "無對話歷史"
        
        formatted = []
        for msg in conversation_history[-50:]:
            role = msg.get("role", "")
            content = msg.get("content", "")
            
            if role == "user":
                formatted.append(f"學生: {content}")
            elif role == "operator_support":
                formatted.append(f"操作助手: {content}")
            elif role == "cer_cognitive_support":
                formatted.append(f"CER 教練: {content}")
            else:
                formatted.append(f"助手: {content}")
        
        return "\n".join(formatted)


class SubLLMManager:
    """管理多個子 LLM 代理"""
    
    def __init__(self, api_key: str):
        """
        初始化子 LLM 管理器
        
        Args:
            api_key: Google Gemini API Key
        """
        self.agents = {
            "OPERATOR_SUPPORT": SubLLMAgent(api_key, "OPERATOR_SUPPORT"),
            "CER_COGNITIVE_SUPPORT": SubLLMAgent(api_key, "CER_COGNITIVE_SUPPORT")
        }
    
    def get_agent(self, agent_type: str) -> SubLLMAgent:
        """
        取得指定類型的代理
        
        Args:
            agent_type: 代理類型
            
        Returns:
            SubLLMAgent: 對應的代理
        """
        if agent_type not in self.agents:
            raise ValueError(f"未知的代理類型: {agent_type}")
        
        return self.agents[agent_type]
