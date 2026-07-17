from crewai import Task
from crewai import Agent

LEARNER_ANALYSIS_OUTPUT_TEMPLATE = """
Return a JSON object with these exact keys:
{
  "level": "<child|teen|professional>",
  "reasoning": "<one sentence explaining the classification>"
}
"""


def build_learner_analysis_task(agent: Agent, prompt: str) -> Task:
    return Task(
        description=(
            f"Analyze the following learning prompt and classify the learner.\n\n"
            f"Prompt: {prompt}\n\n"
            f"Return ONLY valid JSON matching this schema:\n"
            f"{LEARNER_ANALYSIS_OUTPUT_TEMPLATE}"
        ),
        expected_output="A JSON object with 'level' and 'reasoning' keys.",
        agent=agent,
    )
