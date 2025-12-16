from typing import TypedDict, Literal
from langgraph.graph import StateGraph, END
from .classifier import IntentClassifier
from .agents import SubLLMManager


class ConversationState(TypedDict):
    """對話狀態"""
    user_input: str  # 學生當前輸入
    conversation_history: list  # 對話歷史
    last_active_agent: str  # 上一個活躍的 agent
    last_agent_message: str  # 上一個 agent 的訊息
    classification: dict  # 分類結果
    final_response: str  # 最終回應
    routed_agent: str  # 實際路由到的 agent


class ConversationGraph:    
    def __init__(self):
        """初始化對話流程圖"""
        self.classifier = IntentClassifier()
        self.sub_llm_manager = SubLLMManager()
        self.graph = self._build_graph()
    
    def _classify_intent(self, state: ConversationState) -> ConversationState:
        """步驟 1: 分類學生意圖"""
        classification = self.classifier.classify(
            user_input=state["user_input"],
            conversation_history=state.get("conversation_history", []),
            last_agent_name=state.get("last_active_agent", "None"),
            last_agent_message=state.get("last_agent_message", "")
        )
        
        state["classification"] = classification
        return state
    
    def _route_to_agent(self, state: ConversationState) -> ConversationState:
        """步驟 2: 決定路由目標"""
        intent = state["classification"]["next_action"]
        
        if intent == "continue_conversation":
            # 延續對話:路由回上一個活躍的 agent
            routed_agent = state.get("last_active_agent", "cer_cognitive_support")
        else:
            # 新問題:路由到對應的 agent
            routed_agent = intent
        
        state["routed_agent"] = routed_agent
        return state
    
    def _process_request(self, state: ConversationState) -> ConversationState:
        """步驟 3: 處理學生請求"""
        agent = self.sub_llm_manager.get_agent(state["routed_agent"])
        
        # 傳遞上下文摘要和對話歷史
        response = agent.process(
            user_input=state["user_input"],
            conversation_history=state.get("conversation_history", []),
            context_summary=state["classification"].get("context_summary", "")
        )
        
        state["final_response"] = response
        
        # 更新活躍 agent 和最後訊息
        state["last_active_agent"] = state["routed_agent"]
        state["last_agent_message"] = response
        
        # 更新對話歷史
        if "conversation_history" not in state:
            state["conversation_history"] = []
        
        state["conversation_history"].append({
            "role": "user",
            "content": state["user_input"]
        })
        state["conversation_history"].append({
            "role": "assistant",
            "content": response,
            "agent": state["routed_agent"]
        })
        
        return state
    
    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(ConversationState)
        
        workflow.add_node("classify", self._classify_intent)
        workflow.add_node("route", self._route_to_agent)
        workflow.add_node("process", self._process_request)
        
        workflow.set_entry_point("classify")
        workflow.add_edge("classify", "route")
        workflow.add_edge("route", "process")
        workflow.add_edge("process", END)
        
        return workflow.compile()
    
    def process_message(
        self,
        user_input: str,
        conversation_history: list = None,
        last_active_agent: str = None,
        last_agent_message: str = ""
    ) -> dict:
        """
        處理學生訊息
        
        Args:
            user_input: 學生輸入
            conversation_history: 對話歷史
            last_active_agent: 上一個活躍的 agent
            last_agent_message: 上一個 agent 的訊息
            
        Returns:
            dict: 包含處理結果的狀態
        """
        initial_state = {
            "user_input": user_input,
            "conversation_history": conversation_history or [],
            "last_active_agent": last_active_agent or "None",
            "last_agent_message": last_agent_message or "",
            "classification": {},
            "final_response": "",
            "routed_agent": ""
        }
        
        final_state = self.graph.invoke(initial_state)
        
        return final_state
