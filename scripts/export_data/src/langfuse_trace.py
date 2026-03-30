import json
import re

from langfuse import get_client

_langfuse_client = None

TARGET_ACTION_TYPES = {"chat_in_mindmap", "chat_in_essay", "ai_feedback_shown"}


def _get_client():
    global _langfuse_client
    if _langfuse_client is None:
        _langfuse_client = get_client()
    return _langfuse_client


def _strip_markdown_codeblock(text: str) -> str:
    stripped = text.strip()
    match = re.match(r"^```(?:json)?\s*\n?(.*?)\n?\s*```$", stripped, re.DOTALL)
    if match:
        return match.group(1).strip()
    return stripped


def _parse_json_safe(text: str):
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return text


def _find_target_generation(observations: list[dict]) -> dict | None:
    for obs in observations:
        if obs.get("type") == "GENERATION" and obs.get("name", "").endswith("Agent"):
            return obs
    return None


def _extract_user_content(generation_input) -> str | None:
    if not isinstance(generation_input, list):
        return None
    for msg in generation_input[::-1]:
        if msg.get("role") == "user":
            return msg.get("content")
    return None


def _extract_standard_agent(generation: dict) -> dict:
    raw_input = _extract_user_content(generation.get("input"))
    input_dict = _parse_json_safe(raw_input) if raw_input else None

    raw_output = generation.get("output", {})
    output_content = (
        raw_output.get("content", "") if isinstance(raw_output, dict) else ""
    )
    cleaned_output = _strip_markdown_codeblock(output_content)
    output_dict = _parse_json_safe(cleaned_output)

    query = input_dict.get("query", "") if isinstance(input_dict, dict) else ""
    final_response = (
        output_dict.get("final_response", "") if isinstance(output_dict, dict) else ""
    )

    return {
        "agent_name": generation.get("name", ""),
        "query": query,
        "final_response": final_response,
        "llm_input": input_dict,
        "llm_output": output_dict,
    }


def _extract_scoring_agent(generation: dict, trace_input, trace_output) -> dict:
    raw_user_content = _extract_user_content(generation.get("input"))

    if "Scoring" in generation.get("name", "") and "Essay" in generation.get(
        "name", ""
    ):
        parsed_content = raw_user_content
    else:
        parsed_content = (
            _parse_json_safe(raw_user_content) if raw_user_content else raw_user_content
        )

    composed_input = {
        "query": trace_input if trace_input else "",
        "content": parsed_content,
    }

    raw_output = generation.get("output", {})
    output_content = (
        raw_output.get("content", "") if isinstance(raw_output, dict) else ""
    )
    cleaned_output = _strip_markdown_codeblock(output_content)
    parsed_output = _parse_json_safe(cleaned_output)

    composed_output = {"final_response": parsed_output}

    if isinstance(trace_output, dict):
        final_response = json.dumps(trace_output, ensure_ascii=False)
    elif trace_output is not None:
        final_response = str(trace_output)
    else:
        final_response = ""

    return {
        "agent_name": generation.get("name", ""),
        "query": str(trace_input) if trace_input else "",
        "final_response": final_response,
        "llm_input": composed_input,
        "llm_output": composed_output,
    }


def extract_trace_data(trace_id: str) -> dict | None:
    try:
        client = _get_client()
        trace = client.api.trace.get(trace_id)
    except Exception as e:
        print(f"  [Langfuse] 無法取得 trace {trace_id}: {e}")
        return None

    observations = trace.observations if hasattr(trace, "observations") else []
    obs_dicts = []
    for obs in observations:
        if hasattr(obs, "dict"):
            obs_dicts.append(obs.dict())
        elif hasattr(obs, "model_dump"):
            obs_dicts.append(obs.model_dump())
        elif isinstance(obs, dict):
            obs_dicts.append(obs)

    generation = _find_target_generation(obs_dicts)
    if generation is None:
        print(f"  [Langfuse] trace {trace_id} 中未找到目標 GENERATION observation")
        return None

    agent_name = generation.get("name", "")
    is_scoring = "Scoring" in agent_name

    if is_scoring:
        trace_input = trace.input if hasattr(trace, "input") else None
        trace_output = trace.output if hasattr(trace, "output") else None
        return _extract_scoring_agent(generation, trace_input, trace_output)
    else:
        return _extract_standard_agent(generation)
