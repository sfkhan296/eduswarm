from crewai import Task, Agent

LEARNER_ANALYSIS_OUTPUT_TEMPLATE = """
Return a JSON object with these exact keys:
{
  "level": "<child|teen|professional>",
  "reasoning": "<one sentence explaining the classification>",
  "detected_language": "<ISO 639-1 language code, e.g. 'en', 'hi', 'es', 'fr', 'ar'>"
}
"""


def build_learner_analysis_task(agent: Agent, prompt: str) -> Task:
    return Task(
        description=(
            f"Analyze the following learning prompt and classify the learner.\n\n"
            f"Prompt: {prompt}\n\n"
            f"Also detect what language the prompt is written in.\n\n"
            f"Return ONLY valid JSON matching this schema:\n"
            f"{LEARNER_ANALYSIS_OUTPUT_TEMPLATE}"
        ),
        expected_output="A JSON object with 'level', 'reasoning', and 'detected_language' keys.",
        agent=agent,
    )
